import { Input } from "@/components/ui/input";
import { InputWithAI } from "@/components/ui/input-with-ai";
import { Label } from "@/components/ui/label";
import { TextareaWithAI } from "@/components/ui/textarea-with-ai";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/types/section-builder";
import { Image, Video, Images, Upload, Loader2, X, Play } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface HeroSectionEditorProps {
  data: HeroSection['data'];
  onChange: (data: HeroSection['data']) => void;
}

const HeroSectionEditor = ({ data, onChange }: HeroSectionEditorProps) => {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);

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

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `hero_${uniqueId}.${fileExt}`;
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
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleCarouselImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setUploadingCarousel(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `carousel_${uniqueId}.${fileExt}`;
      const filePath = `${user.id}/carousel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
      
      if (urlData?.publicUrl) {
        const currentImages = data.carouselImages || [];
        onChange({ ...data, carouselImages: [...currentImages, urlData.publicUrl] });
        toast.success("Imagem adicionada ao carrossel!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingCarousel(false);
      e.target.value = '';
    }
  };

  const removeCarouselImage = (index: number) => {
    const newImages = (data.carouselImages || []).filter((_, i) => i !== index);
    onChange({ ...data, carouselImages: newImages });
  };

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Headline Principal</Label>
        <TextareaWithAI
          value={data.headline || ''}
          onChange={(e) => onChange({ ...data, headline: e.target.value })}
          placeholder="Transforme sua vida hoje mesmo"
          className="text-sm resize-none"
          rows={2}
          aiFieldType="headline"
        />
      </div>

      {/* Subheadline */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Subheadline</Label>
        <TextareaWithAI
          value={data.subheadline || ''}
          onChange={(e) => onChange({ ...data, subheadline: e.target.value })}
          placeholder="Descubra o método que já ajudou milhares..."
          className="text-sm resize-none"
          rows={2}
          aiFieldType="subheadline"
        />
      </div>

      {/* Media Type Selector */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Tipo de Mídia</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={data.mediaType === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, mediaType: 'image' })}
          >
            <Image className="w-4 h-4 mr-1" />
            Imagem
          </Button>
          <Button
            type="button"
            variant={data.mediaType === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, mediaType: 'video' })}
          >
            <Video className="w-4 h-4 mr-1" />
            Vídeo
          </Button>
          <Button
            type="button"
            variant={data.mediaType === 'carousel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, mediaType: 'carousel' })}
          >
            <Images className="w-4 h-4 mr-1" />
            Carrossel
          </Button>
        </div>
      </div>

      {/* Video URL */}
      {data.mediaType === 'video' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">URL do Vídeo (YouTube/Vimeo)</Label>
          <Input
            value={data.videoUrl || ''}
            onChange={(e) => onChange({ ...data, videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="text-sm"
          />
        </div>
      )}

      {/* Single Image Upload */}
      {data.mediaType === 'image' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Imagem</Label>
          {data.imageUrl ? (
            <div className="relative">
              <img 
                src={data.imageUrl} 
                alt="Hero" 
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
              {uploadingImage ? (
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
      )}

      {/* Carousel Images */}
      {data.mediaType === 'carousel' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Imagens do Carrossel ({(data.carouselImages || []).length})
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(data.carouselImages || []).map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img 
                  src={img} 
                  alt={`Slide ${index + 1}`} 
                  className="w-full h-full object-cover rounded"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-5 w-5 p-0"
                  onClick={() => removeCarouselImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <label className="aspect-square flex items-center justify-center border-2 border-dashed border-border rounded cursor-pointer hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCarouselImageUpload}
              />
              {uploadingCarousel ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <Upload className="w-5 h-5 text-muted-foreground" />
              )}
            </label>
          </div>
        </div>
      )}

      {/* CTA Settings */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Mostrar CTA</Label>
          <Switch
            checked={data.showCta ?? true}
            onCheckedChange={(checked) => onChange({ ...data, showCta: checked })}
          />
        </div>

        {data.showCta !== false && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Texto do Botão</Label>
              <InputWithAI
                value={data.ctaText || ''}
                onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
                placeholder="QUERO AGORA"
                className="text-sm"
                aiFieldType="button"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">URL do Botão</Label>
              <Input
                value={data.ctaUrl || ''}
                onChange={(e) => onChange({ ...data, ctaUrl: e.target.value })}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroSectionEditor;
