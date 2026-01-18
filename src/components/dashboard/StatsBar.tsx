import { Eye, FileText, Crown, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface StatsBarProps {
  totalViews: number;
  totalPages: number;
  totalLeads: number;
  planType: string;
  subscriptionStatus: string;
  monthlyViews?: number;
}

const StatsBar = ({ totalViews, totalPages, totalLeads, planType, subscriptionStatus, monthlyViews = 0 }: StatsBarProps) => {
  const navigate = useNavigate();
  const isFreePlan = subscriptionStatus === 'free' || planType === 'free';
  const viewLimit = 1000;
  const viewPercentage = isFreePlan ? Math.min((monthlyViews / viewLimit) * 100, 100) : 0;
  const isNearLimit = isFreePlan && monthlyViews >= 800;
  const isAtLimit = isFreePlan && monthlyViews >= viewLimit;

  const getPlanBadge = () => {
    // Free plan
    if (subscriptionStatus === 'free' || planType === 'free') {
      return {
        label: 'Gratuito',
        className: 'bg-muted text-muted-foreground border border-border',
        icon: Crown
      };
    }
    // Active paid plans
    if (subscriptionStatus === 'active') {
      return {
        label: planType === 'pro' || planType === 'pro_yearly' ? 'Pro' : planType === 'elite' ? 'Elite' : 'Essencial',
        className: 'bg-gradient-to-r from-primary to-accent text-primary-foreground',
        icon: Crown
      };
    }
    // Fallback
    return {
      label: 'Gratuito',
      className: 'bg-muted text-muted-foreground border border-border',
      icon: Crown
    };
  };

  const planBadge = getPlanBadge();

  return (
    <div className="space-y-4">
      {/* View Limit Warning for Free Plan */}
      {isFreePlan && (
        <Card className={`overflow-hidden border-0 shadow-card ${isAtLimit ? 'bg-red-500/10 border-red-500/20' : isNearLimit ? 'bg-orange-500/10 border-orange-500/20' : 'bg-primary/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isAtLimit ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : isNearLimit ? (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                ) : (
                  <Eye className="w-4 h-4 text-primary" />
                )}
                <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-foreground'}`}>
                  Visualizações Mensais
                </span>
              </div>
              <span className={`text-sm font-bold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-foreground'}`}>
                {monthlyViews.toLocaleString('pt-BR')} / {viewLimit.toLocaleString('pt-BR')}
              </span>
            </div>
            <Progress 
              value={viewPercentage} 
              className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
            />
            {isAtLimit && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Limite atingido! Suas páginas estão bloqueadas.{" "}
                <button 
                  onClick={() => navigate("/assinatura")} 
                  className="underline font-semibold hover:text-red-700"
                >
                  Faça upgrade agora
                </button>
              </p>
            )}
            {isNearLimit && !isAtLimit && (
              <p className="text-xs text-orange-600 mt-2">
                ⚠️ Você está próximo do limite.{" "}
                <button 
                  onClick={() => navigate("/assinatura")} 
                  className="underline font-semibold hover:text-orange-700"
                >
                  Faça upgrade para ilimitado
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Views */}
        <Card className="overflow-hidden border-0 shadow-card hover-lift">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Visualizações</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {totalViews.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads - Clickable */}
        <Card 
          className="overflow-hidden border-0 shadow-card hover-lift cursor-pointer group"
          onClick={() => navigate("/leads")}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Leads</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {totalLeads.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Pages */}
        <Card className="overflow-hidden border-0 shadow-card hover-lift">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Páginas</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {totalPages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Plan */}
        <Card className="overflow-hidden border-0 shadow-card hover-lift">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                <planBadge.icon className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Plano</p>
                <div className="mt-0.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold ${planBadge.className}`}>
                    {planBadge.label}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsBar;
