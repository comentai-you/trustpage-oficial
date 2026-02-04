import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Copy, 
  Loader2, 
  ArrowLeft,
  Wand2,
  Crown,
  Lock,
  Sparkles,
  CheckCircle2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface UserProfile {
  plan_type: string;
  subscription_status: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Generate unique slug from URL or title
function generateSlug(input: string): string {
  // Try to extract domain/path from URL
  let base = input;
  try {
    const url = new URL(input);
    base = url.hostname.replace('www.', '') + url.pathname;
  } catch {
    // Not a URL, use as-is
  }
  
  const slug = base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
  
  return `${slug}-${Date.now().toString(36)}`;
}

const PageClonerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [targetUrl, setTargetUrl] = useState("");

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

  const handleCreate = async () => {
    if (!targetUrl.trim()) {
      toast.error("Digite uma URL para clonar");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    // Validate and format URL
    let formattedUrl = targetUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Validate URL format
    try {
      new URL(formattedUrl);
    } catch {
      toast.error("URL inválida. Use uma URL completa (ex: https://exemplo.com)");
      return;
    }

    setCreating(true);

    try {
      // Generate slug and page name
      const slug = generateSlug(formattedUrl);
      const urlObj = new URL(formattedUrl);
      const pageName = urlObj.hostname.replace('www.', '');

      // Simply save to database - NO scraping! The proxy will fetch in real-time
      const { data: newPage, error } = await supabase
        .from('cloned_pages')
        .insert([{
          user_id: user.id,
          slug,
          page_name: pageName,
          source_url: formattedUrl,
          html_content: '', // Not used anymore in proxy architecture
          head_code: null,
          links: [],
          is_published: false
        }])
        .select('id')
        .single();
      
      if (error) {
        if (error.code === '23505') {
          toast.error("Já existe uma página com esse slug. Tente novamente.");
        } else if (error.message?.includes('subscription') || error.message?.includes('plan')) {
          setShowPaywall(true);
        } else {
          throw error;
        }
        return;
      }

      toast.success("Página criada! Redirecionando para o editor...");
      navigate(`/clonadas/${newPage.id}/editar`);
      
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Erro ao criar página. Tente novamente.");
    } finally {
      setCreating(false);
    }
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
              <span>100% fidelidade visual garantida</span>
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

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Clonador de Páginas
            </h1>
            <p className="text-muted-foreground text-sm">
              Clone qualquer página com 100% de fidelidade visual
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Criar Clone Instantâneo
            </CardTitle>
            <CardDescription>
              Cole a URL da página que deseja clonar. O sistema irá espelhar a página em tempo real, 
              garantindo que CSS, imagens e vídeos funcionem perfeitamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="https://exemplo.com/pagina-de-vendas"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                disabled={creating}
                className="text-base"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Ex: página de vendas, landing page, página de captura
              </p>
            </div>

            <Button 
              className="w-full gradient-button font-bold"
              onClick={handleCreate}
              disabled={creating || !targetUrl.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Criar e Personalizar
                </>
              )}
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Como funciona:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>1. Cole a URL da página original</li>
                <li>2. O sistema cria um espelho em tempo real (proxy reverso)</li>
                <li>3. Personalize links, adicione seu Pixel e publique</li>
                <li>4. Compartilhe seu link personalizado</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PageClonerPage;
