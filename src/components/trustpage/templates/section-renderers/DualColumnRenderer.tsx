import { DualColumnSection } from "@/types/section-builder";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

interface DualColumnRendererProps {
  data: DualColumnSection['data'];
  primaryColor: string;
  textColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
}

const DualColumnRenderer = ({ 
  data, 
  primaryColor, 
  textColor, 
  isDarkTheme,
  isMobile = false 
}: DualColumnRendererProps) => {
  
  const handleCtaClick = () => {
    if (data.ctaUrl) window.open(data.ctaUrl, '_blank');
  };

  const ImageColumn = () => (
    <div className="w-full">
      {data.imageUrl ? (
        <div 
          className="rounded-2xl overflow-hidden"
          style={{ 
            boxShadow: isDarkTheme 
              ? `0 0 60px ${primaryColor}25, 0 20px 40px -10px rgba(0,0,0,0.5)` 
              : `0 20px 40px -10px rgba(0,0,0,0.15)`,
            border: isDarkTheme ? `1.5px solid ${primaryColor}40` : `1px solid rgba(0,0,0,0.08)`
          }}
        >
          <img
            src={data.imageUrl}
            alt={data.title || 'Imagem'}
            className="w-full h-auto object-cover"
          />
        </div>
      ) : (
        <div 
          className="aspect-[4/3] rounded-2xl flex items-center justify-center"
          style={{ 
            backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.02)',
            border: isDarkTheme ? `2px dashed ${primaryColor}60` : `2px dashed rgba(0,0,0,0.2)`
          }}
        >
          <ImageIcon className="w-12 h-12" style={{ color: primaryColor, opacity: 0.5 }} />
        </div>
      )}
    </div>
  );

  const TextColumn = () => (
    <div className="w-full flex flex-col justify-center">
      <h2 
        className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
        style={{ color: textColor }}
      >
        {data.title || 'Título da Seção'}
      </h2>
      <p 
        className="text-lg md:text-xl leading-relaxed mb-6"
        style={{ color: textColor, opacity: 0.8 }}
      >
        {data.content || 'Conteúdo da seção'}
      </p>
      {data.ctaText && (
        <button
          onClick={handleCtaClick}
          className="inline-flex items-center gap-2 font-semibold text-lg transition-all hover:gap-3"
          style={{ color: primaryColor }}
        >
          {data.ctaText}
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <section className="w-full py-16 md:py-24 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        {isMobile ? (
          <div className="space-y-8">
            <ImageColumn />
            <TextColumn />
          </div>
        ) : (
          <div className={`grid md:grid-cols-2 gap-12 items-center ${
            data.layout === 'image-right' ? 'md:flex-row-reverse' : ''
          }`}>
            {data.layout === 'image-left' ? (
              <>
                <ImageColumn />
                <TextColumn />
              </>
            ) : (
              <>
                <TextColumn />
                <ImageColumn />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DualColumnRenderer;
