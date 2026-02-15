import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  Link2,
  Code2,
  ArrowLeft,
  ExternalLink,
  Wand2,
  CheckCircle2,
  Edit3,
  Eye,
  Trash2,
  RefreshCw,
  Radar,
  ArrowRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PUBLIC_PAGES_BASE_URL } from "@/lib/constants";
import BackRedirectSection from "@/components/trustpage/editor/BackRedirectSection";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ReplacedLink {
  original: string;
  new: string;
}

interface ClonedPageData {
  id: string;
  slug: string;
  page_name: string;
  source_url: string;
  head_code: string | null;
  links: ReplacedLink[];
  is_published: boolean;
  views: number;
}

interface UserProfile {
  plan_type: string;
  subscription_status: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Supabase Edge Function URL for proxy
const PROXY_URL = `https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/serve-proxy`;

/** Parse HTML and extract unique <a href="..."> links, filtering out noise */
function extractLinksFromHtml(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const anchors = doc.querySelectorAll("a[href]");
  const seen = new Set<string>();
  const results: string[] = [];

  const skipPatterns = /\.(css|js|png|jpg|jpeg|gif|svg|webp|avif|bmp|ico|woff|woff2|ttf|otf|mp4|webm|ogg|mp3|wav|pdf|zip|rar|xml)\b/i;

  anchors.forEach((a) => {
    const href = a.getAttribute("href")?.trim();
    if (!href) return;
    if (href.startsWith("#")) return;
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:") || href.startsWith("whatsapp:")) return;
    if (skipPatterns.test(href)) return;
    // Deduplicate
    if (seen.has(href)) return;
    seen.add(href);
    results.push(href);
  });

  return results;
}

const ClonedPageEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState<ClonedPageData | null>(null);

  const [pageName, setPageName] = useState("");
  const [links, setLinks] = useState<ReplacedLink[]>([]);
  const [headCode, setHeadCode] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [backRedirectEnabled, setBackRedirectEnabled] = useState(false);
  const [backRedirectUrl, setBackRedirectUrl] = useState("");

  const [activeTab, setActiveTab] = useState("links");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Link Radar state
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarScanned, setRadarScanned] = useState(false);
  const [linkFilter, setLinkFilter] = useState("");

  // Fetch profile and page data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("plan_type, subscription_status, full_name, avatar_url")
          .eq("id", user.id)
          .single();

        setProfile(profileData);

        const { data: pageResult, error: pageError } = await supabase
          .from("cloned_pages")
          .select("id, slug, page_name, source_url, head_code, links, is_published, views, back_redirect_enabled, back_redirect_url")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (pageError) throw pageError;

        if (!pageResult) {
          toast.error("Página não encontrada");
          navigate("/dashboard");
          return;
        }

        let parsedLinks: ReplacedLink[] = [];
        if (pageResult.links && Array.isArray(pageResult.links)) {
          parsedLinks = (
            pageResult.links as Array<{ href?: string; newHref?: string; original?: string; new?: string }>
          )
            .map((l) => ({
              original: l.original || l.href || "",
              new: l.new || l.newHref || "",
            }))
            .filter((l) => l.original && !['__GLOBAL__', '*', '__ALL__'].includes(l.original));
        }

        setPageData({
          ...pageResult,
          links: parsedLinks,
        });
        setPageName(pageResult.page_name);
        setLinks(parsedLinks);
        setHeadCode(pageResult.head_code || "");
        setIsPublished(pageResult.is_published);
        setBackRedirectEnabled(pageResult.back_redirect_enabled || false);
        setBackRedirectUrl(pageResult.back_redirect_url || "");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erro ao carregar a página");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, id, navigate]);

  // Fetch preview HTML
  const fetchPreviewHtml = useCallback(async () => {
    if (!pageData?.slug || !isPublished) return;
    
    setPreviewLoading(true);
    try {
      const response = await fetch(`${PROXY_URL}?slug=${encodeURIComponent(pageData.slug)}`);
      if (response.ok) {
        const html = await response.text();
        setPreviewHtml(html);
      }
    } catch (error) {
      console.error('[ClonedPageEditor] Preview fetch error:', error);
    } finally {
      setPreviewLoading(false);
    }
  }, [pageData?.slug, isPublished]);

  useEffect(() => {
    if (isPublished && pageData?.slug) {
      fetchPreviewHtml();
    }
  }, [isPublished, pageData?.slug, previewKey, fetchPreviewHtml]);

  // ── Link Radar: fetch original page HTML and extract links ──
  const handleScanLinks = useCallback(async () => {
    if (!pageData?.source_url) return;
    setRadarLoading(true);
    try {
      // Fetch original page via proxy (without link replacements — we use source_url directly is not possible due to CORS, so we use the proxy which applies replacements, but we parse pre-replacement from original)
      // Actually, we fetch the source directly via our proxy by slug, but we need raw HTML.
      // Better approach: fetch the source_url via a lightweight edge function or just use the proxy response (which has base tag but links are original if no rules set yet)
      // Simplest: fetch the page source through our proxy — if no link rules are saved, the HTML will have original links
      // For reliability, let's just fetch the source page through our existing proxy
      const response = await fetch(`${PROXY_URL}?slug=${encodeURIComponent(pageData.slug)}`);
      if (!response.ok) throw new Error("Erro ao buscar página");
      const html = await response.text();
      const foundLinks = extractLinksFromHtml(html);
      setDetectedLinks(foundLinks);
      setRadarScanned(true);
      if (foundLinks.length === 0) {
        toast.info("Nenhum link externo encontrado na página.");
      } else {
        toast.success(`${foundLinks.length} links encontrados!`);
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Erro ao escanear links da página.");
    } finally {
      setRadarLoading(false);
    }
  }, [pageData?.source_url, pageData?.slug]);

  const handleAddLinkFromRadar = (originalUrl: string) => {
    // Check if already mapped
    if (links.some((l) => l.original === originalUrl)) {
      toast.info("Este link já está na lista de substituições.");
      return;
    }
    setLinks((prev) => [...prev, { original: originalUrl, new: "" }]);
    toast.success("Link adicionado! Cole o link de destino.");
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: "original" | "new", value: string) => {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  };

  const handleRefreshPreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  const handleSaveAndPublish = async () => {
    if (!pageData || !user) return;

    const trimmedName = pageName.trim();
    if (!trimmedName) {
      toast.error("Digite um nome para a página");
      return;
    }

    setSaving(true);

    try {
      const validLinks = links.filter((l) => l.original.trim() && l.new.trim()).map((l) => ({ original: l.original, new: l.new }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from("cloned_pages")
        .update({
          page_name: trimmedName,
          head_code: headCode || null,
          links: validLinks as any,
          is_published: true,
          html_content: "",
          back_redirect_enabled: backRedirectEnabled,
          back_redirect_url: backRedirectUrl || null,
        })
        .eq("id", pageData.id);

      if (error) throw error;

      setIsPublished(true);
      handleRefreshPreview();
      toast.success("Página salva e publicada! As alterações já estão ativas.");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erro ao salvar página. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const getPublicUrl = () => {
    if (!pageData?.slug) return "";
    return `${PUBLIC_PAGES_BASE_URL}/c/${pageData.slug}`;
  };

  // Filter detected links
  const filteredDetectedLinks = detectedLinks.filter((url) => {
    if (!linkFilter.trim()) return true;
    return url.toLowerCase().includes(linkFilter.toLowerCase());
  });

  // Links already mapped (to grey them out in radar)
  const mappedOriginals = new Set(links.map((l) => l.original));

  if (loading) {
    return (
      <DashboardLayout avatarUrl={profile?.avatar_url} fullName={profile?.full_name}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!pageData) {
    return null;
  }

  return (
    <DashboardLayout avatarUrl={profile?.avatar_url} fullName={profile?.full_name}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Editor de Página Clonada
            </h1>
            <p className="text-muted-foreground text-sm">{pageData.source_url}</p>
          </div>
        </div>

        {/* Editor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview via Proxy */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Preview (Tempo Real)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleRefreshPreview} title="Atualizar preview">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                    className={previewMode === "desktop" ? "bg-muted" : ""}
                  >
                    Desktop
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                    className={previewMode === "mobile" ? "bg-muted" : ""}
                  >
                    Mobile
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className={`bg-muted/30 flex items-start justify-center overflow-auto ${
                  previewMode === "mobile" ? "p-4" : ""
                }`}
                style={{ height: "calc(100vh - 320px)", minHeight: "500px" }}
              >
                {isPublished ? (
                  previewLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      srcDoc={previewHtml}
                      title="Preview"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation"
                      className={`border-0 ${
                        previewMode === "mobile" ? "w-[375px] rounded-lg shadow-xl bg-white" : "w-full h-full bg-white"
                      }`}
                      style={previewMode === "mobile" ? { height: "calc(100vh - 360px)" } : {}}
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Eye className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Salve e publique para ver o preview em tempo real</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      O preview mostra a página exatamente como seus visitantes verão
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Editor Sidebar */}
          <Card>
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Configurações</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveAndPublish}
                    disabled={saving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                    )}
                    Salvar e Publicar
                  </Button>
                  {isPublished && (
                    <Button variant="outline" size="sm" onClick={() => window.open(getPublicUrl(), "_blank")}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Abrir
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Page Name */}
              <div className="p-4 border-b space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Nome da Página</Label>
                  <Input
                    placeholder="Ex: Minha Página de Vendas"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                  />
                </div>
                {isPublished && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>
                      Disponível em: {PUBLIC_PAGES_BASE_URL}/c/{pageData.slug}
                    </span>
                  </div>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full rounded-none border-b h-auto p-0">
                  <TabsTrigger
                    value="links"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Links
                  </TabsTrigger>
                  <TabsTrigger
                    value="radar"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
                  >
                    <Radar className="w-4 h-4 mr-2" />
                    Radar
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Código
                  </TabsTrigger>
                </TabsList>

                {/* ─── Tab: Links (Mapeamentos De → Para) ─── */}
                <TabsContent value="links" className="m-0">
                  <ScrollArea style={{ height: "calc(100vh - 580px)", minHeight: "250px" }}>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Substituições de Links</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Mapeamento exato: De → Para</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setLinks((prev) => [...prev, { original: "", new: "" }])}>
                          + Manual
                        </Button>
                      </div>

                      {links.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                          <Link2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p>Nenhuma substituição configurada.</p>
                          <p className="text-xs mt-1">
                            Use a aba <strong>Radar</strong> para detectar os links da página ou adicione manualmente.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            onClick={() => setActiveTab("radar")}
                          >
                            <Radar className="w-3.5 h-3.5 mr-1" />
                            Abrir Radar de Links
                          </Button>
                        </div>
                      ) : (
                        links.map((link, index) => (
                          <div key={index} className="border rounded-lg p-3 space-y-2 bg-background">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                #{index + 1}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveLink(index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">De (Link Original)</Label>
                              <Input
                                placeholder="https://checkout-produtor.com/..."
                                value={link.original}
                                onChange={(e) => handleLinkChange(index, "original", e.target.value)}
                                className="text-sm mt-1 font-mono text-xs"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Para (Seu Link)</Label>
                              <Input
                                placeholder="https://seu-link-afiliado.com/..."
                                value={link.new}
                                onChange={(e) => handleLinkChange(index, "new", e.target.value)}
                                className="text-sm mt-1"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* ─── Tab: Radar de Links ─── */}
                <TabsContent value="radar" className="m-0">
                  <ScrollArea style={{ height: "calc(100vh - 580px)", minHeight: "250px" }}>
                    <div className="p-4 space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Radar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Radar de Links</p>
                            <p className="text-xs text-muted-foreground">
                              Escaneia a página e detecta todos os links clicáveis para você escolher quais substituir.
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleScanLinks}
                          disabled={radarLoading}
                          className="w-full"
                          variant={radarScanned ? "outline" : "default"}
                        >
                          {radarLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Radar className="w-4 h-4 mr-2" />
                          )}
                          {radarScanned ? "Escanear Novamente" : "Escanear Links da Página"}
                        </Button>
                      </div>

                      {radarScanned && detectedLinks.length > 0 && (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Filtrar links..."
                                value={linkFilter}
                                onChange={(e) => setLinkFilter(e.target.value)}
                                className="pl-8 text-sm h-8"
                              />
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {filteredDetectedLinks.length} links
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {filteredDetectedLinks.map((url, i) => {
                              const alreadyMapped = mappedOriginals.has(url);
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${
                                    alreadyMapped ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "bg-background hover:bg-muted/50"
                                  }`}
                                >
                                  <span className="flex-1 font-mono break-all text-[11px] leading-relaxed">
                                    {url}
                                  </span>
                                  {alreadyMapped ? (
                                    <Badge variant="outline" className="shrink-0 text-green-600 border-green-300 text-[10px]">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Mapeado
                                    </Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="shrink-0 h-7 text-xs"
                                      onClick={() => handleAddLinkFromRadar(url)}
                                    >
                                      + Substituir
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {radarScanned && detectedLinks.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          <p>Nenhum link externo encontrado.</p>
                          <p className="text-xs mt-1">A página pode não ter links de botão ou CTA.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* ─── Tab: Código ─── */}
                <TabsContent value="code" className="m-0 p-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Scripts do Head (Pixel/GTM)</Label>
                      <Textarea
                        placeholder={`<!-- Cole aqui seu código do Facebook Pixel, Google Tag Manager, etc. -->\n<script>...</script>`}
                        value={headCode}
                        onChange={(e) => setHeadCode(e.target.value)}
                        className="font-mono text-xs min-h-[200px]"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Este código será injetado antes do fechamento da tag &lt;/head&gt;
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Back Redirect Section */}
              <div className="border-t">
                <TooltipProvider>
                  <Accordion type="single" collapsible>
                    <BackRedirectSection
                      enabled={backRedirectEnabled}
                      url={backRedirectUrl}
                      onEnabledChange={setBackRedirectEnabled}
                      onUrlChange={setBackRedirectUrl}
                      asAccordion={true}
                    />
                  </Accordion>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClonedPageEditor;
