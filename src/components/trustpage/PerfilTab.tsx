import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LandingPageFormData } from "@/types/landing-page";
import ImageUpload from "./ImageUpload";
import { Link2 } from "lucide-react";

interface PerfilTabProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
}

const generateSlugPreview = (name: string): string => {
  if (!name.trim()) return "seu-link";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40) || "seu-link";
};

const PerfilTab = ({ formData, onChange }: PerfilTabProps) => {
  const slugPreview = formData.slug || generateSlugPreview(formData.page_name);

  return (
    <div className="space-y-6">
      {/* Profile Image Upload */}
      <ImageUpload
        value={formData.profile_image_url}
        onChange={(url) => onChange({ profile_image_url: url })}
        label="Foto de Perfil"
        hint="Imagem quadrada recomendada (300x300)"
        aspectRatio="square"
      />

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="page_name">
          Nome do Negócio <span className="text-destructive">*</span>
        </Label>
        <Input
          id="page_name"
          placeholder="Ex: Método Emagrecer Rápido"
          value={formData.page_name}
          onChange={(e) => onChange({ page_name: e.target.value })}
          required
        />
        
        {/* URL Preview */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
          <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            <span className="opacity-60">seusite.com/p/</span>
            <span className="font-medium text-foreground">{slugPreview}</span>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Este nome será usado para criar o link público da sua página. Escolha um nome único!
        </p>
      </div>
    </div>
  );
};

export default PerfilTab;
