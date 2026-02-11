import { AdvertorialContent } from "@/types/advertorial";
import { Star, Clock, Trophy, Check, X, ChevronRight } from "lucide-react";
import AdvertorialCTA from "./AdvertorialCTA";
import FakeCommentsSection from "./FakeCommentsSection";
import AdvertorialDisclaimer from "./AdvertorialDisclaimer";

interface Props {
  content: AdvertorialContent;
  isMobile?: boolean;
  isPreview?: boolean;
}

const ReviewTechTemplate = ({ content, isMobile, isPreview }: Props) => {
  const today = content.publishDate || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const viewerCount = Math.floor(Math.random() * 200) + 150;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      {/* Urgency Bar */}
      {content.urgencyBarEnabled && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
          {content.urgencyBarText.replace('{count}', String(viewerCount))}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className={`max-w-5xl mx-auto px-4 py-3 flex items-center justify-between ${isMobile ? '' : 'lg:px-8'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">TechReview</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{today}</span>
          </div>
        </div>
      </header>

      <div className={`max-w-4xl mx-auto px-4 py-8 ${isMobile ? '' : 'lg:px-8 lg:py-12'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
          <Trophy className="w-3 h-3" /> Análise Comparativa {new Date().getFullYear()}
        </div>

        {/* Headline */}
        <h1 className={`font-extrabold text-gray-900 leading-tight mb-3 ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
          {content.headline}
        </h1>
        <p className={`text-gray-500 mb-6 ${isMobile ? 'text-sm' : 'text-base lg:text-lg'}`}>
          {content.subheadline}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          {content.authorImageUrl ? (
            <img src={content.authorImageUrl} alt={content.authorName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold">{content.authorName.charAt(0)}</div>
          )}
          <span className="font-medium text-gray-700">{content.authorName}</span>
          <span>•</span>
          <span>Atualizado em {today}</span>
        </div>

        {/* Cover Image */}
        {content.coverImageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-md">
            <img src={content.coverImageUrl} alt="Capa" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Body */}
        <div
          className={`prose prose-gray max-w-none mb-10 ${isMobile ? 'prose-sm' : 'prose-base'}`}
          dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
        />

        {/* Comparison Table */}
        {content.comparisonEnabled && content.comparisonProducts.length >= 2 && (
          <div className="my-10">
            <h2 className="text-xl font-bold mb-6 text-center">📊 Tabela Comparativa</h2>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {content.comparisonProducts.map((product, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl border-2 p-5 ${product.isWinner ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-200 bg-white'}`}
                >
                  {product.isWinner && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> VENCEDOR DO TESTE
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2 mt-1">{product.name}</h3>
                  <div className="mb-3">{renderStars(product.rating)}</div>
                  {product.pros.length > 0 && (
                    <div className="mb-2">
                      {product.pros.map((pro, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-green-700 mb-1">
                          <Check className="w-4 h-4 flex-shrink-0" /> {pro}
                        </div>
                      ))}
                    </div>
                  )}
                  {product.cons.length > 0 && (
                    <div>
                      {product.cons.map((con, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-red-600 mb-1">
                          <X className="w-4 h-4 flex-shrink-0" /> {con}
                        </div>
                      ))}
                    </div>
                  )}
                  {product.isWinner && (
                    <a
                      href={content.ctaUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-bold text-sm transition-transform hover:scale-105"
                      style={{ backgroundColor: content.ctaColor }}
                    >
                      Verificar Preço <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body Images */}
        {content.bodyImages.filter(Boolean).map((img, i) => (
          <div key={i} className="my-6 rounded-xl overflow-hidden shadow-md">
            <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-auto object-cover" />
          </div>
        ))}

        {/* CTA */}
        <AdvertorialCTA content={content} />

        {/* Fake Comments */}
        {content.fakeCommentsEnabled && <FakeCommentsSection comments={content.fakeComments} />}
      </div>

      <AdvertorialDisclaimer />
    </div>
  );
};

export default ReviewTechTemplate;
