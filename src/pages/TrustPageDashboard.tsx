import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Sparkles, ExternalLink, BarChart3, Copy, Trash2, LogOut, Loader2, Crown, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UpgradeModal from "@/components/UpgradeModal";

interface LandingPage {
  id: string;
  page_name: string | null;
  slug: string;
  views: number | null;
  is_published: boolean | null;
  updated_at: string;
}

interface UserProfile {
  created_at: string;
  subscription_status: string;
  plan_type: string;
}

const MAX_PAGES_ESSENTIAL = 5;
const MAX_PAGES_PRO = 20;
const TRIAL_DAYS = 14;

const TrustPageDashboard = () => {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Calculate trial days remaining
  const getTrialDaysRemaining = () => {
    if (!profile) return 0;
    const createdAt = new Date(profile.created_at);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diffDays);
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const isTrialExpired = profile?.subscription_status === 'trial' && trialDaysRemaining <= 0;
  const isActive = profile?.subscription_status === 'active';
  
  // Determine max pages based on plan
  const maxPages = profile?.plan_type === 'pro' ? MAX_PAGES_PRO : MAX_PAGES_ESSENTIAL;
  const hasReachedLimit = pages.length >= maxPages;

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPages();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("created_at, subscription_status, plan_type")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("id, page_name, slug, views, is_published, updated_at")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Erro ao carregar suas páginas");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Você saiu da conta");
  };

  const handleDelete = async (id: string, pageName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${pageName || 'esta página'}"?`)) return;

    try {
      const { error } = await supabase
        .from("landing_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setPages(pages.filter(p => p.id !== id));
      toast.success("Página excluída com sucesso");
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Erro ao excluir página");
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handleNewPage = () => {
    if (isTrialExpired) {
      setShowUpgradeModal(true);
      return;
    }
    if (hasReachedLimit) {
      setShowUpgradeModal(true);
    } else {
      navigate("/new");
    }
  };

  const handleEdit = (pageId: string) => {
    if (isTrialExpired) {
      setShowUpgradeModal(true);
      return;
    }
    navigate(`/edit/${pageId}`);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">TrustPage</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button onClick={handleNewPage} disabled={isTrialExpired}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Página
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {profile && profile.subscription_status === 'trial' && (
        <div className={`border-b ${
          isTrialExpired 
            ? 'bg-red-50 border-red-200' 
            : trialDaysRemaining <= 3 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-primary/5 border-primary/20'
        }`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {isTrialExpired ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <Clock className="w-5 h-5 text-primary" />
                )}
                <p className={`font-medium ${isTrialExpired ? 'text-red-700' : 'text-foreground'}`}>
                  {isTrialExpired 
                    ? 'Período de teste expirado. Suas páginas estão suspensas.' 
                    : `Seu teste grátis acaba em ${trialDaysRemaining} dia${trialDaysRemaining !== 1 ? 's' : ''}. Aproveite para vender!`
                  }
                </p>
              </div>
              <Button 
                variant={isTrialExpired ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className={isTrialExpired ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <Crown className="w-4 h-4 mr-2" />
                {isTrialExpired ? 'Assinar Agora' : 'Fazer Upgrade'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active subscription badge */}
      {profile && isActive && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-700">
                Plano {profile.plan_type === 'pro' ? 'Pro' : 'Essencial'} ativo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Suas Landing Pages</h1>
            <p className="text-muted-foreground">Gerencie suas páginas de alta conversão</p>
          </div>
          
          {/* Page Counter */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            hasReachedLimit 
              ? 'bg-amber-100 text-amber-700 border border-amber-300' 
              : 'bg-primary/10 text-primary'
          }`}>
            {hasReachedLimit && <Crown className="w-4 h-4" />}
            <span className="font-semibold">{pages.length}/{maxPages} páginas</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Crie sua primeira página</h3>
                  <p className="text-muted-foreground">Comece a converter visitantes em clientes</p>
                </div>
                <Button onClick={handleNewPage} disabled={isTrialExpired}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Página
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Create New Card */}
            <Card 
              className={`h-full border-dashed transition-colors cursor-pointer ${
                isTrialExpired
                  ? 'opacity-50 cursor-not-allowed'
                  : hasReachedLimit 
                    ? 'hover:border-amber-400 hover:bg-amber-50/50' 
                    : 'hover:border-primary/50 hover:bg-muted/50'
              }`}
              onClick={handleNewPage}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                {isTrialExpired ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="font-medium text-red-700">Trial expirado</p>
                    <p className="text-sm text-red-600">Assine para continuar</p>
                  </>
                ) : hasReachedLimit ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="font-medium text-amber-700">Limite atingido</p>
                    <p className="text-sm text-amber-600">Faça upgrade para criar mais</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium text-foreground">Nova Página</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Existing Pages */}
            {pages.map((page) => (
              <Card key={page.id} className={`hover:shadow-md transition-shadow ${isTrialExpired ? 'opacity-75' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{page.page_name || 'Sem nome'}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        /p/{page.slug}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        page.is_published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {page.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                      {isTrialExpired && page.is_published && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                          Suspenso
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{page.views || 0} views</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(page.id)}
                      disabled={isTrialExpired}
                    >
                      Editar
                    </Button>
                    <Link to={`/p/${page.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleCopyLink(page.slug)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(page.id, page.page_name || '')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
};

export default TrustPageDashboard;
