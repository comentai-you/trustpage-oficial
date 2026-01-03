import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Sparkles, Loader2, Check, Play, Zap, Globe, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "login" | "signup" | "forgot";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(formData.email);
        if (error) {
          toast.error("Erro ao enviar email: " + error.message);
          return;
        }
        toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
        setMode("login");
        return;
      }

      if (mode === "signup" && formData.password !== formData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      if ((mode === "login" || mode === "signup") && formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }

      if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      } else if (mode === "signup") {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error("Erro ao conectar com Google: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8 group text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold gradient-text">TrustPage</span>
          </div>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            {mode === "signup" ? (
              <>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-2 sm:mb-3">
                  Crie sua conta grátis
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Comece seu teste de <span className="font-semibold text-primary">14 dias</span>. Cancele a qualquer momento.
                </p>
              </>
            ) : mode === "login" ? (
              <>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-2 sm:mb-3">
                  Bem-vindo de volta!
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Entre na sua conta para continuar
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-2 sm:mb-3">
                  Recuperar senha
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Digite seu email para receber o link de recuperação
                </p>
              </>
            )}
          </div>

          {/* Google Button - only for login/signup */}
          {mode !== "forgot" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12 sm:h-14 text-sm sm:text-base font-medium border-2 hover:bg-muted/50 hover:border-primary/30 transition-all"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </Button>

              {/* Divider */}
              <div className="relative my-6 sm:my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-border/50"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-xs sm:text-sm text-muted-foreground">ou</span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {mode === "signup" && (
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base border-2 focus:border-primary focus:ring-primary/20"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base border-2 focus:border-primary focus:ring-primary/20"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base border-2 focus:border-primary focus:ring-primary/20"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" /> : <Eye className="w-4 sm:w-5 h-4 sm:h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base border-2 focus:border-primary focus:ring-primary/20"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="text-xs sm:text-sm font-medium text-primary hover:underline"
                  onClick={() => setMode("forgot")}
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              size="lg" 
              className={`w-full h-12 sm:h-14 text-sm sm:text-base font-bold relative overflow-hidden ${
                mode === "signup" 
                  ? 'bg-gradient-to-r from-primary via-primary to-accent shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.5)] hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.6)]' 
                  : 'bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25'
              } text-primary-foreground transition-all duration-300`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 mr-2 animate-spin" />
                  {mode === "login" ? "Entrando..." : mode === "signup" ? "Criando conta..." : "Enviando..."}
                </>
              ) : (
                mode === "login" ? "Entrar" : mode === "signup" ? "Criar Conta Grátis" : "Enviar Email"
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 sm:mt-8 text-sm sm:text-base text-muted-foreground">
            {mode === "forgot" ? (
              <>
                Lembrou a senha?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-semibold"
                  disabled={isLoading}
                >
                  Voltar ao login
                </button>
              </>
            ) : mode === "login" ? (
              <>
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline font-semibold"
                  disabled={isLoading}
                >
                  Criar conta grátis
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-semibold"
                  disabled={isLoading}
                >
                  Fazer login
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Side - Visual (Hidden on mobile for signup/login, shown on lg+) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden order-1 lg:order-2">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/30 to-primary/10" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* Content based on mode */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-8 xl:p-12">
          {mode === "signup" ? (
            <>
              {/* iPhone Mockup for Signup */}
              <div className="relative mb-6 xl:mb-8">
                {/* Phone Frame */}
                <div className="relative w-[240px] xl:w-[280px] h-[480px] xl:h-[560px] bg-foreground rounded-[2.5rem] xl:rounded-[3rem] p-2.5 xl:p-3 shadow-2xl shadow-foreground/20 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  {/* Screen */}
                  <div className="w-full h-full bg-white rounded-[2rem] xl:rounded-[2.5rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 xl:w-24 h-5 xl:h-6 bg-foreground rounded-b-xl xl:rounded-b-2xl z-10" />
                    
                    {/* Page Content */}
                    <div className="pt-8 xl:pt-10 px-3 xl:px-4 h-full bg-gradient-to-b from-slate-50 to-white">
                      {/* Profile Section */}
                      <div className="flex items-center gap-2 xl:gap-3 mb-3 xl:mb-4">
                        <div className="w-10 xl:w-12 h-10 xl:h-12 rounded-full bg-gradient-to-br from-primary to-accent" />
                        <div>
                          <div className="text-xs xl:text-sm font-bold text-foreground">Maria Silva</div>
                          <div className="text-[10px] xl:text-xs text-muted-foreground">@mariasilva</div>
                        </div>
                      </div>
                      
                      {/* Video Player */}
                      <div className="relative rounded-lg xl:rounded-xl overflow-hidden mb-3 xl:mb-4 bg-gradient-to-br from-slate-800 to-slate-900 aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 xl:w-12 h-10 xl:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-4 xl:w-5 h-4 xl:h-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1.5 xl:bottom-2 left-1.5 xl:left-2 right-1.5 xl:right-2 h-0.5 xl:h-1 bg-white/20 rounded-full">
                          <div className="w-1/3 h-full bg-primary rounded-full" />
                        </div>
                      </div>
                      
                      {/* Headline */}
                      <h3 className="text-xs xl:text-sm font-bold text-foreground mb-1.5 xl:mb-2 leading-tight">
                        Método Exclusivo de Vendas Online
                      </h3>
                      <p className="text-[10px] xl:text-xs text-muted-foreground mb-3 xl:mb-4">
                        Aprenda a vender todos os dias no automático
                      </p>
                      
                      {/* CTA Button */}
                      <button className="w-full py-2.5 xl:py-3 rounded-lg xl:rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs xl:text-sm shadow-lg shadow-green-500/30">
                        QUERO COMEÇAR AGORA
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-3 xl:-top-4 -right-3 xl:-right-4 w-12 xl:w-16 h-12 xl:h-16 bg-white rounded-xl xl:rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
                  <TrendingUp className="w-6 xl:w-8 h-6 xl:h-8 text-green-500" />
                </div>
                <div className="absolute -bottom-1 xl:-bottom-2 -left-4 xl:-left-6 w-11 xl:w-14 h-11 xl:h-14 bg-white rounded-xl xl:rounded-2xl shadow-xl flex items-center justify-center">
                  <span className="text-xl xl:text-2xl">🚀</span>
                </div>
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap justify-center gap-2 xl:gap-4 max-w-md">
                {[
                  { icon: Zap, text: "Zero Código" },
                  { icon: Globe, text: "Hospedagem Inclusa" },
                  { icon: TrendingUp, text: "Alta Conversão" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-1.5 xl:gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 xl:px-4 py-1.5 xl:py-2 shadow-lg">
                    <div className="w-4 xl:w-5 h-4 xl:h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-2.5 xl:w-3 h-2.5 xl:h-3 text-white" />
                    </div>
                    <span className="text-xs xl:text-sm font-medium text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Logo for Login */}
              <div className="relative mb-6 xl:mb-8">
                <div className="w-32 xl:w-40 h-32 xl:h-40 rounded-[2rem] xl:rounded-[3rem] bg-white/90 backdrop-blur-xl shadow-2xl flex items-center justify-center relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-[2rem] xl:rounded-[3rem] bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />
                  <Sparkles className="w-16 xl:w-20 h-16 xl:h-20 text-primary relative z-10" />
                </div>
                
                {/* Orbiting dots */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 xl:-translate-y-4 w-2.5 xl:w-3 h-2.5 xl:h-3 bg-primary rounded-full" />
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 xl:translate-y-4 w-2 h-2 bg-accent rounded-full" />
                </div>
              </div>
              
              {/* Text */}
              <div className="text-center max-w-sm px-4">
                <h2 className="text-xl xl:text-2xl font-bold text-foreground mb-2 xl:mb-3">
                  Sua bio, sua máquina de vendas.
                </h2>
                <p className="text-muted-foreground text-base xl:text-lg">
                  Continue de onde parou.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Visual Header (Only on mobile) */}
      <div className="lg:hidden order-1 pt-6 pb-4 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === "signup" ? "Crie landing pages que vendem" : mode === "login" ? "Sua máquina de vendas" : "Recupere seu acesso"}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
