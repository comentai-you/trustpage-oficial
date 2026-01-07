import { FullImageSection } from "@/types/section-builder";

interface FullImageRendererProps {
  data: FullImageSection['data'];
  primaryColor: string;
  isDarkTheme: boolean;
}

const FullImageRenderer = ({ data, primaryColor, isDarkTheme }: FullImageRendererProps) => {
  const content = (
    <div 
      className="w-full overflow-hidden"
      style={{
        maxHeight: data.maxHeight ? `${data.maxHeight}px` : undefined
      }}
    >
      <img
        src={data.imageUrl}
        alt={data.alt || 'Imagem'}
        className="w-full h-auto object-cover"
        style={{
          boxShadow: isDarkTheme 
            ? `0 0 60px ${primaryColor}20` 
            : '0 10px 30px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );

  if (data.linkUrl) {
    return (
      <section className="w-full py-8 md:py-12 px-5 md:px-8">
        <a 
          href={data.linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block max-w-6xl mx-auto hover:opacity-90 transition-opacity cursor-pointer"
        >
          {content}
        </a>
      </section>
    );
  }

  return (
    <section className="w-full py-8 md:py-12 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        {content}
      </div>
    </section>
  );
};

export default FullImageRenderer;
