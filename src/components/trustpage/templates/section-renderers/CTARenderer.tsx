import { CTASection } from "@/types/section-builder";
import { ArrowRight } from "lucide-react";

interface CTARendererProps {
  data: CTASection['data'];
  primaryColor: string;
  textColor: string;
  isDarkTheme: boolean;
}

const CTARenderer = ({ data, primaryColor, textColor, isDarkTheme }: CTARendererProps) => {
  const handleClick = () => {
    if (data.url) window.open(data.url, '_blank');
  };

  const isLarge = data.size === 'large';

  return (
    <section className="w-full py-12 md:py-16 px-5 md:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <button
          onClick={handleClick}
          className={`
            w-full font-bold rounded-2xl transition-all duration-300
            hover:scale-105 hover:brightness-110 active:scale-[0.98]
            uppercase tracking-wider flex items-center justify-center gap-3
            ${isLarge ? 'py-5 md:py-6 text-lg md:text-xl' : 'py-4 text-base md:text-lg'}
          `}
          style={{
            backgroundColor: primaryColor,
            color: '#FFFFFF',
            boxShadow: `0 12px 40px ${primaryColor}50`,
          }}
        >
          {data.text || "QUERO AGORA"}
          <ArrowRight className={isLarge ? 'w-6 h-6' : 'w-5 h-5'} />
        </button>

        {data.subtext && (
          <p 
            className="mt-4 text-sm"
            style={{ color: textColor, opacity: 0.6 }}
          >
            {data.subtext}
          </p>
        )}
      </div>
    </section>
  );
};

export default CTARenderer;
