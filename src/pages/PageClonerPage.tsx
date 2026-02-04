import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Copy, 
  Loader2, 
  Link2, 
  Code2, 
  ArrowLeft,
  Download,
  ExternalLink,
  RefreshCw,
  Wand2,
  Crown,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Replace,
  Eye,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

interface CloneResult {
  html: string;
  sourceUrl: string;
  links: ExtractedLink[];
  metadata: {
    title: string;
    linksCount: number;
    size: number;
  };
}

interface UserProfile {
  plan_type: string;
  subscription_status: string;
  full_name: string | null;
  avatar_url: string | null;
}

const CLONING_STEPS = [
  "Conectando ao servidor...",
  "Buscando página...",
  "Baixando assets...",
  "Reescrevendo caminhos...",
  "Corrigindo mixed content...",
  "Otimizando HTML...",
  "Finalizando..."
];

// Função robusta para substituir links no HTML usando parsing seguro
function replaceLinksInHtml(html: string, links: ExtractedLink[]): string {
  // Criar mapa de substituições (href original -> novo href)
  const replacements = new Map<string, string>();
  
  links.forEach(link => {
    if (link.newHref && link.newHref !== link.href && link.newHref.trim()) {
      replacements.set(link.href, link.newHref);
    }
  });
  
  if (replacements.size === 0) return html;
  
  // Usar abordagem mais segura: substituir apenas href="..." patterns exatos
  let result = html;
  
  replacements.forEach((newHref, originalHref) => {
    // Escapar caracteres especiais do regex na URL original
    const escapedHref = originalHref
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Substituir href="original" por href="novo" de forma segura
    // Matches: href="url", href='url', href=url (sem aspas)
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

// Gerar slug único a partir do título
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
  
  return `${base}-${Date.now().toString(36)}`;
}

const PageClonerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cloningStep, setCloningStep] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [targetUrl, setTargetUrl] = useState("");
  const [cloneResult, setCloneResult] = useState<CloneResult | null>(null);
  const [editedHtml, setEditedHtml] = useState("");
  const [links, setLinks] = useState<ExtractedLink[]>([]);
  const [headCode, setHeadCode] = useState("");
  const [globalLinkReplace, setGlobalLinkReplace] = useState("");
  const [pageName, setPageName] = useState("");
  
  const [activeTab, setActiveTab] = useState("links");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("plan_type, subscription_status, full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        
        // Check if free plan
        const allowedPlans = ['essential', 'essential_yearly', 'pro', 'pro_yearly', 'elite'];
        if (!allowedPlans.includes(data.plan_type) || data.subscription_status !== 'active') {
          setShowPaywall(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Animate cloning steps
  useEffect(() => {
    if (!cloning) {
      setCloningStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCloningStep(prev => {
        if (prev >= CLONING_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [cloning]);

  // Gerar HTML final com substituições
  const getFinalHtml = useCallback(() => {
    if (!editedHtml) return "";
    
    let finalHtml = editedHtml;
    
    // Aplicar substituições de links de forma segura
    finalHtml = replaceLinksInHtml(finalHtml, links);
    
    // Injetar código customizado no head
    if (headCode.trim()) {
      finalHtml = finalHtml.replace('</head>', `${headCode}\n</head>`);
    }
    
    return finalHtml;
  }, [editedHtml, links, headCode]);

  // Update iframe when HTML changes
  const updatePreview = useCallback(() => {
    if (!iframeRef.current || !editedHtml) return;
    
    const finalHtml = getFinalHtml();
    
    // Write to iframe
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(finalHtml);
      doc.close();
    }
  }, [editedHtml, getFinalHtml]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleClone = async () => {
    if (!targetUrl.trim()) {
      toast.error("Digite uma URL para clonar");
      return;
    }

    // Validate URL format
    let formattedUrl = targetUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setCloning(true);
    setCloningStep(0);
    setCloneResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('clone-page', {
        body: { url: formattedUrl }
      });

      if (error) throw error;

      if (data.error === 'PAYWALL') {
        setShowPaywall(true);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCloneResult(data);
      setEditedHtml(data.html);
      setLinks(data.links.map((l: ExtractedLink) => ({ ...l, newHref: l.href })));
      setPageName(data.metadata.title || 'Página Clonada');
      toast.success(`Página clonada! ${data.metadata.linksCount} links encontrados.`);
      
    } catch (error) {
      console.error("Clone error:", error);
      toast.error("Erro ao clonar página. Tente novamente.");
    } finally {
      setCloning(false);
    }
  };

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
    if (!cloneResult || !user) return;
    
    const trimmedName = pageName.trim();
    if (!trimmedName) {
      toast.error("Digite um nome para a página");
      return;
    }
    
    setSaving(true);
    
    try {
      const finalHtml = getFinalHtml();
      const slug = generateSlug(trimmedName);
      
      // Salvar na tabela dedicada de páginas clonadas
      const linksJson = links.map(l => ({
        text: l.text,
        href: l.href,
        selector: l.selector,
        newHref: l.newHref || l.href
      }));
      
      const { error } = await supabase
        .from('cloned_pages')
        .insert([{
          user_id: user.id,
          slug,
          page_name: trimmedName,
          source_url: cloneResult.sourceUrl,
          html_content: finalHtml,
          head_code: headCode || null,
          links: linksJson,
          is_published: false
        }]);
      
      if (error) {
        if (error.code === '23505') {
          toast.error("Já existe uma página com esse slug. Tente um nome diferente.");
        } else {
          throw error;
        }
        return;
      }
      
      toast.success("Página salva com sucesso!");
      navigate(`/dashboard`);
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erro ao salvar página. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!editedHtml) return;
    
    const finalHtml = getFinalHtml();
    
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clone-${Date.now()}.html`;
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

  return (
    <DashboardLayout avatarUrl={profile?.avatar_url} fullName={profile?.full_name}>
      {/* Paywall Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center pb-2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 relative">
              <Copy className="w-10 h-10 text-primary" />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold">
              Clonador de Páginas
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Clone qualquer página de vendas e personalize com seus próprios links e textos!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Clone páginas de vendas de alta conversão</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Substitua links de checkout automaticamente</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Edite textos e imagens diretamente</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Injete seu próprio Pixel/GTM/Scripts</span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">Disponível a partir do Plano Essencial</p>
                <p className="text-sm text-muted-foreground">R$ 39,90/mês ou R$ 19,90 no 1º mês</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button 
              className="w-full gradient-button font-bold"
              onClick={() => navigate('/assinatura')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Fazer Upgrade Agora
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={() => navigate('/dashboard')}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Clonador de Páginas
            </h1>
            <p className="text-muted-foreground text-sm">
              Clone qualquer página e personalize com seus links
            </p>
          </div>
        </div>

        {/* URL Input Section */}
        {!cloneResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">URL da Página</CardTitle>
              <CardDescription>
                Cole a URL da página que deseja clonar (ex: página de vendas de um concorrente)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="https://exemplo.com/pagina-de-vendas"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    disabled={cloning}
                    onKeyDown={(e) => e.key === 'Enter' && handleClone()}
                  />
                </div>
                <Button 
                  onClick={handleClone} 
                  disabled={cloning || !targetUrl.trim()}
                  className="min-w-[160px]"
                >
                  {cloning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Clonando...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Clonar Página
                    </>
                  )}
                </Button>
              </div>

              {/* Loading Animation */}
              {cloning && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    {CLONING_STEPS.map((step, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 transition-all duration-300 ${
                          index <= cloningStep ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        {index < cloningStep ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : index === cloningStep ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                        )}
                        <span className={`text-sm ${index === cloningStep ? 'text-primary font-medium' : ''}`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Sites com proteção anti-bot (Cloudflare, etc) podem não funcionar. 
                  Respeite os direitos autorais e termos de uso dos sites clonados.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editor Section */}
        {cloneResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Preview</span>
                    <Badge variant="secondary" className="text-xs">
                      {cloneResult.metadata.title}
                    </Badge>
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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setCloneResult(null);
                        setEditedHtml("");
                        setLinks([]);
                        setPageName("");
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Page Name Input */}
                <div className="p-4 border-b">
                  <Label className="text-sm font-medium mb-2 block">Nome da Página</Label>
                  <Input
                    placeholder="Ex: Minha Página de Vendas"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                  />
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
                    <ScrollArea style={{ height: 'calc(100vh - 520px)', minHeight: '300px' }}>
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
                    <ScrollArea style={{ height: 'calc(100vh - 520px)', minHeight: '300px' }}>
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
                            className="font-mono text-xs min-h-[200px]"
                          />
                          <p className="text-xs text-muted-foreground">
                            Adicione scripts de rastreamento (Facebook Pixel, Google Tag Manager, etc)
                          </p>
                        </div>

                        {/* Source Info */}
                        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-medium">Fonte Original</p>
                          <a 
                            href={cloneResult.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {cloneResult.sourceUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <p className="text-xs text-muted-foreground mt-2">
                            Tamanho: {(cloneResult.metadata.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PageClonerPage;
