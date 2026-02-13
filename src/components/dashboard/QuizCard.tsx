import { ExternalLink, Copy, Trash2, Edit3, HelpCircle, Globe, Image as ImageIcon, Link2, Instagram, Film, MessageCircle, Facebook, Youtube } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PUBLIC_PAGES_DOMAIN, getQuizPublicUrl } from "@/lib/constants";

interface UserDomain {
  domain: string;
  verified: boolean;
  is_primary: boolean;
}

interface QuizCardProps {
  id: string;
  pageName: string | null;
  title: string;
  slug: string;
  views: number | null;
  isPublished: boolean | null;
  updatedAt: string;
  coverImageUrl?: string | null;
  customDomains?: UserDomain[];
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

const UTM_OPTIONS = [
  { label: 'Link Limpo', icon: Link2, utm: '' },
  { label: 'Instagram', icon: Instagram, utm: 'utm_source=instagram&utm_medium=bio' },
  { label: 'TikTok', icon: Film, utm: 'utm_source=tiktok&utm_medium=video' },
  { label: 'WhatsApp', icon: MessageCircle, utm: 'utm_source=whatsapp&utm_medium=message' },
  { label: 'Facebook', icon: Facebook, utm: 'utm_source=facebook&utm_medium=cpc' },
  { label: 'YouTube', icon: Youtube, utm: 'utm_source=youtube&utm_medium=video' },
];

const QuizCard = ({
  id,
  pageName,
  title,
  slug,
  views,
  isPublished,
  updatedAt,
  coverImageUrl,
  customDomains = [],
  onEdit,
  onDelete,
}: QuizCardProps) => {
  const formattedDate = new Date(updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  const verifiedDomains = customDomains.filter(d => d.verified);
  const primaryDomain = verifiedDomains.find(d => d.is_primary)?.domain || verifiedDomains[0]?.domain;
  const displayName = pageName || title || 'Quiz sem nome';

  const handleViewPage = (domain?: string | null) => {
    if (!isPublished) {
      toast.error("Publique o quiz para abrir o link público.");
      return;
    }
    window.open(getQuizPublicUrl(slug, domain), "_blank");
  };

  const handleCopyWithUtm = (domain: string | null, utmString: string, sourceName: string) => {
    const baseUrl = getQuizPublicUrl(slug, domain);
    const finalUrl = utmString
      ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${utmString}`
      : baseUrl;
    navigator.clipboard.writeText(finalUrl);
    toast.success(
      sourceName === 'Link Limpo'
        ? 'Link copiado!'
        : `Link rastreável do ${sourceName} copiado!`
    );
  };

  return (
    <Card className="page-card group">
      <CardContent className="p-0">
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Thumbnail */}
          <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
            {coverImageUrl ? (
              <img 
                src={coverImageUrl} 
                alt={displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <HelpCircle className="w-8 h-8 text-primary/40" />
              </div>
            )}
            {isPublished && (
              <div className="absolute top-1.5 right-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-success text-success-foreground">
                  Live
                </span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/90 text-primary-foreground">
                Quiz
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                  {displayName}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate mb-2">
                {primaryDomain ? `${primaryDomain}/q/${slug}` : `${PUBLIC_PAGES_DOMAIN}/q/${slug}`}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar quiz</TooltipContent>
          </Tooltip>

          {/* View page */}
          {verifiedDomains.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewPage(null)}>
                  <Globe className="w-4 h-4 mr-2" />
                  Abrir em {PUBLIC_PAGES_DOMAIN}
                </DropdownMenuItem>
                {verifiedDomains.map((d) => (
                  <DropdownMenuItem key={d.domain} onClick={() => handleViewPage(d.domain)}>
                    <Globe className="w-4 h-4 mr-2" />
                    Abrir em {d.domain}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleViewPage(null)}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver quiz</TooltipContent>
            </Tooltip>
          )}

          {/* Copy link with UTM cascade */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Copy className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="w-4 h-4 mr-2" />
                  {PUBLIC_PAGES_DOMAIN}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {UTM_OPTIONS.map((opt) => (
                      <DropdownMenuItem key={opt.label} onClick={() => handleCopyWithUtm(null, opt.utm, opt.label)}>
                        <opt.icon className="w-4 h-4 mr-2" />
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {verifiedDomains.map((d) => (
                <DropdownMenuSub key={d.domain}>
                  <DropdownMenuSubTrigger>
                    <Globe className="w-4 h-4 mr-2" />
                    {d.domain}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {UTM_OPTIONS.map((opt) => (
                        <DropdownMenuItem key={opt.label} onClick={() => handleCopyWithUtm(d.domain, opt.utm, opt.label)}>
                          <opt.icon className="w-4 h-4 mr-2" />
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(id, displayName)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir quiz</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCard;
