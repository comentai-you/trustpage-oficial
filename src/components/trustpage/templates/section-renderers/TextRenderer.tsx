import { TextSection } from "@/types/section-builder";

interface TextRendererProps {
  data: TextSection['data'];
  textColor: string;
}

const TextRenderer = ({ data, textColor }: TextRendererProps) => {
  const maxWidthClass = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-full'
  }[data.maxWidth || 'lg'];

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  }[data.alignment || 'left'];

  // Split content into paragraphs
  const paragraphs = (data.content || '').split('\n').filter(p => p.trim());

  return (
    <section className="w-full py-12 md:py-16 px-5 md:px-8">
      <div className={`${maxWidthClass} ${alignmentClass}`}>
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-lg md:text-xl leading-relaxed mb-4 last:mb-0"
            style={{ color: textColor, opacity: 0.9 }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
};

export default TextRenderer;
