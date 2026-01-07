import { TestimonialsSection } from "@/types/section-builder";
import { Star, Quote } from "lucide-react";

interface TestimonialsRendererProps {
  data: TestimonialsSection['data'];
  primaryColor: string;
  textColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
}

const TestimonialsRenderer = ({ 
  data, 
  primaryColor, 
  textColor, 
  isDarkTheme,
  isMobile = false 
}: TestimonialsRendererProps) => {
  return (
    <section className="w-full py-20 md:py-32 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">
        {data.title && (
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16"
            style={{ letterSpacing: '-0.02em', color: textColor }}
          >
            {data.title}
          </h2>
        )}
        
        <div className={`grid gap-8 md:gap-10 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
          {data.items.map((item, index) => (
            <div
              key={item.id || index}
              className="relative p-6 md:p-8 rounded-3xl"
              style={{
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                boxShadow: isDarkTheme 
                  ? `0 0 40px ${primaryColor}15, 0 15px 30px -10px rgba(0,0,0,0.4)` 
                  : '0 8px 30px -10px rgba(0, 0, 0, 0.12)',
                border: isDarkTheme 
                  ? `1px solid ${primaryColor}30` 
                  : '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* Quote icon */}
              <Quote 
                className="w-8 h-8 mb-4" 
                style={{ color: primaryColor, opacity: 0.3 }}
              />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4" 
                    fill={primaryColor}
                    style={{ color: primaryColor }}
                  />
                ))}
              </div>
              
              {/* Text */}
              <p 
                className="text-base md:text-lg leading-relaxed mb-6"
                style={{ color: textColor, opacity: 0.85 }}
              >
                "{item.text}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ 
                      border: `2px solid ${primaryColor}40`
                    }}
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ 
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor
                    }}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold" style={{ color: textColor }}>
                    {item.name}
                  </p>
                  {item.role && (
                    <p className="text-sm" style={{ color: textColor, opacity: 0.6 }}>
                      {item.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsRenderer;
