import { VideoGridSection } from "@/types/section-builder";

interface VideoGridRendererProps {
  data: VideoGridSection['data'];
  primaryColor: string;
  textColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
}

const VideoGridRenderer = ({ 
  data, 
  primaryColor, 
  textColor, 
  isDarkTheme,
  isMobile = false 
}: VideoGridRendererProps) => {
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

  const validVideos = (data.videos || []).filter(v => getVideoEmbedUrl(v.url));
  
  if (validVideos.length === 0) return null;

  const columns = data.columns || 3;
  const gridCols = isMobile ? 'grid-cols-1' : 
    columns === 2 ? 'md:grid-cols-2' : 
    columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
    <section className="w-full py-16 md:py-24 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        {data.title && (
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-10 md:mb-14"
            style={{ letterSpacing: '-0.02em', color: textColor }}
          >
            {data.title}
          </h2>
        )}
        
        <div className={`grid gap-4 md:gap-6 ${gridCols}`}>
          {validVideos.map((video, index) => {
            const embedUrl = getVideoEmbedUrl(video.url);
            if (!embedUrl) return null;
            
            return (
              <div
                key={video.id || index}
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                  boxShadow: isDarkTheme 
                    ? `0 0 40px ${primaryColor}15, 0 10px 30px -10px rgba(0,0,0,0.4)` 
                    : `0 10px 40px -10px rgba(0, 0, 0, 0.12)`,
                  border: isDarkTheme ? `1px solid ${primaryColor}30` : `1px solid rgba(0, 0, 0, 0.06)`
                }}
              >
                {/* Video Container - 9:16 aspect ratio for vertical videos */}
                <div className="aspect-[9/16] bg-black">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={video.name || `Video ${index + 1}`}
                  />
                </div>
                
                {/* Optional Name */}
                {video.name && (
                  <div className="p-4 text-center">
                    <p 
                      className="font-medium text-sm"
                      style={{ color: textColor }}
                    >
                      {video.name}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VideoGridRenderer;