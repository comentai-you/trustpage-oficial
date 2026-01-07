import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, CreditCard, AlertCircle, ExternalLink, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PricingModal from "@/components/PricingModal";
import ConfirmDialog from "@/components/ConfirmDialog";

interface SubscriptionProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan_type: string;
  subscription_status: string;
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
  subscription_updated_at: string | null;
  created_at: string;
}

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SubscriptionProfile | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, plan_type, subscription_status, asaas_customer_id, asaas_subscription_id, subscription_updated_at, created_at")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar informações da assinatura");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!profile?.asaas_subscription_id) {
      toast.error("Nenhuma assinatura ativa encontrada");
      return;
    }

    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('asaas-manage-subscription', {
        body: {
          action: 'cancel',
          user_id: user!.id,
          subscription_id: profile.asaas_subscription_id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Assinatura cancelada com sucesso");
        await fetchProfile();
      } else {
        throw new Error(data?.error || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Erro ao cancelar assinatura", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
      });
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30">Ativa</Badge>;
      case 'trial':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Período de Teste</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Cancelada</Badge>;
      case 'refunded':
        return <Badge className="bg-muted text-muted-foreground border-muted">Reembolsada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanDetails = (planType: string) => {
    switch (planType) {
      case 'pro':
        return {
          name: 'PRO',
          price: 'R$ 79,90/mês',
          pages: 8,
          domains: 3,
          icon: Crown,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
        };
      default:
        return {
          name: 'Essencial',
          price: 'R$ 39,90/mês',
          pages: 2,
          domains: 1,
          icon: Sparkles,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
    }
  };

  if (loading) {
    return (
      <DashboardLayout avatarUrl={null} fullName={null} onNewPage={() => navigate('/new')}>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const plan = getPlanDetails(profile?.plan_type || 'essential');
  const PlanIcon = plan.icon;
  const isActive = profile?.subscription_status === 'active';
  const isTrial = profile?.subscription_status === 'trial';
  const canCancel = isActive && profile?.asaas_subscription_id;

  return (
    <DashboardLayout
      avatarUrl={profile?.avatar_url}
      fullName={profile?.full_name}
      onNewPage={() => navigate('/new')}
    >
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">Gerencie seu plano e informações de pagamento</p>
        </div>

        <div className="grid gap-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Plano Atual
              </CardTitle>
              <CardDescription>Detalhes da sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                    <PlanIcon className={`w-7 h-7 ${plan.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-foreground">Plano {plan.name}</h3>
                      {getStatusBadge(profile?.subscription_status || 'trial')}
                    </div>
                    <p className="text-muted-foreground">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">
                      Até {plan.pages} páginas ativas
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {!isActive && (
                    <Button variant="gradient" onClick={() => setShowPricingModal(true)}>
                      {isTrial ? 'Fazer Upgrade' : 'Reativar Plano'}
                    </Button>
                  )}
                  {profile?.plan_type !== 'pro' && isActive && (
                    <Button variant="outline" onClick={() => setShowPricingModal(true)}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade para PRO
                    </Button>
                  )}
                </div>
              </div>

              {profile?.subscription_updated_at && (
                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                  Última atualização: {new Date(profile.subscription_updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefícios do seu Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Até {plan.pages} páginas ativas</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Templates VSL, Vendas e Bio Link</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Proteção contra bloqueios</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Pixel do Facebook/Google ADS</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Até {plan.domains} domínio{plan.domains > 1 ? 's' : ''} personalizado{plan.domains > 1 ? 's' : ''}</span>
                </li>
                {profile?.plan_type === 'pro' ? (
                  <>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>Zero marca d'água</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>Suporte prioritário</span>
                    </li>
                  </>
                ) : (
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Check className="w-5 h-5 text-muted-foreground" />
                    <span>Marca d'água no rodapé</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {canCancel && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Zona de Perigo
                </CardTitle>
                <CardDescription>
                  Ações irreversíveis relacionadas à sua assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">Cancelar Assinatura</h4>
                    <p className="text-sm text-muted-foreground">
                      Sua assinatura será cancelada ao final do período atual
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Assinatura
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Precisa de ajuda?</h3>
                  <p className="text-sm text-muted-foreground">
                    Entre em contato com nosso suporte
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/contato')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Falar com Suporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PricingModal 
        open={showPricingModal} 
        onOpenChange={setShowPricingModal}
        userFullName={profile?.full_name}
      />

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar Assinatura"
        description="Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium ao final do período atual."
        confirmText="Sim, Cancelar"
        cancelText="Manter Assinatura"
        onConfirm={handleCancelSubscription}
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default SubscriptionPage;
