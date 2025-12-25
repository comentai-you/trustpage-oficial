import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Crown, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type, full_name, subscription_status")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setPlanType(profile.plan_type);
          setUserName(profile.full_name?.split(' ')[0] || '');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to allow webhook to process
    const timer = setTimeout(fetchUserPlan, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Confirmando seu pagamento...</p>
        </div>
      </div>
    );
  }

  const isPro = planType === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-success/30 shadow-xl">
        <CardContent className="p-8 text-center">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <div className="absolute -top-2 -right-2 left-0 right-0 mx-auto w-fit">
              {isPro ? (
                <Crown className="w-8 h-8 text-primary animate-bounce" />
              ) : (
                <Sparkles className="w-8 h-8 text-primary animate-bounce" />
              )}
            </div>
          </div>

          {/* Welcome Message */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Parabéns{userName ? `, ${userName}` : ''}! 🎉
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            Seu pagamento foi confirmado com sucesso!
          </p>

          {/* Plan Card */}
          <div className={`rounded-xl p-4 mb-6 ${
            isPro 
              ? 'bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30' 
              : 'bg-muted/50 border border-border'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {isPro ? (
                <Crown className="w-6 h-6 text-primary" />
              ) : (
                <Sparkles className="w-6 h-6 text-primary" />
              )}
              <span className="text-xl font-bold text-foreground">
                Plano {isPro ? 'PRO' : 'Essencial'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPro 
                ? 'Você agora tem acesso a 10 páginas e recursos exclusivos!' 
                : 'Você agora tem acesso a 3 páginas e proteção contra bloqueios!'}
            </p>
          </div>

          {/* Benefits */}
          <div className="text-left bg-card rounded-lg p-4 mb-6 border">
            <h3 className="font-semibold text-foreground mb-3">O que você pode fazer agora:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                Criar páginas de alta conversão com templates prontos
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                Personalizar cores, temas e conteúdo
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                Publicar e compartilhar suas páginas
              </li>
              {isPro && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Suporte prioritário para suas dúvidas
                </li>
              )}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              variant="gradient" 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/new?type=vsl')}
            >
              Criar Minha Primeira Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
