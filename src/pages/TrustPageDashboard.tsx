import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Crown, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UpgradeModal from "@/components/UpgradeModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsBar from "@/components/dashboard/StatsBar";
import PageCard from "@/components/dashboard/PageCard";

interface LandingPage {
  id: string;
  page_name: string | null;
  slug: string;
  views: number | null;
  is_published: boolean | null;
  updated_at: string;
  image_url: string | null;
  video_url: string | null;
}

interface UserProfile {
  created_at: string;
  subscription_status: string;
  plan_type: string;
  full_name: string | null;
  avatar_url: string | null;
}

const MAX_PAGES_ESSENTIAL = 5;
const MAX_PAGES_PRO = 20;
const TRIAL_DAYS = 14;

const TrustPageDashboard = () => {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const { user } = useAuth();
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

  // Calculate total views
  const totalViews = pages.reduce((sum, page) => sum + (page.views || 0), 0);

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
        .select("created_at, subscription_status, plan_type, full_name, avatar_url")
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
        .select("id, page_name, slug, views, is_published, updated_at, image_url, video_url")
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

  const handleDelete = async (id: string, pageName: string) => {
    setDeleteDialog({ open: true, id, name: pageName || 'esta página' });
  };

  const confirmDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: '', name: '' });
    
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
    <DashboardLayout
      avatarUrl={profile?.avatar_url}
      fullName={profile?.full_name}
      onNewPage={handleNewPage}
      newPageDisabled={isTrialExpired}
    >
      {/* Trial Banner */}
      {profile && profile.subscription_status === 'trial' && (
        <div className={`border-b ${
          isTrialExpired 
            ? 'bg-destructive/5 border-destructive/20' 
            : trialDaysRemaining <= 3 
              ? 'bg-warning/5 border-warning/20' 
              : 'bg-primary/5 border-primary/20'
        }`}>
          <div className="container mx-auto px-4 py-2.5 sm:py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 text-center sm:text-left">
                {isTrialExpired ? (
                  <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 text-destructive flex-shrink-0" />
                ) : (
                  <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
                )}
                <p className={`text-xs sm:text-sm font-medium ${isTrialExpired ? 'text-destructive' : 'text-foreground'}`}>
                  {isTrialExpired 
                    ? 'Período de teste expirado. Suas páginas estão suspensas.' 
                    : `Seu teste grátis acaba em ${trialDaysRemaining} dia${trialDaysRemaining !== 1 ? 's' : ''}. Aproveite para vender!`
                  }
                </p>
              </div>
              <Button 
                variant={isTrialExpired ? "destructive" : "outline"} 
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className="whitespace-nowrap"
              >
                <Crown className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
                {isTrialExpired ? 'Assinar Agora' : 'Fazer Upgrade'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Olá{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie suas landing pages de alta conversão
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 sm:mb-8">
          <StatsBar
            totalViews={totalViews}
            totalPages={pages.length}
            planType={profile?.plan_type || 'essential'}
            subscriptionStatus={profile?.subscription_status || 'trial'}
          />
        </div>

        {/* Pages Section */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Suas Páginas</h2>
          
          {/* Page Counter */}
          <div className={`inline-flex self-start sm:self-auto items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm ${
            hasReachedLimit 
              ? 'bg-warning/10 text-warning border border-warning/30' 
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {hasReachedLimit && <Crown className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
            <span className="font-semibold">{pages.length}/{maxPages} páginas</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <Card className="text-center py-10 sm:py-12 border-dashed">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-7 sm:w-8 h-7 sm:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Crie sua primeira página</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Comece a converter visitantes em clientes</p>
                </div>
                <Button 
                  onClick={handleNewPage} 
                  disabled={isTrialExpired}
                  className="gradient-button text-primary-foreground border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Página
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Create New Card */}
            <Card 
              className={`h-full border-dashed transition-all cursor-pointer hover-lift ${
                isTrialExpired
                  ? 'opacity-50 cursor-not-allowed'
                  : hasReachedLimit 
                    ? 'hover:border-warning/50 hover:bg-warning/5' 
                    : 'hover:border-primary/50 hover:bg-primary/5'
              }`}
              onClick={handleNewPage}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[140px] sm:min-h-[160px] gap-2 sm:gap-3 p-6">
                {isTrialExpired ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <p className="font-semibold text-destructive">Trial expirado</p>
                    <p className="text-sm text-destructive/80">Assine para continuar</p>
                  </>
                ) : hasReachedLimit ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-warning" />
                    </div>
                    <p className="font-semibold text-warning">Limite atingido</p>
                    <p className="text-sm text-warning/80">Faça upgrade para criar mais</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">Nova Página</p>
                    <p className="text-sm text-muted-foreground">Clique para criar</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Existing Pages */}
            {pages.map((page) => (
              <PageCard
                key={page.id}
                id={page.id}
                pageName={page.page_name}
                slug={page.slug}
                views={page.views}
                isPublished={page.is_published}
                updatedAt={page.updated_at}
                imageUrl={page.image_url}
                videoUrl={page.video_url}
                isTrialExpired={isTrialExpired}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>
        )}
      </main>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Excluir página"
        description={`Tem certeza que deseja excluir "${deleteDialog.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default TrustPageDashboard;
