import { TextSection } from "@/types/section-builder";

interface TextRendererProps {
  data: TextSection['data'];
  textColor: string;
  bgColor?: string;
}

const TextRenderer = ({ data, textColor, bgColor }: TextRendererProps) => {
  const maxWidthClass = data.maxWidth === 'wide' ? 'max-w-4xl' : 'max-w-2xl';

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }[data.alignment || 'left'];

  // Calculate a lighter/darker background for the card
  const getCardBackground = () => {
    if (!data.hasBackground) return 'transparent';
    // Use a semi-transparent white or black based on text color brightness
    const isLightText = textColor.toLowerCase().includes('fff') || 
                        textColor.toLowerCase().includes('white') ||
                        (textColor.startsWith('#') && parseInt(textColor.slice(1), 16) > 0x808080);
    return isLightText ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  };

  return (
    <section className="w-full py-10 md:py-14 px-5 md:px-8">
      <div 
        className={`${maxWidthClass} mx-auto ${alignmentClass}`}
        style={{
          backgroundColor: getCardBackground(),
          borderRadius: data.hasBackground ? '16px' : '0',
          padding: data.hasBackground ? '32px' : '0',
          border: data.hasBackground ? '1px solid rgba(128, 128, 128, 0.1)' : 'none'
        }}
      >
        <div
          className="rich-text-content"
          style={{ color: textColor }}
          dangerouslySetInnerHTML={{ __html: data.content || '' }}
        />
      </div>

      {/* Scoped styles for rich text content */}
      <style>{`
        .rich-text-content {
          line-height: 1.8;
        }
        .rich-text-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          line-height: 1.2;
        }
        .rich-text-content h2 {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 0.875rem;
          margin-top: 1.25rem;
          line-height: 1.3;
        }
        .rich-text-content h3 {
          font-size: 1.375rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1rem;
          line-height: 1.4;
        }
        .rich-text-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 0.875rem;
          line-height: 1.4;
        }
        .rich-text-content p {
          margin-bottom: 1rem;
          font-size: 1.0625rem;
          opacity: 0.9;
        }
        .rich-text-content p:last-child {
          margin-bottom: 0;
        }
        .rich-text-content ul,
        .rich-text-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .rich-text-content ul {
          list-style-type: disc;
        }
        .rich-text-content ol {
          list-style-type: decimal;
        }
        .rich-text-content li {
          margin-bottom: 0.5rem;
          font-size: 1.0625rem;
          opacity: 0.9;
        }
        .rich-text-content strong,
        .rich-text-content b {
          font-weight: 700;
        }
        .rich-text-content em,
        .rich-text-content i {
          font-style: italic;
        }
        .rich-text-content u {
          text-decoration: underline;
        }
        .rich-text-content *:first-child {
          margin-top: 0;
        }
      `}</style>
    </section>
  );
};

export default TextRenderer;
