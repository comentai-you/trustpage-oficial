import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Mail, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface OnboardingModalProps {
  open: boolean;
  userId: string;
  onComplete: () => void;
}

// Gera conteúdo JSON estruturado para as páginas legais
const generateLegalPageContent = (
  type: 'privacy' | 'terms' | 'contact',
  companyName: string,
  supportEmail: string
): { headline: string; description: string; content: Json } => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  if (type === 'privacy') {
    const description = `# Política de Privacidade

**${companyName}**

*Última atualização: ${currentDate}*

## 1. Informações que Coletamos

Coletamos informações que você nos fornece diretamente, como nome, e-mail e outras informações de contato quando você utiliza nossos serviços.

## 2. Como Usamos Suas Informações

Utilizamos as informações coletadas para:
- Fornecer e melhorar nossos serviços
- Processar transações e enviar notificações relacionadas
- Responder a solicitações e fornecer suporte
- Enviar comunicações de marketing (com seu consentimento)

## 3. Cookies e Tecnologias de Rastreamento

Utilizamos cookies e tecnologias de rastreamento de terceiros (como Facebook Pixel e Google Analytics) para analisar o tráfego e personalizar anúncios. Ao utilizar nosso site, você concorda com o uso dessas tecnologias.

## 4. Compartilhamento de Informações

Não vendemos suas informações pessoais. Podemos compartilhar dados com:
- Prestadores de serviços que auxiliam em nossas operações
- Autoridades quando exigido por lei

## 5. Segurança

Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado.

## 6. Seus Direitos

Você tem direito a:
- Acessar seus dados pessoais
- Corrigir informações incorretas
- Solicitar a exclusão de seus dados
- Revogar consentimentos concedidos

## 7. Contato

Para dúvidas sobre esta política, entre em contato:
**E-mail:** ${supportEmail}

---

Esta política pode ser atualizada periodicamente. Recomendamos revisar regularmente.`;

    return {
      headline: 'Política de Privacidade',
      description,
      content: [
        { id: '1', type: 'text', content: description }
      ],
    };
  }

  if (type === 'terms') {
    const description = `# Termos de Uso

**${companyName}**

*Última atualização: ${currentDate}*

## 1. Aceitação dos Termos

Ao acessar e utilizar nossos serviços, você concorda com estes Termos de Uso. Se não concordar, não utilize nossos serviços.

## 2. Descrição dos Serviços

Oferecemos serviços digitais conforme descrito em nosso site. Reservamo-nos o direito de modificar ou descontinuar serviços a qualquer momento.

## 3. Responsabilidades do Usuário

Ao utilizar nossos serviços, você concorda em:
- Fornecer informações verdadeiras e atualizadas
- Não utilizar os serviços para fins ilegais
- Respeitar os direitos de propriedade intelectual

## 4. Propriedade Intelectual

Todo o conteúdo disponibilizado é protegido por direitos autorais e não pode ser reproduzido sem autorização.

## 5. Limitação de Responsabilidade

Não nos responsabilizamos por:
- Danos indiretos ou consequentes
- Interrupções de serviço
- Perdas de dados

## 6. Modificações

Podemos alterar estes termos a qualquer momento. Alterações significativas serão comunicadas.

## 7. Lei Aplicável

Estes termos são regidos pelas leis do Brasil.

## 8. Contato

Para dúvidas:
**E-mail:** ${supportEmail}`;

    return {
      headline: 'Termos de Uso',
      description,
      content: [
        { id: '1', type: 'text', content: description }
      ],
    };
  }

  // Contact page
  const description = `# Entre em Contato

**${companyName}**

Estamos aqui para ajudar! Se você tem dúvidas, sugestões ou precisa de suporte, entre em contato conosco.

---

## 📧 E-mail

**${supportEmail}**

Respondemos em até 48 horas úteis.

---

## Horário de Atendimento

Segunda a Sexta: 9h às 18h (horário de Brasília)

---

Obrigado por entrar em contato!`;

  return {
    headline: 'Contato',
    description,
    content: [
      { id: '1', type: 'text', content: description }
    ],
  };
};

const OnboardingModal = ({ open, userId, onComplete }: OnboardingModalProps) => {
  const [companyName, setCompanyName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!companyName.trim() || !supportEmail.trim()) {
      toast.error("Preencha o nome e e-mail de suporte");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supportEmail)) {
      toast.error("E-mail inválido");
      return;
    }

    setLoading(true);

    try {
      // 1. Update profile with company data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          company_name: companyName.trim(),
          support_email: supportEmail.trim(),
          document_id: documentId.trim() || null,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // 2. Check if legal pages already exist in legal_pages table
      const { data: existingPages } = await supabase
        .from("legal_pages")
        .select("id, slug")
        .eq("user_id", userId)
        .in("slug", ["politica-de-privacidade", "termos-de-uso", "contato"]);

      const existingMap = new Map((existingPages || []).map(p => [p.slug, p.id]));

      const legalPages: Array<{ type: 'privacy' | 'terms' | 'contact'; slug: string; name: string }> = [
        { type: 'privacy', slug: 'politica-de-privacidade', name: 'Política de Privacidade' },
        { type: 'terms', slug: 'termos-de-uso', name: 'Termos de Uso' },
        { type: 'contact', slug: 'contato', name: 'Contato' },
      ];

      // 3. Upsert: update existing or create new in legal_pages table
      for (const page of legalPages) {
        const generatedContent = generateLegalPageContent(page.type, companyName.trim(), supportEmail.trim());
        const existingId = existingMap.get(page.slug);

        if (existingId) {
          // Update existing page with fresh content
          const { error: updateError } = await supabase
            .from("legal_pages")
            .update({
              title: generatedContent.headline,
              description: generatedContent.description,
              content: generatedContent.content,
              is_published: true,
            })
            .eq("id", existingId);

          if (updateError) {
            console.error(`Error updating ${page.slug}:`, updateError);
          }
        } else {
          // Create new page in legal_pages table
          const { error: insertError } = await supabase
            .from("legal_pages")
            .insert({
              user_id: userId,
              slug: page.slug,
              title: page.name,
              description: generatedContent.description,
              content: generatedContent.content,
              is_published: true,
            });

          if (insertError) {
            console.error(`Error creating ${page.slug}:`, insertError);
            throw insertError;
          }
        }
      }

      toast.success("Configuração concluída! Páginas legais criadas.");
      onComplete();
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">Configuração Inicial</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete suas informações para gerar automaticamente suas páginas legais (Privacidade, Termos e Contato).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Nome da Empresa ou Pessoa *
            </Label>
            <Input
              id="company"
              placeholder="Ex: João Silva ou Empresa XYZ Ltda"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              E-mail de Suporte *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="suporte@exemplo.com"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              CPF/CNPJ <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="document"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave} 
            className="w-full" 
            disabled={loading || !companyName.trim() || !supportEmail.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando páginas...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Salvar e Gerar Páginas Legais
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;