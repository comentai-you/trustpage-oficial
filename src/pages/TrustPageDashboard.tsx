import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Crown, Loader2, Scale, ExternalLink, Eye, FileText, Shield, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PricingModal from "@/components/PricingModal";
import UpgradeModal from "@/components/UpgradeModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsBar from "@/components/dashboard/StatsBar";
import PageCard from "@/components/dashboard/PageCard";
import TemplateSelectionModal from "@/components/TemplateSelectionModal";
import OnboardingModal from "@/components/OnboardingModal";
import { TemplateType } from "@/types/landing-page";
import { Badge } from "@/components/ui/badge";

interface LandingPage {
  id: string;
  page_name: string | null;
  slug: string;
  views: number | null;
  is_published: boolean | null;
  updated_at: string;
  image_url: string | null;
  video_url: string | null;
  cover_image_url: string | null;
  template_type: string | null;
}

interface UserProfile {
  created_at: string;
  subscription_status: string;
  plan_type: string;
  full_name: string | null;
  avatar_url: string | null;
  custom_domain: string | null;
  domain_verified: boolean | null;
  company_name: string | null;
  support_email: string | null;
}

// Legal page slugs - these don't count towards plan limits
const LEGAL_PAGE_SLUGS = ['politica-de-privacidade', 'termos-de-uso', 'contato'];

const isLegalPage = (slug: string) => LEGAL_PAGE_SLUGS.includes(slug);

const getMaxPages = (planType: string) => {
  switch (planType) {
    case 'pro':
    case 'pro_yearly':
    case 'elite':
      return 10;
    case 'essential':
      return 2;
    default:
      return 1; // FREE plan
  }
};

const TrustPageDashboard = () => {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<'vsl' | 'sales' | 'delay' | 'domain' | 'video' | 'html' | 'limit'>('limit');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Separate regular pages from legal pages
  const regularPages = pages.filter(page => !isLegalPage(page.slug));
  const legalPages = pages.filter(page => isLegalPage(page.slug));

  const isFreePlan = profile?.plan_type === 'free';
  const maxPages = getMaxPages(profile?.plan_type || 'free');
  // Only count regular pages towards the limit
  const hasReachedLimit = regularPages.length >= maxPages;

  // Calculate total views (only from regular pages)
  const totalViews = regularPages.reduce((sum, page) => sum + (page.views || 0), 0);

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
        .select("created_at, subscription_status, plan_type, full_name, avatar_url, custom_domain, domain_verified, company_name, support_email")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      
      // Check if onboarding is needed (no company_name or support_email)
      if (data && (!data.company_name || !data.support_email)) {
        setShowOnboardingModal(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("id, page_name, slug, views, is_published, updated_at, image_url, video_url, cover_image_url, template_type")
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

  const handleCopyLink = (slug: string, useCustomDomain?: boolean) => {
    let url: string;
    if (useCustomDomain && profile?.custom_domain && profile?.domain_verified) {
      const normalizedDomain = profile.custom_domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
      url = `https://${normalizedDomain}/p/${slug}`;
    } else {
      url = `${window.location.origin}/p/${slug}`;
    }
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const customDomain = profile?.domain_verified ? profile.custom_domain : null;

  const handleNewPage = () => {
    if (hasReachedLimit) {
      setUpgradeFeature('limit');
      setShowUpgradeModal(true);
    } else {
      setShowTemplateModal(true);
    }
  };

  const handleTemplateSelect = (templateType: TemplateType) => {
    // FREE plan can only create bio pages
    if (isFreePlan && templateType !== 'bio') {
      setUpgradeFeature(templateType === 'vsl' ? 'vsl' : 'sales');
      setShowUpgradeModal(true);
      setShowTemplateModal(false);
      return;
    }
    navigate(`/new?type=${templateType}`);
  };

  const handleEdit = (pageId: string) => {
    navigate(`/edit/${pageId}`);
  };

  const handleViewPage = (slug: string) => {
    window.open(`${window.location.origin}/p/${slug}`, '_blank');
  };

  const getLegalPageIcon = (slug: string) => {
    switch (slug) {
      case 'politica-de-privacidade':
        return <Shield className="w-4 h-4" />;
      case 'termos-de-uso':
        return <FileText className="w-4 h-4" />;
      case 'contato':
        return <Mail className="w-4 h-4" />;
      default:
        return <Scale className="w-4 h-4" />;
    }
  };

  const getLegalPageName = (slug: string, pageName: string | null) => {
    if (pageName) return pageName;
    switch (slug) {
      case 'politica-de-privacidade':
        return 'Política de Privacidade';
      case 'termos-de-uso':
        return 'Termos de Uso';
      case 'contato':
        return 'Contato';
      default:
        return slug;
    }
  };

  return (
    <DashboardLayout
      avatarUrl={profile?.avatar_url}
      fullName={profile?.full_name}
      onNewPage={handleNewPage}
    >
      {/* Free Plan Banner */}
      {isFreePlan && (
        <div className="bg-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4 py-2.5 sm:py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 text-center sm:text-left">
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  Você está no plano Gratuito. Faça upgrade para desbloquear VSLs, delay no botão e mais!
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPricingModal(true)}
                className="whitespace-nowrap border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Crown className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ads Compliance Alert */}
      <div className="container mx-auto px-4 pt-6">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-500">
              Atenção: Regra Obrigatória para Anúncios (Ads)
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              É estritamente <strong>PROIBIDO</strong> rodar tráfego pago (Facebook/Google Ads) direto para URLs terminadas em 'trustpageapp.com'. Isso gera bloqueio imediato. Para anunciar, configure seu <strong>Domínio Próprio</strong> (Disponível no Plano PRO).
            </p>
          </div>
        </div>
      </div>

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
            totalPages={regularPages.length}
            planType={profile?.plan_type || 'free'}
            subscriptionStatus={profile?.subscription_status || 'free'}
          />
        </div>

        {/* Pages Section */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Suas Páginas</h2>
          
          {/* Page Counter - Only counts regular pages */}
          <div className={`inline-flex self-start sm:self-auto items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm ${
            hasReachedLimit 
              ? 'bg-warning/10 text-warning border border-warning/30' 
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {hasReachedLimit && <Crown className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
            <span className="font-semibold">{regularPages.length}/{maxPages} {maxPages === 1 ? 'página' : 'páginas'}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : regularPages.length === 0 ? (
          <Card className="text-center py-10 sm:py-12 border-dashed">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-7 sm:w-8 h-7 sm:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Crie sua primeira página</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {isFreePlan ? 'Comece com um Bio Link profissional' : 'Comece a converter visitantes em clientes'}
                  </p>
                </div>
                <Button 
                  onClick={handleNewPage}
                  className="gradient-button text-primary-foreground border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isFreePlan ? 'Criar Bio Link' : 'Criar Página'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Create New Card */}
            <Card 
              className={`h-full border-dashed transition-all cursor-pointer hover-lift ${
                hasReachedLimit 
                  ? 'hover:border-warning/50 hover:bg-warning/5' 
                  : 'hover:border-primary/50 hover:bg-primary/5'
              }`}
              onClick={handleNewPage}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[140px] sm:min-h-[160px] gap-2 sm:gap-3 p-6">
                {hasReachedLimit ? (
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

            {/* Existing Regular Pages (excluding legal pages) */}
            {regularPages.map((page) => (
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
                coverImageUrl={page.cover_image_url}
                isTrialExpired={false}
                customDomain={customDomain}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>
        )}

        {/* Legal Pages Section - Always shown, separate from templates */}
        <div className="mt-10 sm:mt-12">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Páginas Legais</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Obrigatórias para compliance. Não contam no limite do plano.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto text-muted-foreground border-muted-foreground/30">
              Automáticas
            </Badge>
          </div>

          {legalPages.length === 0 ? (
            <Card className="border-dashed border-amber-500/50 bg-amber-500/5">
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Scale className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Páginas legais não configuradas</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                      Configure seus dados da empresa nas Configurações para gerar automaticamente as páginas de Privacidade, Termos e Contato.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/settings')}
                    className="border-amber-500/50 text-amber-700 hover:bg-amber-500/10"
                  >
                    Ir para Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {legalPages.map((page) => (
                <Card key={page.id} className="bg-muted/30 border-muted hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {getLegalPageIcon(page.slug)}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">
                            {getLegalPageName(page.slug, page.page_name)}
                          </h4>
                          <p className="text-xs text-muted-foreground">/{page.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {page.is_published && (
                          <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
                            Ativa
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewPage(page.slug)}
                          title="Visualizar página"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <PricingModal 
        open={showPricingModal} 
        onOpenChange={setShowPricingModal}
        userFullName={profile?.full_name}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature={upgradeFeature}
      />
      
      <TemplateSelectionModal 
        open={showTemplateModal} 
        onOpenChange={setShowTemplateModal}
        onSelect={handleTemplateSelect}
        isFreePlan={isFreePlan}
      />
      
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

      {user && (
        <OnboardingModal
          open={showOnboardingModal}
          userId={user.id}
          onComplete={() => {
            setShowOnboardingModal(false);
            fetchProfile();
            fetchPages();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default TrustPageDashboard;
