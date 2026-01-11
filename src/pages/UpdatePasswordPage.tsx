import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detectar sessão do link de convite/recuperação
  useEffect(() => {
    let cancelled = false;

    const cleanupUrl = (opts?: { clearHash?: boolean }) => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        // Mantém outros params (se existirem). Remover `type` ajuda a evitar reprocessamento.
        url.searchParams.delete("type");
        if (opts?.clearHash) url.hash = "";
        window.history.replaceState({}, document.title, url.toString());
      } catch {
        // noop
      }
    };

    const prepareSessionFromUrl = async () => {
      // 1) Fluxo PKCE: /auth/update-password?code=...
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(url.toString());
        if (error) throw error;
        cleanupUrl();
      }

      // 2) Fluxo implícito: #access_token=...&refresh_token=...
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) throw error;
        cleanupUrl({ clearHash: true });
      }
    };

    const checkSession = async () => {
      try {
        await prepareSessionFromUrl();

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error) {
          console.error("Session error:", error);
          setSessionError("Link inválido ou expirado. Solicite um novo link.");
          return;
        }

        if (session) {
          setIsSessionReady(true);
          return;
        }

        // Aguardar evento de auth para links de recuperação/convite
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (cancelled) return;
          if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
            setIsSessionReady(true);
          }
        });

        const timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          setSessionError(
            "Não foi possível verificar sua sessão. Tente acessar novamente pelo link do email."
          );
        }, 8000);

        return () => {
          subscription.unsubscribe();
          window.clearTimeout(timeoutId);
        };
      } catch (err: any) {
        if (cancelled) return;
        console.error("Check session error:", err);
        setSessionError(
          err?.message
            ? `Erro ao verificar sessão: ${err.message}`
            : "Erro ao verificar sessão. Tente novamente."
        );
      }
    };

    let unsubscribe: void | (() => void);
    void checkSession().then((u) => {
      unsubscribe = u;
    });

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const validatePassword = (): string | null => {
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }
    if (password !== confirmPassword) {
      return "As senhas não coincidem";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword();
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi definida com sucesso. Redirecionando...",
      });

      // Pequeno delay para mostrar o toast antes de redirecionar
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Update password error:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Não foi possível atualizar sua senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de erro de sessão
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Link Inválido</CardTitle>
            <CardDescription className="text-destructive">
              {sessionError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/auth")}
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de loading enquanto verifica sessão
  if (!isSessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Verificando seu acesso...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Defina sua Senha de Acesso</CardTitle>
          <CardDescription>
            Crie uma senha segura para acessar sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pr-10"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente"
                  className="pr-10"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Indicador de match */}
            {confirmPassword && (
              <div className={`flex items-center gap-2 text-sm ${password === confirmPassword ? 'text-green-600' : 'text-destructive'}`}>
                {password === confirmPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Senhas coincidem</span>
                  </>
                ) : (
                  <>
                    <span>As senhas não coincidem</span>
                  </>
                )}
              </div>
            )}

            {/* Botão Submit */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading || password.length < 6 || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar e Entrar"
              )}
            </Button>
          </form>

          {/* Dica de segurança */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Dica: Use letras maiúsculas, números e símbolos para uma senha forte
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePasswordPage;