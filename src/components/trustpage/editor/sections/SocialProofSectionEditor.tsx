import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image, Building2, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SocialProofData {
  images: string[];
  variant: 'logos' | 'prints';
  title?: string;
}

interface SocialProofSectionEditorProps {
  data: SocialProofData;
  onChange: (data: SocialProofData) => void;
}

const SocialProofSectionEditor = ({ data, onChange }: SocialProofSectionEditorProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `social-proof-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('landing-pages')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('landing-pages')
        .getPublicUrl(filePath);

      onChange({
        ...data,
        images: [...(data.images || []), urlData.publicUrl]
      });

      toast.success('Imagem adicionada!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...(data.images || [])];
    newImages.splice(index, 1);
    onChange({ ...data, images: newImages });
  };

  return (
    <div className="space-y-4">
      {/* Variant Toggle */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Tipo de Prova Social</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={data.variant === 'logos' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => onChange({ ...data, variant: 'logos' })}
          >
            <Building2 className="w-3 h-3 mr-1" />
            Logos
          </Button>
          <Button
            type="button"
            variant={data.variant === 'prints' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => onChange({ ...data, variant: 'prints' })}
          >
            <Smartphone className="w-3 h-3 mr-1" />
            Prints
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {data.variant === 'logos' 
            ? 'Logotipos em grayscale com hover colorido'
            : 'Prints de celular em grid responsivo'
          }
        </p>
      </div>

      {/* Title (optional) */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Título (opcional)</Label>
        <Input
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder={data.variant === 'logos' ? 'Visto na Mídia' : 'Resultados Reais'}
          className="text-sm"
        />
      </div>

      {/* Images List */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <Image className="w-3 h-3" />
          Imagens ({data.images?.length || 0})
        </Label>
        
        <div className="space-y-2">
          {(data.images || []).map((imageUrl, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
            >
              <img 
                src={imageUrl} 
                alt={`Image ${index + 1}`}
                className="w-12 h-12 object-cover rounded"
              />
              <span className="flex-1 text-xs truncate text-muted-foreground">
                Imagem {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveImage(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Upload Button */}
        <label className="block">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            disabled={uploading}
            asChild
          >
            <span>
              <Plus className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Adicionar Imagem'}
            </span>
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadImage}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default SocialProofSectionEditor;
