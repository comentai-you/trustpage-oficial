import { AdvertorialContent } from "@/types/advertorial";
import { Clock } from "lucide-react";
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

const StoryBlogTemplate = ({ content, isMobile, isPreview }: Props) => {
  const today = content.publishDate || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const viewerCount = Math.floor(Math.random() * 200) + 150;

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", backgroundColor: content.backgroundColor || '#FFFFFF', color: content.bodyTextColor || '#111827' }}>
      {/* Urgency Bar */}
      {content.urgencyBarEnabled && (
        <div className="bg-gray-900 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
          {content.urgencyBarText.replace('{count}', String(viewerCount))}
        </div>
      )}

      {/* Minimal Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-sans">Blog Pessoal</span>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Title */}
        <h1 className={`font-bold text-center leading-tight mb-4 ${isMobile ? 'text-2xl' : 'text-3xl lg:text-5xl'}`} style={{ color: content.headlineColor || '#111827' }}>
          {content.headline}
        </h1>
        {content.subheadline && (
          <p className={`text-center text-gray-500 mb-8 ${isMobile ? 'text-sm' : 'text-lg'}`} style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
            {content.subheadline}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center justify-center gap-3 mb-10 pb-8 border-b border-gray-100">
          {content.authorImageUrl ? (
            <img src={content.authorImageUrl} alt={content.authorName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
              {content.authorName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>{content.authorName}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
              <Clock className="w-3 h-3" /> {today}
            </p>
          </div>
        </div>

        {/* Cover Image */}
        {content.coverImageUrl && (
          <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
            <img src={content.coverImageUrl} alt="Capa" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Body */}
        <div
          className={`prose prose-lg max-w-none mb-10 ${isMobile ? 'prose-base' : ''}`}
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", lineHeight: 1.9 }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.bodyHtml) }}
        />

        {/* Body Images */}
        {content.bodyImages.filter(Boolean).map((img, i) => (
          <div key={i} className="my-8 rounded-xl overflow-hidden shadow-md">
            <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-auto object-cover" />
          </div>
        ))}

        {/* CTA */}
        <AdvertorialCTA content={content} />

        {/* Author Bio Box */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-start gap-4">
            {content.authorImageUrl ? (
              <img src={content.authorImageUrl} alt={content.authorName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 flex-shrink-0" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                {content.authorName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-sm mb-1" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>Sobre {content.authorName}</p>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>{content.authorBio}</p>
            </div>
          </div>
        </div>

        {/* Fake Comments */}
        {content.fakeCommentsEnabled && <FakeCommentsSection comments={content.fakeComments} />}
      </article>

      <AdvertorialDisclaimer />
    </div>
  );
};

export default StoryBlogTemplate;
