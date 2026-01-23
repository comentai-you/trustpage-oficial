import { HeadlineSection } from "@/types/section-builder";

interface HeadlineRendererProps {
  data: HeadlineSection['data'];
  primaryColor: string;
  textColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
}

const HeadlineRenderer = ({ 
  data, 
  primaryColor, 
  textColor, 
  isDarkTheme,
  isMobile = false 
}: HeadlineRendererProps) => {
  const fontSize = isMobile 
    ? `${data.sizeMobile || 1.5}rem` 
    : `${data.sizeDesktop || 2.5}rem`;

  const textAlign = data.alignment || 'center';
  const fontWeight = data.fontWeight || '700';
  const letterSpacing = `${data.letterSpacing || 0}em`;
  const color = data.color || textColor;
  const textTransform = data.uppercase ? 'uppercase' : 'none';
  const maxWidth = `${data.maxWidth || 100}%`;

  const getDecorationStyles = () => {
    switch (data.decoration) {
      case 'underline':
        return {
          textDecoration: 'underline',
          textDecorationColor: primaryColor,
          textUnderlineOffset: '8px',
          textDecorationThickness: '4px',
        };
      case 'gradient-underline':
        return {
          backgroundImage: `linear-gradient(to right, ${primaryColor}, ${primaryColor}80)`,
          backgroundSize: '100% 4px',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
          paddingBottom: '8px',
        };
      case 'highlight':
        return {
          backgroundColor: `${primaryColor}20`,
          padding: '0.2em 0.4em',
          borderRadius: '0.25em',
          boxDecorationBreak: 'clone' as const,
        };
      default:
        return {};
    }
  };

  return (
    <section 
      className="w-full py-8 md:py-12 px-5 md:px-8"
      style={{ textAlign }}
    >
      <div 
        className="max-w-6xl mx-auto"
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center'
        }}
      >
        {/* Tag above headline */}
        {data.showTag && data.tagText && (
          <span
            className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: `${data.tagColor || primaryColor}20`,
              color: data.tagColor || primaryColor,
              border: `1px solid ${data.tagColor || primaryColor}40`,
            }}
          >
            {data.tagText}
          </span>
        )}

        {/* Main Headline */}
        <h2
          className="leading-tight"
          style={{
            fontSize,
            fontWeight,
            letterSpacing,
            color,
            textTransform,
            maxWidth,
            lineHeight: 1.2,
            ...getDecorationStyles(),
          }}
        >
          {data.text || 'Seu Título Aqui'}
        </h2>
      </div>
    </section>
  );
};

export default HeadlineRenderer;
