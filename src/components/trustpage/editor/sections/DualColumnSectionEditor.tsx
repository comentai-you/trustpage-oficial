import { Input } from "@/components/ui/input";
import { InputWithAI } from "@/components/ui/input-with-ai";
import { Label } from "@/components/ui/label";
import { TextareaWithAI } from "@/components/ui/textarea-with-ai";
import { Button } from "@/components/ui/button";
import { DualColumnSection } from "@/types/section-builder";
import { Upload, Loader2, X, ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DualColumnSectionEditorProps {
  data: DualColumnSection['data'];
  onChange: (data: DualColumnSection['data']) => void;
}

const DualColumnSectionEditor = ({ data, onChange }: DualColumnSectionEditorProps) => {
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
      const fileName = `dual_${uniqueId}.${fileExt}`;
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

  const toggleLayout = () => {
    onChange({
      ...data,
      layout: data.layout === 'image-left' ? 'image-right' : 'image-left'
    });
  };

  return (
    <div className="space-y-4">
      {/* Layout Toggle */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Layout</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleLayout}
          className="w-full"
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          {data.layout === 'image-left' ? 'Imagem à Esquerda' : 'Imagem à Direita'}
        </Button>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Imagem</Label>
        {data.imageUrl ? (
          <div className="relative">
            <img 
              src={data.imageUrl} 
              alt="Coluna" 
              className="w-full h-32 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => onChange({ ...data, imageUrl: '' })}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Enviar imagem</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Título</Label>
        <InputWithAI
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Título da seção"
          className="text-sm"
          aiFieldType="headline"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Conteúdo</Label>
        <TextareaWithAI
          value={data.content || ''}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="Descrição..."
          className="text-sm resize-none"
          rows={4}
          aiFieldType="body"
        />
      </div>

      {/* CTA (Optional) */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Botão (opcional)</Label>
        <InputWithAI
          value={data.ctaText || ''}
          onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
          placeholder="Texto do botão"
          className="text-sm"
          aiFieldType="button"
        />
        {data.ctaText && (
          <Input
            value={data.ctaUrl || ''}
            onChange={(e) => onChange({ ...data, ctaUrl: e.target.value })}
            placeholder="URL do botão"
            className="text-sm"
          />
        )}
      </div>
    </div>
  );
};

export default DualColumnSectionEditor;
