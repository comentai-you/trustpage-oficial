import { OfferSection } from "@/types/section-builder";
import { Check, Shield } from "lucide-react";

interface OfferRendererProps {
  data: OfferSection['data'];
  primaryColor: string;
  textColor: string;
  isDarkTheme: boolean;
}

const OfferRenderer = ({ data, primaryColor, textColor, isDarkTheme }: OfferRendererProps) => {
  return (
    <section className="w-full py-16 md:py-24 px-5 md:px-8">
      <div 
        className="max-w-2xl mx-auto rounded-3xl p-8 md:p-12"
        style={{ 
          backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
          boxShadow: isDarkTheme 
            ? `0 0 80px ${primaryColor}25, 0 20px 60px -10px rgba(0,0,0,0.5)` 
            : `0 20px 60px -15px rgba(0, 0, 0, 0.15)`,
          border: isDarkTheme ? `2px solid ${primaryColor}40` : `1px solid rgba(0, 0, 0, 0.08)`
        }}
      >
        {/* Title */}
        {data.title && (
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-2"
            style={{ color: textColor }}
          >
            {data.title}
          </h2>
        )}
        
        {/* Subtitle */}
        {data.subtitle && (
          <p 
            className="text-center mb-8 text-lg"
            style={{ color: primaryColor }}
          >
            {data.subtitle}
          </p>
        )}

        {/* Pricing */}
        <div className="text-center mb-8">
          {data.originalPrice && (
            <p 
              className="text-lg line-through opacity-60 mb-1"
              style={{ color: textColor }}
            >
              {data.originalPrice}
            </p>
          )}
          
          {data.finalPrice && (
            <p 
              className="text-4xl md:text-5xl font-bold"
              style={{ color: primaryColor }}
            >
              {data.finalPrice}
            </p>
          )}
          
          {data.installments && (
            <p 
              className="text-base mt-2 opacity-80"
              style={{ color: textColor }}
            >
              {data.installments}
            </p>
          )}
        </div>

        {/* Benefits */}
        {data.benefits && data.benefits.length > 0 && (
          <div className="space-y-3 mb-8">
            {data.benefits.map((benefit, index) => (
              <div key={benefit.id || index} className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span 
                  className="text-base"
                  style={{ color: textColor }}
                >
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {data.ctaText && (
          <a
            href={data.ctaUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-5 px-8 rounded-xl text-center font-bold text-lg md:text-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            style={{ 
              backgroundColor: primaryColor,
              color: '#FFFFFF',
              boxShadow: `0 10px 30px -5px ${primaryColor}50`
            }}
          >
            {data.ctaText}
          </a>
        )}

        {/* Guarantee */}
        {data.showGuarantee && data.guaranteeText && (
          <div 
            className="flex items-center justify-center gap-3 mt-6 p-4 rounded-xl"
            style={{ 
              backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
            }}
          >
            <Shield 
              className="w-6 h-6 flex-shrink-0"
              style={{ color: primaryColor }}
            />
            <span 
              className="text-sm opacity-80"
              style={{ color: textColor }}
            >
              {data.guaranteeText}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default OfferRenderer;