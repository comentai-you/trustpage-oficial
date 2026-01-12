import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, CreditCard, ExternalLink, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface SubscriptionProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan_type: string;
  subscription_status: string;
  subscription_updated_at: string | null;
  created_at: string;
}

// Links externos para checkout na Kiwify
const KIWIFY_LINKS = {
  essential_monthly: 'https://pay.kiwify.com.br/P7MaOJK',
  pro_monthly: 'https://pay.kiwify.com.br/f0lsmRn',
  essential_yearly: 'https://pay.kiwify.com.br/f8Tg6DT',
  pro_yearly: 'https://pay.kiwify.com.br/TQlihDk',
};

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SubscriptionProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, plan_type, subscription_status, subscription_updated_at, created_at")
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

  const handleUpgrade = (planKey: keyof typeof KIWIFY_LINKS) => {
    const url = KIWIFY_LINKS[planKey];
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30">Ativa</Badge>;
      case 'trial':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Período de Teste</Badge>;
      case 'cancelled':
      case 'canceled':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Cancelada</Badge>;
      case 'inactive':
        return <Badge className="bg-muted text-muted-foreground border-muted">Inativa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanDetails = (planType: string) => {
    switch (planType) {
      case 'pro':
        return {
          name: 'PRO',
          price: 'R$ 97,00/mês',
          pages: 10,
          domains: 3,
          icon: Crown,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
        };
      case 'essential':
        return {
          name: 'Essencial',
          price: 'R$ 39,90/mês',
          pages: 2,
          domains: 0,
          icon: Sparkles,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
        };
      default:
        return {
          name: 'Gratuito',
          price: 'R$ 0/mês',
          pages: 1,
          domains: 0,
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

  const plan = getPlanDetails(profile?.plan_type || 'free');
  const PlanIcon = plan.icon;
  const isActive = profile?.subscription_status === 'active';
  const isFree = profile?.plan_type === 'free' || !profile?.plan_type;

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
                      {getStatusBadge(profile?.subscription_status || 'free')}
                    </div>
                    <p className="text-muted-foreground">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">
                      Até {plan.pages} página{plan.pages > 1 ? 's' : ''} ativa{plan.pages > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {isFree && (
                    <Button variant="gradient" onClick={() => handleUpgrade('essential_monthly')}>
                      Fazer Upgrade
                    </Button>
                  )}
                  {profile?.plan_type === 'essential' && (
                    <Button variant="outline" onClick={() => handleUpgrade('pro_monthly')}>
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
                  <span>Até {plan.pages} página{plan.pages > 1 ? 's' : ''} ativa{plan.pages > 1 ? 's' : ''}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Templates VSL, Vendas e Bio Link</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Proteção contra bloqueios</span>
                </li>
                {(profile?.plan_type === 'pro' || profile?.plan_type === 'pro_yearly') && (
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success" />
                    <span>Pixel do Facebook/Google ADS</span>
                  </li>
                )}
                {plan.domains > 0 && (
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success" />
                    <span>Até {plan.domains} domínio{plan.domains > 1 ? 's' : ''} personalizado{plan.domains > 1 ? 's' : ''}</span>
                  </li>
                )}
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
                ) : profile?.plan_type === 'essential' ? (
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Check className="w-5 h-5 text-muted-foreground" />
                    <span>Marca d'água no rodapé</span>
                  </li>
                ) : null}
              </ul>
            </CardContent>
          </Card>

          {/* Upgrade Options - Only show for non-pro users */}
          {profile?.plan_type !== 'pro' && (
            <Card>
              <CardHeader>
                <CardTitle>Opções de Upgrade</CardTitle>
                <CardDescription>Escolha o plano ideal para você</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Essential */}
                  {profile?.plan_type !== 'essential' && (
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">Essencial</h4>
                      </div>
                      <p className="text-2xl font-bold">R$ 39,90<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• 2 páginas ativas</li>
                        <li>• 1 domínio personalizado</li>
                        <li>• Página VSL e Vendas</li>
                      </ul>
                      <Button className="w-full" onClick={() => handleUpgrade('essential_monthly')}>
                        Assinar Essencial
                      </Button>
                    </div>
                  )}
                  
                  {/* PRO */}
                  <div className="border-2 border-primary rounded-lg p-4 space-y-3 relative">
                    <Badge className="absolute -top-2 right-2 bg-primary">Recomendado</Badge>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">PRO</h4>
                    </div>
                    <p className="text-2xl font-bold">R$ 97,00<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 10 páginas ativas</li>
                      <li>• 3 domínios personalizados</li>
                      <li>• Zero marca d'água</li>
                      <li>• Suporte prioritário</li>
                    </ul>
                    <Button variant="gradient" className="w-full" onClick={() => handleUpgrade('pro_monthly')}>
                      Assinar PRO
                    </Button>
                  </div>
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
    </DashboardLayout>
  );
};

export default SubscriptionPage;
