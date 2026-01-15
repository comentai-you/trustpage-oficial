import { Eye, FileText, Crown, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface StatsBarProps {
  totalViews: number;
  totalPages: number;
  totalLeads: number;
  planType: string;
  subscriptionStatus: string;
}

const StatsBar = ({ totalViews, totalPages, totalLeads, planType, subscriptionStatus }: StatsBarProps) => {
  const navigate = useNavigate();
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
        label: planType === 'pro' ? 'Pro' : planType === 'elite' ? 'Elite' : 'Essencial',
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
  );
};

export default StatsBar;
