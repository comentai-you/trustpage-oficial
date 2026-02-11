import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Shield, ArrowLeft, Loader2, Camera, Check, AlertCircle, Globe, Copy, ExternalLink, Crown, RefreshCw, Trash2, Lock, ShieldCheck, Info, Building2, Mail, FileText, Sparkles, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PricingModal from "@/components/PricingModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ConfirmDialog from "@/components/ConfirmDialog";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  subscription_status: string;
  plan_type: string;
  custom_domain: string | null;
  domain_verified: boolean;
  company_name: string | null;
  support_email: string | null;
  document_id: string | null;
}

interface UserDomain {
  id: string;
  domain: string;
  verified: boolean;
  is_primary: boolean;
  created_at: string;
}

type VercelVerificationRecord = {
  type: string;
  domain: string;
  value: string;
  reason?: string;
};

type DnsInstruction = {
  type: string;
  name: string;
  value: string;
  note?: string;
};

type SslStatus = {
  status: 'pending' | 'active' | 'error';
  expiresAt: string | null;
};

const TRIAL_DAYS = 14;

const getMaxDomainsForPlan = (planType: string): number => {
  if (['pro', 'pro_yearly'].includes(planType)) return 5;
  if (['essential', 'essential_yearly'].includes(planType)) return 1;
  return 0;
};

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
  
  // Company/Legal states
  const [companyName, setCompanyName] = useState("");
  const [supportEmailField, setSupportEmailField] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [generatingLegalPages, setGeneratingLegalPages] = useState(false);
  const [hasLegalPages, setHasLegalPages] = useState(false);
  
  // Domain states
  const [domainInput, setDomainInput] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [lastDomainCheckAt, setLastDomainCheckAt] = useState<string | null>(null);
  const [vercelVerification, setVercelVerification] = useState<VercelVerificationRecord[] | null>(null);
  const [domainMisconfigured, setDomainMisconfigured] = useState<boolean | null>(null);
  const [removingDomain, setRemovingDomain] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [dnsInstructions, setDnsInstructions] = useState<DnsInstruction | null>(null);
  const [sslStatus, setSslStatus] = useState<SslStatus | null>(null);
  const [isSubdomain, setIsSubdomain] = useState<boolean>(false);
  const [userDomains, setUserDomains] = useState<UserDomain[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [loadingDomains, setLoadingDomains] = useState(false);

  const handleVerifyDomain = useCallback(
    async ({
      silent,
      domain,
    }: {
      silent?: boolean;
      domain?: string;
    } = {}) => {
      const domainToCheck = (domain || profile?.custom_domain || '').trim().toLowerCase();
      if (!domainToCheck) {
        if (!silent) toast.error("Nenhum domínio para verificar");
        return;
      }

      const isManual = !silent;
      if (isManual) setVerifyingDomain(true);

      try {
        const { data, error } = await supabase.functions.invoke('verify-domain', {
          body: { domain: domainToCheck },
        });

        if (error) throw error;
        if (data?.error) {
          if (!silent) toast.error(data.error);
          return;
        }

        const verified = !!data?.verified;

        setProfile((prev) => (prev ? { ...prev, domain_verified: verified } : prev));
        setLastDomainCheckAt(typeof data?.checkedAt === 'string' ? data.checkedAt : new Date().toISOString());
        setVercelVerification(Array.isArray(data?.verification) ? data.verification : null);
        setDomainMisconfigured(typeof data?.misconfigured === 'boolean' ? data.misconfigured : null);
        setIsSubdomain(!!data?.isSubdomain);
        
        // Set DNS instructions from API
        if (data?.dnsInstructions) {
          setDnsInstructions(data.dnsInstructions);
        }
        
        // Set SSL status
        if (data?.ssl) {
          setSslStatus(data.ssl);
        }

        if (!silent) {
          toast.success(
            verified
              ? 'Domínio verificado com sucesso!'
              : 'Ainda aguardando DNS. Veja os registros necessários abaixo.',
          );
        }
      } catch (err: any) {
        console.error('Error verifying domain:', err);
        if (!silent) toast.error(err?.message || 'Erro ao verificar domínio');
      } finally {
        if (isManual) setVerifyingDomain(false);
      }
    },
    [profile?.custom_domain],
  );

  const handleRemoveDomain = async () => {
    setRemovingDomain(true);
    try {
      const { data, error } = await supabase.functions.invoke('remove-domain');

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Domínio removido com sucesso!");
      setProfile(prev => prev ? { ...prev, custom_domain: null, domain_verified: false } : null);
      setShowDnsInstructions(false);
      setVercelVerification(null);
      setDomainMisconfigured(null);
      setDnsInstructions(null);
      setSslStatus(null);
      setDomainInput("");
    } catch (err: any) {
      console.error('Error removing domain:', err);
      toast.error(err?.message || 'Erro ao remover domínio');
    } finally {
      setRemovingDomain(false);
      setShowRemoveConfirm(false);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    if (user) {
      fetchProfile();
      checkLegalPages();
      fetchUserDomains();
    }
  }, [user]);

  const fetchUserDomains = async () => {
    if (!user) return;
    setLoadingDomains(true);
    try {
      const { data, error } = await supabase
        .from('user_domains')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUserDomains(data || []);
      
      // Set selected domain to primary or first
      const primary = data?.find(d => d.is_primary);
      if (primary) {
        setSelectedDomainId(primary.id);
      } else if (data && data.length > 0) {
        setSelectedDomainId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching user domains:', error);
    } finally {
      setLoadingDomains(false);
    }
  };

  const checkLegalPages = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("landing_pages")
        .select("slug")
        .eq("user_id", user.id)
        .in("slug", ["politica-de-privacidade", "termos-de-uso", "contato"]);
      
      setHasLegalPages(data?.length === 3);
    } catch (error) {
      console.error("Error checking legal pages:", error);
    }
  };

  // Auto-refresh domain verification every 60s while pending
  useEffect(() => {
    if (!profile?.custom_domain || profile.domain_verified) return;

    const intervalId = window.setInterval(() => {
      handleVerifyDomain({ silent: true });
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [profile?.custom_domain, profile?.domain_verified, handleVerifyDomain]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at, subscription_status, plan_type, custom_domain, domain_verified, company_name, support_email, document_id")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      setFullName(data?.full_name || "");
      setCompanyName(data?.company_name || "");
      setSupportEmailField(data?.support_email || "");
      setDocumentId(data?.document_id || "");
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
        .update({ 
          full_name: fullName,
          company_name: companyName.trim() || null,
          support_email: supportEmailField.trim() || null,
          document_id: documentId.trim() || null,
        })
        .eq("id", user.id);

      if (error) throw error;
      setProfile(prev => prev ? { 
        ...prev, 
        full_name: fullName,
        company_name: companyName.trim() || null,
        support_email: supportEmailField.trim() || null,
        document_id: documentId.trim() || null,
      } : null);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const generateLegalPageContent = (
    type: 'privacy' | 'terms' | 'contact',
    company: string,
    email: string
  ): { headline: string; description: string; content: Json } => {
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    if (type === 'privacy') {
      const description = `# Política de Privacidade\n\n**${company}**\n\n*Última atualização: ${currentDate}*\n\n## 1. Informações que Coletamos\n\nColetamos informações que você nos fornece diretamente, como nome, e-mail e outras informações de contato.\n\n## 2. Como Usamos Suas Informações\n\nUtilizamos as informações coletadas para:\n- Fornecer e melhorar nossos serviços\n- Processar transações e enviar notificações\n- Responder a solicitações e fornecer suporte\n\n## 3. Cookies e Tecnologias de Rastreamento\n\nUtilizamos cookies e tecnologias de rastreamento de terceiros (como Facebook Pixel e Google Analytics) para analisar o tráfego e personalizar anúncios. Ao utilizar nosso site, você concorda com o uso dessas tecnologias.\n\n## 4. Seus Direitos\n\nVocê tem direito a acessar, corrigir ou excluir seus dados pessoais.\n\n## 5. Contato\n\n**E-mail:** ${email}`;
      return {
        headline: 'Política de Privacidade',
        description,
        content: [{ id: '1', type: 'text', content: description }]
      };
    }

    if (type === 'terms') {
      const description = `# Termos de Uso\n\n**${company}**\n\n*Última atualização: ${currentDate}*\n\n## 1. Aceitação dos Termos\n\nAo acessar e utilizar nossos serviços, você concorda com estes Termos de Uso.\n\n## 2. Responsabilidades do Usuário\n\nVocê concorda em fornecer informações verdadeiras e não utilizar os serviços para fins ilegais.\n\n## 3. Propriedade Intelectual\n\nTodo o conteúdo é protegido por direitos autorais.\n\n## 4. Contato\n\n**E-mail:** ${email}`;
      return {
        headline: 'Termos de Uso',
        description,
        content: [{ id: '1', type: 'text', content: description }]
      };
    }

    const description = `# Entre em Contato\n\n**${company}**\n\nEstamos aqui para ajudar!\n\n---\n\n## 📧 E-mail\n\n**${email}**\n\nRespondemos em até 48 horas úteis.\n\n---\n\n## Horário de Atendimento\n\nSegunda a Sexta: 9h às 18h (horário de Brasília)`;
    return {
      headline: 'Contato',
      description,
      content: [{ id: '1', type: 'text', content: description }]
    };
  };

  const handleGenerateLegalPages = async () => {
    if (!user) return;
    
    // Validate required fields
    if (!companyName.trim() || !supportEmailField.trim()) {
      toast.error("Preencha o nome da empresa e e-mail de suporte antes de gerar as páginas");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supportEmailField)) {
      toast.error("E-mail de suporte inválido");
      return;
    }

    setGeneratingLegalPages(true);

    try {
      // First save the profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          company_name: companyName.trim(),
          support_email: supportEmailField.trim(),
          document_id: documentId.trim() || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Check if legal pages already exist
      const { data: existingPages } = await supabase
        .from("landing_pages")
        .select("id, slug")
        .eq("user_id", user.id)
        .in("slug", ["politica-de-privacidade", "termos-de-uso", "contato"]);

      const existingMap = new Map((existingPages || []).map(p => [p.slug, p.id]));

      const legalPages: Array<{ type: 'privacy' | 'terms' | 'contact'; slug: string; name: string }> = [
        { type: 'privacy', slug: 'politica-de-privacidade', name: 'Política de Privacidade' },
        { type: 'terms', slug: 'termos-de-uso', name: 'Termos de Uso' },
        { type: 'contact', slug: 'contato', name: 'Contato' },
      ];

      let createdCount = 0;
      let updatedCount = 0;

      // Upsert: update existing or create new
      for (const page of legalPages) {
        const generatedContent = generateLegalPageContent(page.type, companyName.trim(), supportEmailField.trim());
        const existingId = existingMap.get(page.slug);

        if (existingId) {
          // Update existing page with fresh content
          const { error: updateError } = await supabase
            .from("landing_pages")
            .update({
              headline: generatedContent.headline,
              description: generatedContent.description,
              content: generatedContent.content,
              is_published: true,
            })
            .eq("id", existingId);

          if (updateError) {
            console.error(`Error updating ${page.slug}:`, updateError);
          } else {
            updatedCount++;
          }
        } else {
          // Create new page
          const { error: insertError } = await supabase
            .from("landing_pages")
            .insert({
              user_id: user.id,
              slug: page.slug,
              page_name: page.name,
              headline: generatedContent.headline,
              description: generatedContent.description,
              content: generatedContent.content,
              template_type: 'bio',
              template_id: 1,
              is_published: true,
              primary_color: '#8B5CF6',
              colors: { background: '#FFFFFF', text: '#1F2937', primary: '#8B5CF6' },
            });

          if (insertError) {
            console.error(`Error creating ${page.slug}:`, insertError);
            throw insertError;
          }
          createdCount++;
        }
      }

      if (createdCount > 0 || updatedCount > 0) {
        const msgs: string[] = [];
        if (createdCount > 0) msgs.push(`${createdCount} criada(s)`);
        if (updatedCount > 0) msgs.push(`${updatedCount} atualizada(s)`);
        toast.success(`Páginas legais: ${msgs.join(', ')}`);
      } else {
        toast.info("Páginas legais já estão atualizadas");
      }

      setHasLegalPages(true);
      setProfile(prev => prev ? {
        ...prev,
        company_name: companyName.trim(),
        support_email: supportEmailField.trim(),
        document_id: documentId.trim() || null,
      } : null);
    } catch (error: any) {
      console.error("Error generating legal pages:", error);
      toast.error(error.message || "Erro ao gerar páginas legais");
    } finally {
      setGeneratingLegalPages(false);
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

    // Check domain limits
    const maxDomains = getMaxDomainsForPlan(profile?.plan_type || 'free');
    if (userDomains.length >= maxDomains) {
      toast.error(`Você atingiu o limite de ${maxDomains} domínios para o seu plano.`);
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
      setDomainInput("");
      // Refresh domains list
      await fetchUserDomains();
      setShowDnsInstructions(true);
    } catch (error: any) {
      console.error("Error adding domain:", error);
      toast.error(error.message || "Erro ao adicionar domínio");
    } finally {
      setAddingDomain(false);
    }
  };

  const handleRemoveDomainById = async (domainId: string, domainName: string) => {
    setRemovingDomain(true);
    try {
      const { data, error } = await supabase.functions.invoke('remove-domain', {
        body: { domainId }
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`Domínio ${domainName} removido com sucesso!`);
      // Refresh domains list
      await fetchUserDomains();
      // Refresh profile to update custom_domain
      await fetchProfile();
      
      if (userDomains.length <= 1) {
        setShowDnsInstructions(false);
        setVercelVerification(null);
        setDomainMisconfigured(null);
        setDnsInstructions(null);
        setSslStatus(null);
      }
    } catch (err: any) {
      console.error('Error removing domain:', err);
      toast.error(err?.message || 'Erro ao remover domínio');
    } finally {
      setRemovingDomain(false);
      setShowRemoveConfirm(false);
    }
  };

  const handleVerifyDomainById = async (domainId: string) => {
    setVerifyingDomain(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: { domainId }
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const verified = !!data?.verified;
      toast.success(
        verified
          ? 'Domínio verificado com sucesso!'
          : 'Ainda aguardando DNS. Veja os registros necessários abaixo.',
      );

      // Update local state
      setUserDomains(prev => prev.map(d => 
        d.id === domainId ? { ...d, verified } : d
      ));
      setVercelVerification(Array.isArray(data?.verification) ? data.verification : null);
      setDomainMisconfigured(typeof data?.misconfigured === 'boolean' ? data.misconfigured : null);
      setIsSubdomain(!!data?.isSubdomain);
      
      if (data?.dnsInstructions) {
        setDnsInstructions(data.dnsInstructions);
      }
      
      if (data?.ssl) {
        setSslStatus(data.ssl);
      }
      
      setLastDomainCheckAt(new Date().toISOString());
    } catch (err: any) {
      console.error('Error verifying domain:', err);
      toast.error(err?.message || 'Erro ao verificar domínio');
    } finally {
      setVerifyingDomain(false);
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
            {profile?.subscription_status !== 'free' && profile?.plan_type !== 'free' && (
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

            {/* Company/Legal Data Card */}
            <Card className={!hasLegalPages ? "border-amber-500/50 bg-amber-500/5" : ""}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  <CardTitle>Dados Legais / Empresa</CardTitle>
                </div>
                <CardDescription>
                  Informações necessárias para gerar suas páginas legais obrigatórias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasLegalPages && (
                  <Alert className="border-amber-500/50 bg-amber-500/10">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      <strong>Importante:</strong> As páginas legais (Política de Privacidade, Termos de Uso e Contato) são obrigatórias 
                      para evitar problemas jurídicos com as plataformas de anúncios (Facebook, Google, etc.) e para cumprir 
                      a LGPD. Preencha os dados abaixo e clique em "Gerar Páginas Legais".
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Nome da Empresa ou Pessoa *
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: João Silva ou Empresa XYZ Ltda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    E-mail de Suporte *
                  </Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmailField}
                    onChange={(e) => setSupportEmailField(e.target.value)}
                    placeholder="suporte@exemplo.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este e-mail será exibido nas páginas legais para contato
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentId" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    CPF/CNPJ <span className="text-xs text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="documentId"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    onClick={handleGenerateLegalPages} 
                    disabled={generatingLegalPages || !companyName.trim() || !supportEmailField.trim()}
                    className={hasLegalPages ? "bg-muted text-muted-foreground hover:bg-muted" : ""}
                    variant={hasLegalPages ? "outline" : "default"}
                  >
                    {generatingLegalPages ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {hasLegalPages ? "Regenerar Páginas Legais" : "Gerar Páginas Legais"}
                      </>
                    )}
                  </Button>
                  
                  {hasLegalPages && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <Check className="w-4 h-4" />
                      <span>Páginas legais já criadas</span>
                    </div>
                  )}
                </div>

                {(!companyName.trim() || !supportEmailField.trim()) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Preencha o nome e e-mail para habilitar a geração das páginas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6 animate-fade-in">
            {/* Plan Status Card */}
            {(profile?.subscription_status === 'free' || profile?.plan_type === 'free') ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Plano Gratuito
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Você está no plano gratuito com Bio Link e Landing Page. Faça upgrade para desbloquear VSL, Quiz, Clonador, domínio próprio e mais!
                      </p>
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
            ) : profile?.subscription_status === 'active' ? (
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Plano {profile?.plan_type === 'pro' || profile?.plan_type === 'pro_yearly' ? 'Pro' : 'Essencial'} Ativo
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Você tem acesso a todos os recursos do seu plano
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

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
            {/* Check for paid plan access (Essential or higher) */}
            {!['pro', 'pro_yearly', 'essential', 'essential_yearly'].includes(profile?.plan_type || '') ? (
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-warning" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Recurso exclusivo dos Planos Pagos
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Domínios personalizados estão disponíveis a partir do plano Essencial (1 domínio) ou PRO (até 5 domínios).
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
                {/* Domain Usage Stats */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary" />
                        <span className="font-medium">Domínios</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{userDomains.length}</span>
                        {' / '}
                        <span>{getMaxDomainsForPlan(profile?.plan_type || 'free')}</span>
                        {' utilizados'}
                      </div>
                    </div>
                    <Progress 
                      value={(userDomains.length / getMaxDomainsForPlan(profile?.plan_type || 'free')) * 100} 
                      className="mt-2 h-2"
                    />
                  </CardContent>
                </Card>

                {/* Domains List */}
                {userDomains.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Seus Domínios
                      </CardTitle>
                      <CardDescription>
                        Gerencie seus domínios personalizados
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {userDomains.map((domain) => (
                        <div 
                          key={domain.id} 
                          className={`p-4 rounded-lg border ${domain.verified ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${domain.verified ? 'bg-success/20' : 'bg-warning/20'}`}>
                                <Globe className={`w-4 h-4 ${domain.verified ? 'text-success' : 'text-warning'}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-sm truncate">{domain.domain}</span>
                                  {domain.is_primary && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Principal</span>
                                  )}
                                  {domain.verified ? (
                                    <span className="text-success flex items-center gap-1 text-xs">
                                      <Check className="w-3 h-3" /> Verificado
                                    </span>
                                  ) : (
                                    <span className="text-warning flex items-center gap-1 text-xs">
                                      <AlertCircle className="w-3 h-3" /> Aguardando DNS
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!domain.verified && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVerifyDomainById(domain.id)}
                                  disabled={verifyingDomain}
                                >
                                  {verifyingDomain ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveDomainById(domain.id, domain.domain)}
                                disabled={removingDomain}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {removingDomain ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Add Domain Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Adicionar Novo Domínio
                    </CardTitle>
                    <CardDescription>
                      Conecte um domínio personalizado às suas páginas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="border-amber-500/50 bg-amber-500/10">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>Atenção:</strong> O domínio personalizado funcionará <strong>exclusivamente</strong> para suas páginas do TrustPage.
                      </AlertDescription>
                    </Alert>
                    
                    {userDomains.length >= getMaxDomainsForPlan(profile?.plan_type || 'free') ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Você atingiu o limite de {getMaxDomainsForPlan(profile?.plan_type || 'free')} domínios para o seu plano. 
                          Remova um domínio existente para adicionar outro.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="domain">Seu Domínio ou Subdomínio</Label>
                        <div className="flex gap-2">
                          <Input
                            id="domain"
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value)}
                            placeholder="meusite.com.br ou app.meusite.com.br"
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
                          Exemplos: <code className="bg-muted px-1 rounded">meusite.com.br</code> ou <code className="bg-muted px-1 rounded">app.meusite.com.br</code>
                        </p>
                      </div>
                    )}
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
                      {/* DNS Instructions - always show based on domain type */}
                      <div className="bg-muted rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">
                            {isSubdomain ? 'Configuração para Subdomínio' : 'Configuração para Domínio Raiz'}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-2">
                          <span>Tipo</span>
                          <span>Nome</span>
                          <span>Destino</span>
                        </div>
                        
                        {isSubdomain ? (
                          /* Subdomain: show CNAME */
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <span className="font-mono bg-background px-2 py-1 rounded text-sm">CNAME</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono bg-background px-2 py-1 rounded text-sm">
                                {dnsInstructions?.name || profile?.custom_domain?.split('.')[0] || 'subdomain'}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0"
                                onClick={() => copyToClipboard(dnsInstructions?.name || profile?.custom_domain?.split('.')[0] || 'subdomain')}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono bg-background px-2 py-1 rounded text-sm break-all">cname.vercel-dns.com</span>
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
                        ) : (
                          /* Apex domain: show A record (required) */
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <span className="font-mono bg-background px-2 py-1 rounded text-sm">A</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono bg-background px-2 py-1 rounded text-sm">@</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0"
                                onClick={() => copyToClipboard('@')}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono bg-background px-2 py-1 rounded text-sm">216.198.79.1</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 flex-shrink-0"
                                onClick={() => copyToClipboard('216.198.79.1')}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* For apex domain, also require adding www CNAME */}
                        {!isSubdomain && (
                          <>
                            <div className="border-t border-border pt-3 mt-3">
                              <p className="text-xs text-foreground font-medium mb-2">
                                <strong>Obrigatório:</strong> Para que www.{profile?.custom_domain} também funcione:
                              </p>
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
                                <span className="font-mono bg-background px-2 py-1 rounded text-sm break-all">cname.vercel-dns.com</span>
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
                            
                            {/* Nameservers Section */}
                            <div className="border-t border-border pt-3 mt-3">
                              <p className="text-xs text-foreground font-medium mb-2">
                                <strong>Etapa Final:</strong> Altere os nameservers do seu domínio para o Vercel DNS:
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 justify-between p-2 bg-background rounded-lg">
                                <span className="font-mono text-sm break-all">ns1.vercel-dns.com</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 flex-shrink-0"
                                  onClick={() => copyToClipboard('ns1.vercel-dns.com')}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 justify-between p-2 bg-background rounded-lg">
                                <span className="font-mono text-sm break-all">ns2.vercel-dns.com</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 flex-shrink-0"
                                  onClick={() => copyToClipboard('ns2.vercel-dns.com')}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              💡 A alteração dos nameservers pode levar algumas horas para propagar.
                            </p>
                          </>
                        )}
                      </div>

                      {domainMisconfigured && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm space-y-2">
                            <p><strong>DNS Misconfigured:</strong> O DNS pode estar apontando para outro serviço.</p>
                            <ul className="list-disc list-inside text-xs space-y-1 mt-2">
                              <li>Verifique se não há registros A ou CNAME conflitantes no seu provedor</li>
                              <li>Remova registros antigos que possam estar apontando para outro IP</li>
                              <li>Aguarde a propagação DNS (pode levar até 48h)</li>
                              <li>Certifique-se de que o domínio não está em outro projeto Vercel</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {vercelVerification?.length ? (
                        <div className="bg-muted rounded-lg p-4 space-y-3">
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-warning" />
                            Registros adicionais exigidos pela Vercel
                          </p>
                          <div className="space-y-2">
                            {vercelVerification.map((rec, idx) => (
                              <div
                                key={`${rec.type}-${idx}`}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start"
                              >
                                <span className="font-mono bg-background px-2 py-1 rounded text-xs sm:text-sm">
                                  {rec.type}
                                </span>

                                <div className="flex items-center gap-1 min-w-0">
                                  <span className="font-mono bg-background px-2 py-1 rounded text-xs sm:text-sm break-all">
                                    {rec.domain}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 flex-shrink-0"
                                    onClick={() => copyToClipboard(rec.domain)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>

                                <div className="flex items-center gap-1 min-w-0">
                                  <span className="font-mono bg-background px-2 py-1 rounded text-xs sm:text-sm break-all">
                                    {rec.value}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 flex-shrink-0"
                                    onClick={() => copyToClipboard(rec.value)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

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

                      {/* Video Tutorial */}
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <iframe
                          src="https://player.vimeo.com/video/1153607914?h=0&title=0&byline=0&portrait=0"
                          className="w-full h-full"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title="Tutorial de configuração de domínio"
                        />
                      </div>

                      <Button variant="outline" className="w-full" onClick={() => navigate('/help')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver documentação completa
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
      <ConfirmDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        title="Remover Domínio"
        description={`Tem certeza que deseja remover o domínio "${profile?.custom_domain}"? Esta ação irá desconectar o domínio do seu projeto.`}
        confirmText="Remover"
        onConfirm={handleRemoveDomain}
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default SettingsPage;
