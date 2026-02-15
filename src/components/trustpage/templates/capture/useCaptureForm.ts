import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CaptureFormFields {
  showName: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showWhatsapp: boolean;
}

export interface MagnetConfig {
  type: 'link' | 'file';
  link: string;
  fileUrl: string;
}

export interface UseCaptureFormProps {
  pageId?: string;
  ctaUrl?: string;
  formFields: CaptureFormFields;
  magnetConfig: MagnetConfig;
}

export const useCaptureForm = ({ pageId, ctaUrl, formFields, magnetConfig }: UseCaptureFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields: string[] = [];
    if (formFields.showName && !formData.name.trim()) missingFields.push("nome");
    if (formFields.showEmail && !formData.email.trim()) missingFields.push("e-mail");
    if (formFields.showPhone && !formData.phone.trim()) missingFields.push("telefone");
    if (formFields.showWhatsapp && !formData.whatsapp.trim()) missingFields.push("WhatsApp");

    if (missingFields.length > 0) {
      toast.error(`Por favor, preencha: ${missingFields.join(", ")}.`);
      return;
    }

    if (formFields.showEmail && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error("Por favor, insira um e-mail válido.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (pageId) {
        try {
          const { error } = await supabase.functions.invoke('submit-lead', {
            body: {
              landing_page_id: pageId,
              name: formData.name || null,
              email: formData.email || null,
              phone: formData.phone || null,
              whatsapp: formData.whatsapp || null,
              utm_source: new URLSearchParams(window.location.search).get('utm_source') || null,
            },
          });
          if (error) console.error("Error saving lead:", error);
        } catch (leadError) {
          console.error("Error invoking submit-lead:", leadError);
        }
      }

      if (magnetConfig.type === 'link' && magnetConfig.link) {
        window.location.href = magnetConfig.link;
      } else if (magnetConfig.type === 'file' && magnetConfig.fileUrl) {
        setIsSuccess(true);
      } else if (ctaUrl) {
        window.location.href = ctaUrl;
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!magnetConfig.fileUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(magnetConfig.fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const urlParts = magnetConfig.fileUrl.split('/');
      const rawFilename = urlParts[urlParts.length - 1] || 'download';
      const decodedFilename = decodeURIComponent(rawFilename.split('?')[0]);
      const cleanFilename = decodedFilename.replace(/^\d+_/, '').replace(/_/g, ' ');
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFilename || 'Ebook_TrustPage.pdf';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download iniciado! Verifique sua pasta de downloads.");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Erro ao baixar. Tentando abrir em nova aba...");
      window.open(magnetConfig.fileUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    formData,
    isSubmitting,
    isSuccess,
    isDownloading,
    handleInputChange,
    handleSubmit,
    handleDownload,
  };
};
