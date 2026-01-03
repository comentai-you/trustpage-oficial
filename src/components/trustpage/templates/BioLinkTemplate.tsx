import { LandingPageFormData, BioLinkContent, defaultBioContent } from "@/types/landing-page";
import { Instagram, MessageCircle, Youtube, Linkedin, ExternalLink } from "lucide-react";

interface BioLinkTemplateProps {
  data: LandingPageFormData;
  isMobile?: boolean;
  fullHeight?: boolean;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const BioLinkTemplate = ({ data, fullHeight = true }: BioLinkTemplateProps) => {
  const primaryColor = data.primary_color || '#22c55e';
  const backgroundColor = data.colors.background || '#09090b';
  const textColor = data.colors.text || '#ffffff';
  const rawContent = (data.content as BioLinkContent | undefined) || defaultBioContent;
  const content: BioLinkContent = {
    avatarUrl: rawContent.avatarUrl ?? defaultBioContent.avatarUrl,
    profileName: rawContent.profileName ?? defaultBioContent.profileName,
    bio: rawContent.bio ?? defaultBioContent.bio,
    socialLinks: { ...defaultBioContent.socialLinks, ...(rawContent.socialLinks || {}) },
    links: rawContent.links?.length ? rawContent.links : defaultBioContent.links
  };

  const isDark = backgroundColor === '#000000' || backgroundColor.startsWith('#0') || backgroundColor.startsWith('#1');

  const socialIcons = [
    { key: 'instagram', icon: Instagram, url: content.socialLinks.instagram ? `https://instagram.com/${content.socialLinks.instagram.replace('@', '')}` : null },
    { key: 'whatsapp', icon: MessageCircle, url: content.socialLinks.whatsapp ? `https://wa.me/${content.socialLinks.whatsapp}` : null },
    { key: 'tiktok', icon: TikTokIcon, url: content.socialLinks.tiktok ? `https://tiktok.com/@${content.socialLinks.tiktok.replace('@', '')}` : null },
    { key: 'youtube', icon: Youtube, url: content.socialLinks.youtube ? `https://youtube.com/@${content.socialLinks.youtube.replace('@', '')}` : null },
    { key: 'linkedin', icon: Linkedin, url: content.socialLinks.linkedin ? `https://linkedin.com/in/${content.socialLinks.linkedin.replace('@', '')}` : null },
  ].filter(s => s.url);

  return (
    <main className={`${fullHeight ? "min-h-screen" : "min-h-0"} w-full flex flex-col items-center py-10 px-5`} style={{ backgroundColor, color: textColor }}>
      {/* Avatar */}
      <div className="relative mb-4">
        {content.avatarUrl ? (
          <img src={content.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" style={{ border: `3px solid ${primaryColor}`, boxShadow: `0 0 20px ${primaryColor}40` }} />
        ) : (
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', border: `3px solid ${primaryColor}` }}>👤</div>
        )}
      </div>

      {/* Profile Name */}
      <h1 className="text-xl font-bold mb-2" style={{ color: textColor }}>{content.profileName}</h1>

      {/* Bio */}
      {content.bio && <p className="text-sm text-center max-w-xs mb-6" style={{ color: textColor, opacity: 0.8 }}>{content.bio}</p>}

      {/* Social Icons */}
      {socialIcons.length > 0 && (
        <div className="flex items-center gap-4 mb-8">
          {socialIcons.map(({ key, icon: Icon, url }) => (
            <a key={key} href={url!} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', border: `1px solid ${primaryColor}40` }}>
              <Icon className="w-5 h-5" style={{ color: primaryColor }} />
            </a>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="w-full max-w-sm space-y-3">
        {content.links.map((link) => (
          <a
            key={link.id}
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full p-4 rounded-xl transition-all hover:scale-[1.02] ${link.isHighlighted ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: link.isHighlighted ? primaryColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
              border: `2px solid ${link.isHighlighted ? primaryColor : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')}`,
              boxShadow: link.isHighlighted ? `0 0 20px ${primaryColor}50` : 'none',
              color: link.isHighlighted ? '#fff' : textColor
            }}
          >
            <div className="flex items-center gap-3">
              {link.thumbnailUrl && (
                <img src={link.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
              )}
              <span className={`flex-1 font-medium ${link.thumbnailUrl ? 'text-left' : 'text-center'}`}>{link.text}</span>
              {!link.thumbnailUrl && <ExternalLink className="w-4 h-4 opacity-50" />}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
};

export default BioLinkTemplate;
