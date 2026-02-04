import { Eye, FileText, Crown, Users, AlertTriangle, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface StatsBarProps {
  totalViews: number;
  totalPages: number;
  totalClonedPages: number;
  totalLeads: number;
  planType: string;
  subscriptionStatus: string;
  monthlyViews?: number;
  maxPages: number;
  maxClonedPages: number;
}

const StatsBar = ({ 
  totalViews, 
  totalPages, 
  totalClonedPages,
  totalLeads, 
  planType, 
  subscriptionStatus, 
  monthlyViews = 0,
  maxPages,
  maxClonedPages
}: StatsBarProps) => {
  const navigate = useNavigate();
  const isFreePlan = subscriptionStatus === 'free' || planType === 'free';
  const isPaidPlan = ['essential', 'essential_yearly', 'pro', 'pro_yearly', 'elite'].includes(planType);
  
  // View limit for free plan
  const viewLimit = 1000;
  const viewPercentage = isFreePlan ? Math.min((monthlyViews / viewLimit) * 100, 100) : 0;
  const isNearViewLimit = isFreePlan && monthlyViews >= 800;
  const isAtViewLimit = isFreePlan && monthlyViews >= viewLimit;

  // Page usage
  const pagePercentage = maxPages > 0 ? Math.min((totalPages / maxPages) * 100, 100) : 0;
  const isNearPageLimit = totalPages >= maxPages - 1 && totalPages < maxPages;
  const isAtPageLimit = totalPages >= maxPages;

  // Cloned pages usage (only for paid plans)
  const clonedPercentage = maxClonedPages > 0 ? Math.min((totalClonedPages / maxClonedPages) * 100, 100) : 0;
  const isNearClonedLimit = isPaidPlan && totalClonedPages >= maxClonedPages - 1 && totalClonedPages < maxClonedPages;
  const isAtClonedLimit = isPaidPlan && totalClonedPages >= maxClonedPages;

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
        <Card className={`overflow-hidden border-0 shadow-card ${isAtViewLimit ? 'bg-red-500/10 border-red-500/20' : isNearViewLimit ? 'bg-orange-500/10 border-orange-500/20' : 'bg-primary/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isAtViewLimit ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : isNearViewLimit ? (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                ) : (
                  <Eye className="w-4 h-4 text-primary" />
                )}
                <span className={`text-sm font-medium ${isAtViewLimit ? 'text-red-600' : isNearViewLimit ? 'text-orange-600' : 'text-foreground'}`}>
                  Visualizações Mensais
                </span>
              </div>
              <span className={`text-sm font-bold ${isAtViewLimit ? 'text-red-600' : isNearViewLimit ? 'text-orange-600' : 'text-foreground'}`}>
                {monthlyViews.toLocaleString('pt-BR')} / {viewLimit.toLocaleString('pt-BR')}
              </span>
            </div>
            <Progress 
              value={viewPercentage} 
              className={`h-2 ${isAtViewLimit ? '[&>div]:bg-red-500' : isNearViewLimit ? '[&>div]:bg-orange-500' : ''}`}
            />
            {isAtViewLimit && (
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
            {isNearViewLimit && !isAtViewLimit && (
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

      {/* Usage Limits - Pages and Clones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Pages Usage */}
        <Card className={`overflow-hidden border-0 shadow-card ${isAtPageLimit ? 'bg-orange-500/10' : 'bg-card'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className={`w-4 h-4 ${isAtPageLimit ? 'text-orange-500' : 'text-primary'}`} />
                <span className={`text-sm font-medium ${isAtPageLimit ? 'text-orange-600' : 'text-foreground'}`}>
                  Páginas Criadas
                </span>
              </div>
              <span className={`text-sm font-bold ${isAtPageLimit ? 'text-orange-600' : 'text-foreground'}`}>
                {totalPages} / {maxPages}
              </span>
            </div>
            <Progress 
              value={pagePercentage} 
              className={`h-2 ${isAtPageLimit ? '[&>div]:bg-orange-500' : isNearPageLimit ? '[&>div]:bg-amber-500' : ''}`}
            />
            {isAtPageLimit && (
              <p className="text-xs text-orange-600 mt-2">
                Limite atingido.{" "}
                <button 
                  onClick={() => navigate("/assinatura")} 
                  className="underline font-semibold hover:text-orange-700"
                >
                  Upgrade para mais
                </button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cloned Pages Usage - Only for Paid Plans */}
        {isPaidPlan && (
          <Card className={`overflow-hidden border-0 shadow-card ${isAtClonedLimit ? 'bg-orange-500/10' : 'bg-card'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Copy className={`w-4 h-4 ${isAtClonedLimit ? 'text-orange-500' : 'text-primary'}`} />
                  <span className={`text-sm font-medium ${isAtClonedLimit ? 'text-orange-600' : 'text-foreground'}`}>
                    Clones Ativos
                  </span>
                </div>
                <span className={`text-sm font-bold ${isAtClonedLimit ? 'text-orange-600' : 'text-foreground'}`}>
                  {totalClonedPages} / {maxClonedPages}
                </span>
              </div>
              <Progress 
                value={clonedPercentage} 
                className={`h-2 ${isAtClonedLimit ? '[&>div]:bg-orange-500' : isNearClonedLimit ? '[&>div]:bg-amber-500' : ''}`}
              />
              {isAtClonedLimit && (
                <p className="text-xs text-orange-600 mt-2">
                  Limite atingido.{" "}
                  <button 
                    onClick={() => navigate("/assinatura")} 
                    className="underline font-semibold hover:text-orange-700"
                  >
                    Upgrade para mais
                  </button>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Free Plan - Cloner Blocked */}
        {isFreePlan && (
          <Card className="overflow-hidden border-0 shadow-card bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Clones Ativos
                  </span>
                </div>
                <span className="text-sm font-bold text-muted-foreground">
                  Bloqueado
                </span>
              </div>
              <Progress value={0} className="h-2 opacity-50" />
              <p className="text-xs text-muted-foreground mt-2">
                Disponível a partir do Essencial.{" "}
                <button 
                  onClick={() => navigate("/assinatura")} 
                  className="underline font-semibold hover:text-foreground"
                >
                  Fazer upgrade
                </button>
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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