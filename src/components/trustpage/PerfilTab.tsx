import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LandingPageFormData } from "@/types/landing-page";
import ImageUpload from "./ImageUpload";

interface PerfilTabProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
}

const PerfilTab = ({ formData, onChange }: PerfilTabProps) => {
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
        <Label htmlFor="page_name">Nome do Negócio</Label>
        <Input
          id="page_name"
          placeholder="Ex: Método Emagrecer Rápido"
          value={formData.page_name}
          onChange={(e) => onChange({ page_name: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Aparece abaixo da foto de perfil
        </p>
      </div>
    </div>
  );
};

export default PerfilTab;
