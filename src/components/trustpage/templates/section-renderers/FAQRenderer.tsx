import { useState } from "react";
import { FAQSection } from "@/types/section-builder";
import { ChevronDown } from "lucide-react";

interface FAQRendererProps {
  data: FAQSection['data'];
  primaryColor: string;
  textColor: string;
  isDarkTheme: boolean;
}

const FAQRenderer = ({ data, primaryColor, textColor, isDarkTheme }: FAQRendererProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                border: isDarkTheme 
                  ? `1px solid ${primaryColor}30` 
                  : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isDarkTheme ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <button
                className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{ 
                  backgroundColor: openIndex === index 
                    ? (isDarkTheme ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)')
                    : 'transparent'
                }}
              >
                <span 
                  className="font-semibold text-base md:text-lg pr-4"
                  style={{ color: textColor }}
                >
                  {item.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  style={{ color: primaryColor }}
                />
              </button>
              
              {openIndex === index && (
                <div 
                  className="px-5 md:px-6 pb-5 md:pb-6"
                  style={{ 
                    borderTop: isDarkTheme 
                      ? `1px solid ${primaryColor}20` 
                      : '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <p 
                    className="pt-4 text-base leading-relaxed"
                    style={{ color: textColor, opacity: 0.8 }}
                  >
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQRenderer;
