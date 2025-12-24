import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LandingPageFormData } from "@/types/landing-page";
import { Upload, User } from "lucide-react";

interface PerfilTabProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
}

const PerfilTab = ({ formData, onChange }: PerfilTabProps) => {
  return (
    <div className="space-y-6">
      {/* Profile Image Preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {formData.profile_image_url ? (
            <img
              src={formData.profile_image_url}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground/30">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Cole a URL da sua foto de perfil
        </p>
      </div>

      {/* Profile Image URL */}
      <div className="space-y-2">
        <Label htmlFor="profile_image_url" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          URL da Foto de Perfil
        </Label>
        <Input
          id="profile_image_url"
          type="url"
          placeholder="https://exemplo.com/sua-foto.jpg"
          value={formData.profile_image_url}
          onChange={(e) => onChange({ profile_image_url: e.target.value })}
        />
      </div>

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
