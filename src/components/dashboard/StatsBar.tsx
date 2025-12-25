import { Eye, FileText, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsBarProps {
  totalViews: number;
  totalPages: number;
  planType: string;
  subscriptionStatus: string;
}

const StatsBar = ({ totalViews, totalPages, planType, subscriptionStatus }: StatsBarProps) => {
  const getPlanBadge = () => {
    if (subscriptionStatus === 'active') {
      return {
        label: planType === 'pro' ? 'Pro' : 'Essencial',
        className: 'bg-gradient-to-r from-primary to-accent text-primary-foreground',
        icon: Crown
      };
    }
    return {
      label: 'Trial',
      className: 'bg-warning/10 text-warning border border-warning/30',
      icon: Crown
    };
  };

  const planBadge = getPlanBadge();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* Total Views */}
      <Card className="overflow-hidden border-0 shadow-card hover-lift">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total de Visualizações</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {totalViews.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Pages */}
      <Card className="overflow-hidden border-0 shadow-card hover-lift">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Páginas Ativas</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {totalPages}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card className="overflow-hidden border-0 shadow-card hover-lift">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
              <planBadge.icon className="w-6 h-6 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Plano Atual</p>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${planBadge.className}`}>
                  {planBadge.label}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsBar;
