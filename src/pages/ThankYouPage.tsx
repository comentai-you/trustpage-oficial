import { CheckCircle, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ThankYouPage = () => {
  const whatsappNumber = "5511999999999"; // Update with actual support number
  const whatsappMessage = encodeURIComponent("Olá! Não recebi o e-mail de acesso ao TrustPage.");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          {/* Animated Success Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-green-500/30 rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Compra Confirmada!
          </h1>
          <p className="text-xl text-primary font-semibold">
            Bem-vindo ao TrustPage.
          </p>
          <p className="text-muted-foreground text-lg">
            O seu acesso já foi liberado.
          </p>
        </div>

        {/* Instructions Card */}
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-center gap-3 text-primary">
              <Mail className="w-6 h-6" />
              <span className="font-semibold text-lg">Próximo Passo</span>
            </div>

            <p className="text-foreground text-base leading-relaxed">
              Enviamos um e-mail com um link para você{" "}
              <strong>definir sua senha de acesso</strong>.
            </p>

            <div className="flex items-center justify-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                Verifique sua caixa de Entrada, Spam e Promoções.
              </p>
            </div>

            <Button asChild size="lg" className="w-full gap-2">
              <Link to="/auth">
                Ir para o Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Support Link */}
        <div className="pt-4">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Não recebeu o e-mail? Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
