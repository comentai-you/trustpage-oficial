import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface VideoVSLData {
  videoUrl: string;
  width: 'contained' | 'full';
  neonGlow: boolean;
}

interface VideoVSLRendererProps {
  data: VideoVSLData;
  primaryColor: string;
  isMobile?: boolean;
}

// Helper to convert video URL to embeddable iframe URL
const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Panda Video
  if (url.includes('pandavideo') || url.includes('panda.video')) {
    // If it's already an embed URL, return as is
    if (url.includes('/embed/')) return url;
    // Try to extract video ID
    const pandaMatch = url.match(/(?:pandavideo\.com|panda\.video)\/(?:watch\/)?([a-zA-Z0-9-]+)/);
    if (pandaMatch) {
      return `https://player-vz-${pandaMatch[1]}.tv.pandavideo.com.br/embed/?v=${pandaMatch[1]}`;
    }
  }
  
  // Return as-is if it's already an embed URL
  if (url.includes('/embed/') || url.includes('iframe')) {
    return url;
  }
  
  return url;
};

const VideoVSLRenderer = ({ data, primaryColor, isMobile = false }: VideoVSLRendererProps) => {
  const { videoUrl, width = 'contained', neonGlow = false } = data;
  
  const embedUrl = getEmbedUrl(videoUrl);
  
  if (!embedUrl) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-zinc-800 rounded-xl flex items-center justify-center">
            <p className="text-zinc-500">Adicione uma URL de vídeo</p>
          </div>
        </div>
      </section>
    );
  }

  const isFullWidth = width === 'full';

  return (
    <section 
      className={cn(
        "w-full",
        isFullWidth ? "px-0" : "px-4 py-8 md:py-12"
      )}
    >
      <div 
        className={cn(
          "mx-auto",
          isFullWidth ? "w-full" : "max-w-4xl"
        )}
      >
        <div 
          className={cn(
            "relative overflow-hidden",
            isFullWidth ? "rounded-none" : "rounded-xl",
            neonGlow && "shadow-2xl"
          )}
          style={neonGlow ? {
            boxShadow: `0 0 60px 10px ${primaryColor}40, 0 0 120px 40px ${primaryColor}20`
          } : undefined}
        >
          {/* Neon glow border effect */}
          {neonGlow && !isFullWidth && (
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none z-10"
              style={{
                boxShadow: `inset 0 0 0 2px ${primaryColor}60`
              }}
            />
          )}
          
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={embedUrl}
              title="Video VSL"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
};

export default VideoVSLRenderer;
