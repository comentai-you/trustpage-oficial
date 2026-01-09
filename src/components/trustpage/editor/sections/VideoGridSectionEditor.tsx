import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VideoGridSection } from "@/types/section-builder";
import { Plus, Trash2, Video, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoGridSectionEditorProps {
  data: VideoGridSection['data'];
  onChange: (data: VideoGridSection['data']) => void;
}

const VideoGridSectionEditor = ({ data, onChange }: VideoGridSectionEditorProps) => {
  const addVideo = () => {
    const newVideo = {
      id: `video_${Date.now()}`,
      url: '',
      name: ''
    };
    onChange({ ...data, videos: [...(data.videos || []), newVideo] });
  };

  const updateVideo = (index: number, updates: Partial<typeof data.videos[0]>) => {
    const newVideos = [...(data.videos || [])];
    newVideos[index] = { ...newVideos[index], ...updates };
    onChange({ ...data, videos: newVideos });
  };

  const removeVideo = (index: number) => {
    const newVideos = (data.videos || []).filter((_, i) => i !== index);
    onChange({ ...data, videos: newVideos });
  };

  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Título da Seção</Label>
        <Input
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Veja o que nossos clientes dizem"
          className="text-sm"
        />
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-700">
          <strong>Recomendação:</strong> Use vídeos <strong>verticais (9:16)</strong> hospedados no <strong>Vimeo</strong> ou <strong>YouTube</strong> para melhor experiência.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Colunas</Label>
        <div className="flex gap-2">
          {([2, 3, 4] as const).map((cols) => (
            <Button
              key={cols}
              type="button"
              variant={data.columns === cols ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ ...data, columns: cols })}
              className="flex-1"
            >
              {cols}
            </Button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Recomendado: 3 colunas para vídeos verticais
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Vídeos ({data.videos?.length || 0})</Label>
        
        {(data.videos || []).map((video, index) => {
          const embedUrl = getVideoEmbedUrl(video.url);
          const isValidUrl = video.url && embedUrl;
          
          return (
            <div key={video.id} className="p-3 border border-border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <Video className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-medium flex-1">Vídeo {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={() => removeVideo(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Input
                  value={video.url}
                  onChange={(e) => updateVideo(index, { url: e.target.value })}
                  placeholder="https://vimeo.com/123456789"
                  className={`text-sm ${video.url && !isValidUrl ? 'border-destructive' : ''}`}
                />
                {video.url && !isValidUrl && (
                  <p className="text-[10px] text-destructive">
                    URL inválida. Use links do YouTube ou Vimeo.
                  </p>
                )}
                
                <Input
                  value={video.name || ''}
                  onChange={(e) => updateVideo(index, { name: e.target.value })}
                  placeholder="Nome do cliente (opcional)"
                  className="text-sm"
                />
              </div>

              {/* Video Preview */}
              {embedUrl && (
                <div className="aspect-[9/16] max-h-32 bg-black rounded overflow-hidden">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={`Preview ${index + 1}`}
                  />
                </div>
              )}
            </div>
          );
        })}
        
        <Button type="button" variant="outline" size="sm" onClick={addVideo} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Adicionar Vídeo
        </Button>
      </div>
    </div>
  );
};

export default VideoGridSectionEditor;