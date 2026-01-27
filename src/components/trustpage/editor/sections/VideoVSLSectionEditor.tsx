import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Video, Maximize, Square } from "lucide-react";

interface VideoVSLData {
  videoUrl: string;
  width: 'contained' | 'full';
  neonGlow: boolean;
}

interface VideoVSLSectionEditorProps {
  data: VideoVSLData;
  onChange: (data: VideoVSLData) => void;
}

const VideoVSLSectionEditor = ({ data, onChange }: VideoVSLSectionEditorProps) => {
  return (
    <div className="space-y-4">
      {/* Video URL */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <Video className="w-3 h-3" />
          URL do Vídeo (YouTube/Vimeo/Panda)
        </Label>
        <Input
          value={data.videoUrl || ''}
          onChange={(e) => onChange({ ...data, videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Suporta YouTube, Vimeo e Panda Video
        </p>
      </div>

      {/* Width Toggle */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Largura do Vídeo</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={data.width === 'contained' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => onChange({ ...data, width: 'contained' })}
          >
            <Square className="w-3 h-3 mr-1" />
            Contido
          </Button>
          <Button
            type="button"
            variant={data.width === 'full' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => onChange({ ...data, width: 'full' })}
          >
            <Maximize className="w-3 h-3 mr-1" />
            Full Width
          </Button>
        </div>
      </div>

      {/* Neon Glow Toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label className="text-sm">Efeito Neon</Label>
          <p className="text-xs text-muted-foreground">
            Adiciona brilho cinematográfico
          </p>
        </div>
        <Switch
          checked={data.neonGlow || false}
          onCheckedChange={(checked) => onChange({ ...data, neonGlow: checked })}
        />
      </div>
    </div>
  );
};

export default VideoVSLSectionEditor;
