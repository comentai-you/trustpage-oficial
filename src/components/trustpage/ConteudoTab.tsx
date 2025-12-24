import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LandingPageFormData } from "@/types/landing-page";
import { Type, FileText, Video } from "lucide-react";

interface ConteudoTabProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
}

const ConteudoTab = ({ formData, onChange }: ConteudoTabProps) => {
  return (
    <div className="space-y-6">
      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="headline" className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          Headline Principal
        </Label>
        <Textarea
          id="headline"
          placeholder="Ex: Descubra Como Emagrecer 10kg em 30 Dias Sem Dieta Restritiva"
          value={formData.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Título principal que aparece em destaque
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Descrição (Opcional)
        </Label>
        <Textarea
          id="description"
          placeholder="Uma breve descrição do seu produto ou serviço..."
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
        />
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <Label htmlFor="video_url" className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          Link do Vídeo (YouTube/Vimeo)
        </Label>
        <Input
          id="video_url"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={formData.video_url}
          onChange={(e) => onChange({ video_url: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Cole o link do YouTube ou Vimeo
        </p>
      </div>
    </div>
  );
};

export default ConteudoTab;
