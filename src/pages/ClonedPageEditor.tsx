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
  Replace,
  Eye,
  Plus,
  Trash2,
  RefreshCw,
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

interface ReplacedLink {
  original: string;
  new: string;
}

const GLOBAL_REPLACE_MARKER = "__GLOBAL__";

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
  const [globalLinkReplace, setGlobalLinkReplace] = useState("");
  const [backRedirectEnabled, setBackRedirectEnabled] = useState(false);
  const [backRedirectUrl, setBackRedirectUrl] = useState("");

  const [activeTab, setActiveTab] = useState("links");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0); // For forcing iframe refresh
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Fetch profile and page data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("plan_type, subscription_status, full_name, avatar_url")
          .eq("id", user.id)
          .single();

        setProfile(profileData);

        // Fetch cloned page
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

        // Convert links from old format to new format if needed
        let parsedLinks: ReplacedLink[] = [];
        if (pageResult.links && Array.isArray(pageResult.links)) {
          parsedLinks = (
            pageResult.links as Array<{ href?: string; newHref?: string; original?: string; new?: string }>
          )
            .map((l) => ({
              original: l.original || l.href || "",
              new: l.new || l.newHref || l.original || l.href || "",
            }))
            .filter((l) => l.original);
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

  // Fetch preview HTML (using srcDoc approach to bypass Supabase text/plain limitation)
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

  // Fetch preview when published or previewKey changes
  useEffect(() => {
    if (isPublished && pageData?.slug) {
      fetchPreviewHtml();
    }
  }, [isPublished, pageData?.slug, previewKey, fetchPreviewHtml]);

  const handleAddLink = () => {
    setLinks((prev) => [...prev, { original: "", new: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: "original" | "new", value: string) => {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  };

  const handleGlobalReplace = () => {
    if (!globalLinkReplace.trim()) return;

    const target = globalLinkReplace.trim();

    // If user hasn't configured specific originals yet, enable GLOBAL mode.
    // This matches the UI promise: replace all checkout/button destinations automatically.
    if (links.length === 0) {
      setLinks([{ original: GLOBAL_REPLACE_MARKER, new: target }]);
      toast.success("Substituição global ativada! (links/botões serão redirecionados)");
      return;
    }

    // Otherwise, just set the same destination for all existing rules.
    setLinks((prev) => prev.map((link) => ({ ...link, new: target })));
    toast.success("Todos os destinos foram atualizados!");
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
      // Filter out empty links and convert to JSON-compatible format
      const validLinks = links.filter((l) => l.original.trim()).map((l) => ({ original: l.original, new: l.new }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from("cloned_pages")
        .update({
          page_name: trimmedName,
          head_code: headCode || null,
          links: validLinks as any,
          is_published: true,
          html_content: "", // Clear old HTML content - not used in proxy mode
          back_redirect_enabled: backRedirectEnabled,
          back_redirect_url: backRedirectUrl || null,
        })
        .eq("id", pageData.id);

      if (error) throw error;

      setIsPublished(true);

      // Refresh preview to show updated changes
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
                    value="code"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Código
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="links" className="m-0">
                  <ScrollArea style={{ height: "calc(100vh - 580px)", minHeight: "250px" }}>
                    <div className="p-4 space-y-4">
                      {/* Global Replace */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <Label className="text-xs font-medium flex items-center gap-2">
                          <Replace className="w-3 h-3" />
                          Substituição Global
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://seu-checkout.com/pagar"
                            value={globalLinkReplace}
                            onChange={(e) => setGlobalLinkReplace(e.target.value)}
                            className="text-sm"
                          />
                          <Button size="sm" onClick={handleGlobalReplace}>
                            Aplicar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Se não houver regras abaixo, isso ativa o modo GLOBAL (troca links/botões de checkout automaticamente).
                        </p>
                      </div>

                      {/* Link Replacements */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Substituições de Links</Label>
                          <Button size="sm" variant="outline" onClick={handleAddLink}>
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>

                        {links.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground text-sm">
                            <p>Nenhuma substituição configurada.</p>
                            <p className="text-xs mt-1">Adicione links para trocar checkouts, WhatsApp, etc.</p>
                          </div>
                        ) : (
                          links.map((link, index) => (
                            <div key={index} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Substituição #{index + 1}
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
                                <Label className="text-xs text-muted-foreground">Link Original</Label>
                                <Input
                                  placeholder="https://checkout-produtor.com/..."
                                  value={link.original === GLOBAL_REPLACE_MARKER ? "(GLOBAL)" : link.original}
                                  onChange={(e) => handleLinkChange(index, "original", e.target.value)}
                                  className="text-sm mt-1"
                                  disabled={link.original === GLOBAL_REPLACE_MARKER}
                                />
                                {link.original === GLOBAL_REPLACE_MARKER && (
                                  <p className="text-[11px] text-muted-foreground mt-1">
                                    Modo GLOBAL: o proxy tentará substituir automaticamente links/botões de checkout.
                                  </p>
                                )}
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Novo Link</Label>
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
                    </div>
                  </ScrollArea>
                </TabsContent>

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
