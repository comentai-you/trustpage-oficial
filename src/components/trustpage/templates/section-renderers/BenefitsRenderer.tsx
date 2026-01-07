import { BenefitsSection } from "@/types/section-builder";
import { 
  Check, Sparkles, Star, Heart, Shield, Award, Gift, Crown,
  Rocket, Target, TrendingUp, Users, Clock, Lock,
  ThumbsUp, Gem, Lightbulb, Medal, Trophy, BadgeCheck,
  LucideIcon
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Check, Sparkles, Star, Heart, Shield, Award, Gift, Crown,
  Rocket, Target, TrendingUp, Users, Clock, Lock,
  ThumbsUp, Gem, Lightbulb, Medal, Trophy, BadgeCheck
};

interface BenefitsRendererProps {
  data: BenefitsSection['data'];
  primaryColor: string;
  textColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
}

const BenefitsRenderer = ({ 
  data, 
  primaryColor, 
  textColor, 
  isDarkTheme,
  isMobile = false 
}: BenefitsRendererProps) => {
  const getIcon = (iconName?: string) => {
    return ICON_MAP[iconName || 'Sparkles'] || Sparkles;
  };

  // Cards style
  if (data.style === 'cards') {
    return (
      <section 
        className="w-full py-20 md:py-32 px-5 md:px-8"
        style={{ 
          backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <div className="max-w-5xl mx-auto">
          {data.title && (
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16"
              style={{ letterSpacing: '-0.02em', color: textColor }}
            >
              {data.title}
            </h2>
          )}
          
          <div className={`grid gap-8 md:gap-12 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            {data.items.map((item, index) => {
              const IconComponent = getIcon(item.icon);
              return (
                <div
                  key={item.id || index}
                  className="text-center p-8 md:p-10 rounded-3xl transition-all duration-300 hover:scale-[1.03] hover:translate-y-[-4px]"
                  style={{ 
                    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : '#FFFFFF',
                    boxShadow: isDarkTheme 
                      ? `0 0 60px ${primaryColor}20, 0 20px 40px -10px rgba(0,0,0,0.5)` 
                      : `0 10px 40px -10px rgba(0, 0, 0, 0.15)`,
                    border: isDarkTheme ? `1.5px solid ${primaryColor}40` : `1px solid rgba(0, 0, 0, 0.08)`
                  }}
                >
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ 
                      backgroundColor: `${primaryColor}20`,
                      boxShadow: isDarkTheme ? `0 0 40px ${primaryColor}30` : 'none'
                    }}
                  >
                    <IconComponent className="w-10 h-10 md:w-12 md:h-12" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-bold text-xl md:text-2xl mb-3" style={{ color: textColor }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-base leading-relaxed" style={{ color: textColor, opacity: 0.75 }}>
                      {item.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Checklist style
  if (data.style === 'checklist') {
    return (
      <section className="w-full py-16 md:py-24 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          {data.title && (
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-10 md:mb-14"
              style={{ color: textColor }}
            >
              {data.title}
            </h2>
          )}
          
          <div className="space-y-4">
            {data.items.map((item, index) => (
              <div 
                key={item.id || index}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{
                  backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }}
              >
                <div 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg" style={{ color: textColor }}>
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-base mt-1" style={{ color: textColor, opacity: 0.7 }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Icons style (horizontal layout)
  return (
    <section className="w-full py-16 md:py-24 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">
        {data.title && (
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-10 md:mb-14"
            style={{ color: textColor }}
          >
            {data.title}
          </h2>
        )}
        
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
          {data.items.map((item, index) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div key={item.id || index} className="text-center">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <IconComponent className="w-7 h-7" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold text-sm" style={{ color: textColor }}>
                  {item.title}
                </h4>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsRenderer;
