import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Loader2, 
  Link2, 
  Code2, 
  ArrowLeft,
  Download,
  ExternalLink,
  Wand2,
  CheckCircle2,
  Edit3,
  Replace,
  Eye,
  Save,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface ExtractedLink {
  text: string;
  href: string;
  selector: string;
  newHref?: string;
}

interface ClonedPageData {
  id: string;
  slug: string;
  page_name: string;
  source_url: string;
  html_content: string;
  head_code: string | null;
  links: ExtractedLink[];
  is_published: boolean;
  views: number;
}

interface UserProfile {
  plan_type: string;
  subscription_status: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Função robusta para substituir links no HTML
function replaceLinksInHtml(html: string, links: ExtractedLink[]): string {
  const replacements = new Map<string, string>();
  
  links.forEach(link => {
    if (link.newHref && link.newHref !== link.href && link.newHref.trim()) {
      replacements.set(link.href, link.newHref);
    }
  });
  
  if (replacements.size === 0) return html;
  
  let result = html;
  
  replacements.forEach((newHref, originalHref) => {
    const escapedHref = originalHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const patterns = [
      new RegExp(`(href=")${escapedHref}(")`, 'g'),
      new RegExp(`(href=')${escapedHref}(')`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      result = result.replace(pattern, `$1${newHref}$2`);
    });
  });
  
  return result;
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
  const [htmlContent, setHtmlContent] = useState("");
  const [links, setLinks] = useState<ExtractedLink[]>([]);
  const [headCode, setHeadCode] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [globalLinkReplace, setGlobalLinkReplace] = useState("");
  
  const [activeTab, setActiveTab] = useState("links");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

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
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (pageError) throw pageError;

        if (!pageResult) {
          toast.error("Página não encontrada");
          navigate("/dashboard");
          return;
        }

        setPageData({
          ...pageResult,
          links: (pageResult.links as unknown as ExtractedLink[]) || []
        });
        setPageName(pageResult.page_name);
        setHtmlContent(pageResult.html_content);
        setLinks((pageResult.links as unknown as ExtractedLink[]) || []);
        setHeadCode(pageResult.head_code || "");
        setIsPublished(pageResult.is_published);

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

  // Generate final HTML with substitutions
  const getFinalHtml = useCallback(() => {
    if (!htmlContent) return "";
    
    let finalHtml = htmlContent;
    finalHtml = replaceLinksInHtml(finalHtml, links);
    
    if (headCode.trim()) {
      finalHtml = finalHtml.replace('</head>', `${headCode}\n</head>`);
    }
    
    return finalHtml;
  }, [htmlContent, links, headCode]);

  // Update iframe with debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (iframeRef.current && htmlContent) {
        const finalHtml = getFinalHtml();
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(finalHtml);
          doc.close();
        }
      }
    }, 500);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [links, headCode, getFinalHtml]);

  // Immediate update when HTML content changes
  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const finalHtml = getFinalHtml();
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(finalHtml);
        doc.close();
      }
    }
  }, [htmlContent]);

  const handleLinkChange = (index: number, newHref: string) => {
    setLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, newHref } : link
    ));
  };

  const handleGlobalReplace = () => {
    if (!globalLinkReplace.trim()) return;
    
    setLinks(prev => prev.map(link => ({
      ...link,
      newHref: globalLinkReplace
    })));
    
    toast.success("Todos os links atualizados!");
  };

  const handleSave = async () => {
    if (!pageData || !user) return;
    
    const trimmedName = pageName.trim();
    if (!trimmedName) {
      toast.error("Digite um nome para a página");
      return;
    }
    
    setSaving(true);
    
    try {
      const finalHtml = getFinalHtml();
      
      const linksJson = links.map(l => ({
        text: l.text,
        href: l.href,
        selector: l.selector,
        newHref: l.newHref || l.href
      }));
      
      const { error } = await supabase
        .from("cloned_pages")
        .update({
          page_name: trimmedName,
          html_content: finalHtml,
          head_code: headCode || null,
          links: linksJson,
          is_published: isPublished
        })
        .eq("id", pageData.id);
      
      if (error) throw error;
      
      toast.success("Página salva com sucesso!");
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erro ao salvar página. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!htmlContent) return;
    
    const finalHtml = getFinalHtml();
    
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageName || 'clone'}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("HTML baixado!");
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Editar Página Clonada
            </h1>
            <p className="text-muted-foreground text-sm">
              {pageData.source_url}
            </p>
          </div>
        </div>

        {/* Editor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Preview</span>
                </div>
                <div className="flex items-center gap-2">
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
                style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}
              >
                <iframe
                  ref={iframeRef}
                  title="Preview"
                  className={`bg-white border-0 ${
                    previewMode === "mobile" 
                      ? "w-[375px] rounded-lg shadow-xl" 
                      : "w-full h-full"
                  }`}
                  style={previewMode === "mobile" ? { height: 'calc(100vh - 360px)' } : {}}
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </CardContent>
          </Card>

          {/* Editor Sidebar */}
          <Card>
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-1" />
                    HTML
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Page Name & Publish */}
              <div className="p-4 border-b space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Nome da Página</Label>
                  <Input
                    placeholder="Ex: Minha Página de Vendas"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Publicar página</span>
                  </div>
                  <Switch 
                    checked={isPublished} 
                    onCheckedChange={setIsPublished} 
                  />
                </div>
                {isPublished && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Disponível em: /c/{pageData.slug}</span>
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
                    Links ({links.length})
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
                  <ScrollArea style={{ height: 'calc(100vh - 580px)', minHeight: '250px' }}>
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
                          Substitui TODOS os links de uma vez
                        </p>
                      </div>

                      {/* Individual Links */}
                      <div className="space-y-3">
                        {links.map((link, index) => (
                          <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {link.text || `Link ${index + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {link.href}
                                </p>
                              </div>
                              <a 
                                href={link.href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            <Input
                              placeholder="Novo link..."
                              value={link.newHref || ""}
                              onChange={(e) => handleLinkChange(index, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      {links.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum link encontrado</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="code" className="m-0">
                  <ScrollArea style={{ height: 'calc(100vh - 580px)', minHeight: '250px' }}>
                    <div className="p-4 space-y-4">
                      {/* Head Injection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Injetar no &lt;head&gt;
                        </Label>
                        <Textarea
                          placeholder={`<!-- Cole seu Pixel, GTM, etc -->\n<script>\n  // Seu código aqui\n</script>`}
                          value={headCode}
                          onChange={(e) => setHeadCode(e.target.value)}
                          className="font-mono text-xs min-h-[150px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          Adicione scripts de rastreamento (Facebook Pixel, Google Tag Manager, etc)
                        </p>
                      </div>

                      {/* Source Info */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-medium">Fonte Original</p>
                        <a 
                          href={pageData.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {pageData.source_url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-muted-foreground mt-2">
                          Views: {pageData.views}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClonedPageEditor;
