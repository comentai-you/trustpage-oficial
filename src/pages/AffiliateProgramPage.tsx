import { ArrowRight, DollarSign, Flame, Gift, Users, MessageCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AffiliateProgramPage = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const benefits = [
    {
      icon: DollarSign,
      title: "Comissão Recorrente",
      description: "Ganhe 30% todo mês enquanto seu indicado estiver ativo. Construa renda passiva.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: Flame,
      title: "Produto Fácil de Vender",
      description: "Com o novo Clonador e Quiz, o TrustPage se vende sozinho. Alta conversão.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Gift,
      title: "Assinatura Grátis",
      description: "Com apenas 3 ou 4 indicações, você cobre o custo do seu próprio plano.",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <DashboardLayout
      avatarUrl={profile?.avatar_url}
      fullName={profile?.full_name}
    >
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Programa de Afiliados</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
                Torne-se um Sócio do{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                  TrustPage
                </span>{" "}
                🚀
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Receba <span className="text-primary font-bold">30% de comissão recorrente</span> por cada indicação, 
                ou seja, enquanto o usuário estiver pagando mensalmente você estará recebendo sua comissão.
              </p>

              {/* Main CTA */}
              <Button
                size="xl"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-[0_8px_30px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] transition-all duration-300 hover:scale-105"
                onClick={() => window.open('https://dashboard.kiwify.com/join/affiliate/Vzguntvr', '_blank')}
              >
                QUERO ME AFILIAR AGORA
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Por que se tornar um afiliado?
                </h2>
                <p className="text-muted-foreground">
                  Veja os benefícios de fazer parte do nosso programa
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <Card 
                    key={index}
                    className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-6 sm:p-8">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <benefit.icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {benefit.title}
                      </h3>

                      {/* Description */}
                      <p className="text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>

                    {/* Decorative gradient */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5">
                <CardContent className="p-8 sm:p-12 text-center">
                  {/* Telegram Icon */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    Comunidade Exclusiva de Parceiros
                  </h3>

                  {/* Description */}
                  <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                    Entre no nosso grupo exclusivo para parceiros. Receba criativos e estratégias 
                    para te ajudar a vender.
                  </p>

                  {/* Telegram CTA */}
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold transition-all duration-300"
                    onClick={() => window.open('https://t.me/+txK-F3Fr91U0NmMx', '_blank')}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Entrar no Grupo Telegram
                  </Button>
                </CardContent>

                {/* Background decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              </Card>
            </div>
          </div>
        </section>

        {/* Second CTA Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Pronto para começar a ganhar?
              </h3>
              <p className="text-muted-foreground mb-8">
                Cadastre-se agora e comece a receber suas comissões
              </p>
              
              <Button
                size="xl"
                className="bg-gradient-to-r from-primary via-purple-500 to-accent text-white font-bold shadow-[0_8px_30px_hsl(270_100%_65%/0.4)] hover:shadow-[0_12px_40px_hsl(270_100%_65%/0.5)] transition-all duration-300 hover:scale-105"
                onClick={() => window.open('https://dashboard.kiwify.com/join/affiliate/Vzguntvr', '_blank')}
              >
                QUERO ME AFILIAR AGORA
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer Warning */}
        <section className="py-8 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  <span className="font-bold">🚫 Aviso Importante:</span> É proibido fazer anúncios no Google Ads 
                  para a palavra-chave "TrustPage". Sujeito a banimento da afiliação.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AffiliateProgramPage;
