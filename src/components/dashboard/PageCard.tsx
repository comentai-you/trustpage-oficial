import { ExternalLink, Copy, Trash2, BarChart3, Edit3, Play, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface PageCardProps {
  id: string;
  pageName: string | null;
  slug: string;
  views: number | null;
  isPublished: boolean | null;
  updatedAt: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isTrialExpired: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onCopyLink: (slug: string) => void;
}

// Extract YouTube video ID and generate thumbnail
const getYouTubeThumbnail = (url: string) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
};

// Extract Vimeo video ID and generate thumbnail (basic approach)
const getVimeoThumbnail = (url: string) => {
  const regex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regex);
  if (match) {
    return `https://vumbnail.com/${match[1]}.jpg`;
  }
  return null;
};

const getThumbnail = (videoUrl?: string | null, imageUrl?: string | null) => {
  if (imageUrl) return imageUrl;
  if (videoUrl) {
    const ytThumb = getYouTubeThumbnail(videoUrl);
    if (ytThumb) return ytThumb;
    const vimeoThumb = getVimeoThumbnail(videoUrl);
    if (vimeoThumb) return vimeoThumb;
  }
  return null;
};

const PageCard = ({
  id,
  pageName,
  slug,
  views,
  isPublished,
  updatedAt,
  imageUrl,
  videoUrl,
  isTrialExpired,
  onEdit,
  onDelete,
  onCopyLink,
}: PageCardProps) => {
  const thumbnail = getThumbnail(videoUrl, imageUrl);
  const formattedDate = new Date(updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  const handleViewPage = () => {
    if (!isPublished) {
      toast.error("Publique a página para abrir o link público.");
      return;
    }
    window.open(`${window.location.origin}/p/${slug}`, "_blank");
  };

  return (
    <Card className={`page-card group ${isTrialExpired ? 'opacity-75' : ''}`}>
      <CardContent className="p-0">
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Thumbnail */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
            {thumbnail ? (
              <img 
                src={thumbnail} 
                alt={pageName || 'Página'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                {videoUrl ? (
                  <Play className="w-8 h-8 text-primary/40" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                )}
              </div>
            )}
            {isPublished && (
              <div className="absolute top-1.5 right-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-success text-success-foreground">
                  Live
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                  {pageName || 'Sem nome'}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isTrialExpired && isPublished && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                      Suspenso
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate mb-2">
                trustpageapp.com/p/{slug}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="font-medium">{views || 0} views</span>
                </div>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 px-3 sm:px-4 pb-3 sm:pb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1 h-9"
                onClick={() => onEdit(id)}
                disabled={isTrialExpired}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar página</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleViewPage}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver página</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9"
                onClick={() => onCopyLink(slug)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copiar link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(id, pageName || '')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir página</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default PageCard;
