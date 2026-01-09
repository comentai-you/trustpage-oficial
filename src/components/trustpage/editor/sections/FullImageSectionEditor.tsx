import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FullImageSection } from "@/types/section-builder";
import { Upload, Loader2, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FullImageSectionEditorProps {
  data: FullImageSection['data'];
  onChange: (data: FullImageSection['data']) => void;
}

const FullImageSectionEditor = ({ data, onChange }: FullImageSectionEditorProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `fullimg_${uniqueId}.${fileExt}`;
      const filePath = `${user.id}/sections/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
      
      if (urlData?.publicUrl) {
        onChange({ ...data, imageUrl: urlData.publicUrl });
        toast.success("Imagem enviada!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Recommendation */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs text-amber-700">
          <strong>Tamanho recomendado:</strong> 1200x600px ou 1920x800px (proporção 2:1). Use imagens <strong>sem fundo</strong> ou com fundo transparente para melhor resultado.
        </AlertDescription>
      </Alert>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Imagem</Label>
        {data.imageUrl ? (
          <div className="relative">
            <img 
              src={data.imageUrl} 
              alt={data.alt || 'Banner'} 
              className="w-full h-40 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-7 w-7 p-0"
              onClick={() => onChange({ ...data, imageUrl: '' })}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mt-2">Enviar imagem</span>
                <span className="text-[10px] text-muted-foreground">1200x600px recomendado</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Background Option */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs">Fundo na Seção</Label>
          <p className="text-[10px] text-muted-foreground">
            Adiciona um fundo para destacar a imagem
          </p>
        </div>
        <Switch
          checked={data.hasBackground || false}
          onCheckedChange={(checked) => onChange({ ...data, hasBackground: checked })}
        />
      </div>

      {/* Alt text */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Texto Alternativo (SEO)</Label>
        <Input
          value={data.alt || ''}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Descrição da imagem"
          className="text-sm"
        />
      </div>

      {/* Link URL */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Link (opcional)</Label>
        <Input
          value={data.linkUrl || ''}
          onChange={(e) => onChange({ ...data, linkUrl: e.target.value })}
          placeholder="https://..."
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default FullImageSectionEditor;
