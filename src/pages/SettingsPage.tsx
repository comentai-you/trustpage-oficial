import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Shield, ArrowLeft, Loader2, Camera, Check, AlertCircle, Globe, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PricingModal from "@/components/PricingModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  subscription_status: string;
  plan_type: string;
  custom_domain: string | null;
  domain_verified: boolean;
}

const TRIAL_DAYS = 14;

const SettingsPage = () => {
  const { user, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  // Domain states
  const [domainInput, setDomainInput] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at, subscription_status, plan_type, custom_domain, domain_verified")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      setFullName(data?.full_name || "");
      if (data?.custom_domain) {
        setShowDnsInstructions(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const getTrialDaysRemaining = () => {
    if (!profile) return 0;
    const createdAt = new Date(profile.created_at);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diffDays);
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const trialProgress = ((TRIAL_DAYS - trialDaysRemaining) / TRIAL_DAYS) * 100;

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success("Avatar atualizado!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Erro ao fazer upload do avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResettingPassword(true);
    try {
      const { error } = await resetPassword(user.email);
      if (error) throw error;
      toast.success("Email de redefinição de senha enviado!");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Erro ao enviar email de redefinição");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setResettingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Erro ao alterar senha");
    } finally {
      setResettingPassword(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleAddDomain = async () => {
    if (!domainInput.trim()) {
      toast.error("Digite um domínio válido");
      return;
    }

    // Basic domain validation
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domainInput.trim())) {
      toast.error("Formato de domínio inválido. Ex: meusite.com.br");
      return;
    }

    setAddingDomain(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-domain', {
        body: { domain: domainInput.trim().toLowerCase() }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Domínio adicionado com sucesso!");
      setProfile(prev => prev ? { ...prev, custom_domain: domainInput.trim().toLowerCase(), domain_verified: false } : null);
      setShowDnsInstructions(true);
      setDomainInput("");
    } catch (error: any) {
      console.error("Error adding domain:", error);
      toast.error(error.message || "Erro ao adicionar domínio");
    } finally {
      setAddingDomain(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  if (loading) {
    return (
      <DashboardLayout avatarUrl={null} fullName={null}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout avatarUrl={profile?.avatar_url} fullName={profile?.full_name}>
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua conta e preferências</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Meu Perfil</span>
              <span className="sm:hidden">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-background">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Assinatura</span>
              <span className="sm:hidden">Plano</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Shield className="w-4 h-4" />
              <span>Segurança</span>
            </TabsTrigger>
            {profile?.subscription_status !== 'trial' && (
              <TabsTrigger value="domains" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Domínios</span>
                <span className="sm:hidden">DNS</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>Sua foto será exibida no menu do sistema</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-border">
                    <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl font-bold">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG ou GIF. Máximo 2MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize suas informações de conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6 animate-fade-in">
            {/* Trial/Plan Status Card */}
            {profile?.subscription_status === 'trial' ? (
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Seu teste grátis expira em {trialDaysRemaining} dia{trialDaysRemaining !== 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Aproveite todos os recursos do TrustPage durante seu período de teste
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso do Trial</span>
                          <span className="font-medium">{TRIAL_DAYS - trialDaysRemaining} de {TRIAL_DAYS} dias</span>
                        </div>
                        <Progress value={trialProgress} className="h-2" />
                      </div>
                      <Button 
                        className="gradient-button text-primary-foreground border-0 w-full sm:w-auto"
                        onClick={() => setShowPricingModal(true)}
                      >
                        Fazer Upgrade Agora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Plano {profile?.plan_type === 'pro' ? 'Pro' : 'Essencial'} Ativo
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Você tem acesso a todos os recursos do seu plano
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Faturas</CardTitle>
                <CardDescription>Suas últimas transações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Nenhuma fatura disponível</p>
                  <p className="text-sm">Suas faturas aparecerão aqui após a primeira cobrança</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                  />
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={resettingPassword || !newPassword || !confirmPassword}
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    "Alterar Senha"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redefinir Senha por E-mail</CardTitle>
                <CardDescription>Receba um link para redefinir sua senha</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Enviaremos um e-mail para <strong>{user?.email}</strong> com um link para redefinir sua senha.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar E-mail de Redefinição"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domains Tab */}
          <TabsContent value="domains" className="space-y-6 animate-fade-in">
            {profile?.subscription_status === 'trial' ? (
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-warning" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Recurso não disponível no Trial
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Domínios personalizados estão disponíveis nos planos Essential e Pro.
                      </p>
                      <Button 
                        className="gradient-button text-primary-foreground border-0"
                        onClick={() => setShowPricingModal(true)}
                      >
                        Fazer Upgrade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Current Domain */}
                {profile?.custom_domain && (
                  <Card className="border-success/30 bg-success/5">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-6 h-6 text-success" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            Domínio Configurado
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="font-mono bg-muted px-2 py-1 rounded">{profile.custom_domain}</span>
                            {profile.domain_verified ? (
                              <span className="text-success flex items-center gap-1">
                                <Check className="w-4 h-4" /> Verificado
                              </span>
                            ) : (
                              <span className="text-warning flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" /> Aguardando DNS
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Add Domain Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Conectar Domínio Personalizado
                    </CardTitle>
                    <CardDescription>
                      Use seu próprio domínio para suas páginas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Seu Domínio</Label>
                      <div className="flex gap-2">
                        <Input
                          id="domain"
                          value={domainInput}
                          onChange={(e) => setDomainInput(e.target.value)}
                          placeholder="meusite.com.br"
                          disabled={addingDomain}
                        />
                        <Button 
                          onClick={handleAddDomain} 
                          disabled={addingDomain || !domainInput.trim()}
                        >
                          {addingDomain ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Conectando...
                            </>
                          ) : (
                            "Conectar"
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Digite apenas o domínio, sem "https://" ou "www"
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* DNS Instructions */}
                {(showDnsInstructions || profile?.custom_domain) && (
                  <Card className="border-primary/30">
                    <CardHeader className="bg-primary/5">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        Configure seu DNS agora
                      </CardTitle>
                      <CardDescription>
                        Adicione o seguinte registro no painel do seu provedor de domínio
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-muted rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-2">
                          <span>Tipo</span>
                          <span>Nome</span>
                          <span>Destino</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <span className="font-mono bg-background px-2 py-1 rounded text-sm">CNAME</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono bg-background px-2 py-1 rounded text-sm">www</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => copyToClipboard('www')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono bg-background px-2 py-1 rounded text-sm text-xs sm:text-sm">cname.vercel-dns.com</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 flex-shrink-0"
                              onClick={() => copyToClipboard('cname.vercel-dns.com')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Para domínio raiz (sem www):</strong> Configure um registro A apontando para <code className="bg-muted px-1 rounded">76.76.21.21</code>
                        </AlertDescription>
                      </Alert>

                      <div className="text-sm text-muted-foreground space-y-2">
                        <p className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          A propagação do DNS pode levar até 48 horas
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          O SSL será provisionado automaticamente após a verificação
                        </p>
                      </div>

                      <Button variant="outline" className="w-full" asChild>
                        <a 
                          href="https://docs.lovable.dev/features/custom-domain" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver documentação completa
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <PricingModal 
        open={showPricingModal} 
        onOpenChange={setShowPricingModal}
        userFullName={profile?.full_name}
      />
    </DashboardLayout>
  );
};

export default SettingsPage;
