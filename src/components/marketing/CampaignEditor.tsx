import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Clock,
  Loader2,
  Smartphone,
  Monitor,
  TestTube,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import MarketingEmailEditor from "./MarketingEmailEditor";
import EmailPreview from "./EmailPreview";

interface Campaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  scheduled_at: string | null;
  status: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

interface CampaignEditorProps {
  campaign: Campaign | null;
  onClose: () => void;
}

const CampaignEditor = ({ campaign, onClose }: CampaignEditorProps) => {
  const [title, setTitle] = useState(campaign?.title || "");
  const [subject, setSubject] = useState(campaign?.subject || "");
  const [content, setContent] = useState(campaign?.content || "");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    campaign?.scheduled_at ? new Date(campaign.scheduled_at) : undefined
  );
  const [scheduledTime, setScheduledTime] = useState(
    campaign?.scheduled_at
      ? format(new Date(campaign.scheduled_at), "HH:mm")
      : "09:00"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("desktop");
  const [testEmail, setTestEmail] = useState("");

  // Auto-save after changes
  const autoSave = useCallback(async () => {
    if (!title.trim() || !subject.trim()) return;

    try {
      if (campaign?.id) {
        await supabase
          .from("marketing_campaigns")
          .update({
            title,
            subject,
            content,
          })
          .eq("id", campaign.id);
      }
      setLastSaved(new Date());
    } catch (err) {
      console.error("Auto-save error:", err);
    }
  }, [title, subject, content, campaign?.id]);

  // Debounced auto-save
  useEffect(() => {
    if (!campaign?.id) return;
    const timer = setTimeout(autoSave, 3000);
    return () => clearTimeout(timer);
  }, [content, autoSave, campaign?.id]);

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error("Preencha o título da campanha");
      return;
    }
    if (!subject.trim()) {
      toast.error("Preencha o assunto do email");
      return;
    }

    setIsSaving(true);
    try {
      if (campaign?.id) {
        const { error } = await supabase
          .from("marketing_campaigns")
          .update({
            title,
            subject,
            content,
            status: "draft",
            scheduled_at: null,
          })
          .eq("id", campaign.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("marketing_campaigns").insert({
          title,
          subject,
          content,
          status: "draft",
        });

        if (error) throw error;
      }

      toast.success("Rascunho salvo!");
      setLastSaved(new Date());
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!title.trim() || !subject.trim()) {
      toast.error("Preencha título e assunto");
      return;
    }
    if (!content.trim()) {
      toast.error("Adicione conteúdo ao email");
      return;
    }
    if (!scheduledDate) {
      toast.error("Selecione uma data para envio");
      return;
    }

    const [hours, minutes] = scheduledTime.split(":").map(Number);
    const scheduledAt = setMinutes(setHours(scheduledDate, hours), minutes);

    if (scheduledAt <= new Date()) {
      toast.error("A data de envio deve ser no futuro");
      return;
    }

    setIsScheduling(true);
    try {
      if (campaign?.id) {
        const { error } = await supabase
          .from("marketing_campaigns")
          .update({
            title,
            subject,
            content,
            status: "pending",
            scheduled_at: scheduledAt.toISOString(),
          })
          .eq("id", campaign.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("marketing_campaigns").insert({
          title,
          subject,
          content,
          status: "pending",
          scheduled_at: scheduledAt.toISOString(),
        });

        if (error) throw error;
      }

      toast.success(
        `Campanha agendada para ${format(scheduledAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
      );
      onClose();
    } catch (err) {
      console.error("Schedule error:", err);
      toast.error("Erro ao agendar campanha");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error("Informe o email de teste");
      return;
    }
    if (!subject.trim()) {
      toast.error("Preencha o assunto do email");
      return;
    }

    setIsSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke("send-marketing-email", {
        body: {
          type: "test",
          to: testEmail,
          subject,
          content,
        },
      });

      if (error) throw error;
      toast.success(`Email de teste enviado para ${testEmail}`);
    } catch (err) {
      console.error("Test send error:", err);
      toast.error("Erro ao enviar email de teste");
    } finally {
      setIsSendingTest(false);
    }
  };

  const insertVariable = (variable: string) => {
    // This would be handled by the editor component
    toast.info(`Variável ${variable} inserida`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  {campaign ? "Editar Campanha" : "Nova Campanha"}
                </h1>
                {lastSaved && (
                  <p className="text-xs text-gray-500">
                    Salvo às {format(lastSaved, "HH:mm")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Rascunho
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Envio
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-4">
                    <CalendarComponent
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      locale={ptBR}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSchedule}
                      disabled={isScheduling || !scheduledDate}
                    >
                      {isScheduling ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Confirmar Agendamento
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-60px)]">
        {/* Left Panel - Editor */}
        <div className="flex-1 lg:w-1/2 overflow-y-auto p-4 lg:p-6 bg-white dark:bg-gray-800 lg:border-r">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Campaign Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Campanha (interno)</Label>
                <Input
                  id="title"
                  placeholder="Ex: Newsletter de Janeiro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject">Assunto do Email</Label>
                <Input
                  id="subject"
                  placeholder="Ex: 🚀 Novidades que você precisa ver!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Variables Toolbar */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-500">Inserir variável:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertVariable("{{user_name}}")}
              >
                <User className="w-3 h-3 mr-1" />
                Nome
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertVariable("{{user_email}}")}
              >
                Email
              </Button>
            </div>

            {/* Rich Text Editor */}
            <div>
              <Label>Conteúdo do Email</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <MarketingEmailEditor
                  value={content}
                  onChange={setContent}
                />
              </div>
            </div>

            {/* Test Send */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Label className="flex items-center gap-2 mb-2">
                <TestTube className="w-4 h-4" />
                Enviar Email de Teste
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleSendTest}
                  disabled={isSendingTest}
                >
                  {isSendingTest ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 lg:w-1/2 bg-gray-200 dark:bg-gray-900 overflow-hidden flex flex-col">
          {/* Preview Header */}
          <div className="p-3 bg-white dark:bg-gray-800 border-b flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pré-visualização
            </span>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={previewMode === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
            <EmailPreview
              subject={subject}
              content={content}
              mode={previewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignEditor;
