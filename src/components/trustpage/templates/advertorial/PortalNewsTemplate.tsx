import { AdvertorialContent } from "@/types/advertorial";
import { Star, ThumbsUp, MessageCircle, Share2, Clock, Eye } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'b', 'i', 's', 'mark', 'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div', 'br', 'img', 'video', 'iframe'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'src', 'alt', 'width', 'height', 'frameborder', 'allowfullscreen'],
  });
};
import AdvertorialCTA from "./AdvertorialCTA";
import FakeCommentsSection from "./FakeCommentsSection";
import AdvertorialDisclaimer from "./AdvertorialDisclaimer";

interface Props {
  content: AdvertorialContent;
  isMobile?: boolean;
  isPreview?: boolean;
}

const PortalNewsTemplate = ({ content, isMobile, isPreview }: Props) => {
  const today = content.publishDate || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const viewerCount = Math.floor(Math.random() * 200) + 150;

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", backgroundColor: content.backgroundColor || '#FFFFFF', color: content.bodyTextColor || '#111827' }}>
      {/* Urgency Bar */}
      {content.urgencyBarEnabled && (
        <div className="text-white text-center py-2 px-4 text-xs sm:text-sm font-medium animate-pulse" style={{ backgroundColor: content.accentColor || '#DC2626' }}>
          {content.urgencyBarText.replace('{count}', String(viewerCount))}
        </div>
      )}

      {/* Header */}
      <header className="text-white" style={{ backgroundColor: content.headerColor || '#1a237e' }}>
        <div className={`max-w-6xl mx-auto px-4 py-3 flex items-center justify-between ${isMobile ? '' : 'lg:px-8'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center font-bold text-sm">N</div>
            <span className="font-bold text-base sm:text-lg tracking-tight">NewsPortal</span>
          </div>
          {!isMobile && (
            <nav className="hidden lg:flex items-center gap-6 text-sm">
              {content.navCategories.map((cat) => (
                <span key={cat} className={`cursor-default hover:text-white/80 transition-colors ${cat === content.newsCategory ? 'border-b-2 border-white pb-0.5 font-semibold' : 'text-white/70'}`}>
                  {cat}
                </span>
              ))}
            </nav>
          )}
        </div>
        {/* Red accent bar */}
        <div className="h-1" style={{ backgroundColor: content.accentColor || '#DC2626' }} />
      </header>

      {/* Category breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: content.accentColor || '#DC2626' }}>{content.newsCategory}</span>
      </div>

      {/* Article */}
      <article className={`max-w-4xl mx-auto px-4 pb-12 ${isMobile ? '' : 'lg:px-8'}`}>
        {/* Headline */}
        <h1 className={`font-extrabold leading-tight mt-3 mb-3 ${isMobile ? 'text-2xl' : 'text-2xl lg:text-4xl'}`} style={{ color: content.headlineColor || '#111827' }}>
          {content.headline}
        </h1>
        <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : 'text-base lg:text-lg'}`}>
          {content.subheadline}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-1.5">
            {content.authorImageUrl ? (
              <img src={content.authorImageUrl} alt={content.authorName} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                {content.authorName.charAt(0)}
              </div>
            )}
            <span className="font-medium text-gray-700">{content.authorName}</span>
          </div>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Atualizado em: {today}</span>
          <div className="flex items-center gap-3 ml-auto">
            <Share2 className="w-4 h-4 cursor-pointer hover:text-blue-600" />
          </div>
        </div>

        {/* Cover Image */}
        {content.coverImageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img src={content.coverImageUrl} alt="Capa" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Body */}
        <div
          className={`prose prose-gray max-w-none mb-8 ${isMobile ? 'prose-sm' : 'prose-base lg:prose-lg'}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.bodyHtml) }}
        />

        {/* Body Images */}
        {content.bodyImages.filter(Boolean).map((img, i) => (
          <div key={i} className="my-6 rounded-lg overflow-hidden">
            <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-auto object-cover" />
          </div>
        ))}

        {/* CTA */}
        <AdvertorialCTA content={content} />

        {/* Fake Comments */}
        {content.fakeCommentsEnabled && <FakeCommentsSection comments={content.fakeComments} />}
      </article>

      {/* Disclaimer Footer */}
      <AdvertorialDisclaimer />
    </div>
  );
};

export default PortalNewsTemplate;
