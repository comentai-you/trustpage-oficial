import { cn } from "@/lib/utils";

interface SocialProofData {
  images: string[];
  variant: 'logos' | 'prints';
  title?: string;
}

interface SocialProofRendererProps {
  data: SocialProofData;
  primaryColor: string;
  textColor: string;
  isMobile?: boolean;
}

const SocialProofRenderer = ({ data, primaryColor, textColor, isMobile = false }: SocialProofRendererProps) => {
  const { images = [], variant = 'logos', title } = data;

  if (!images || images.length === 0) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-500">Adicione imagens de prova social</p>
        </div>
      </section>
    );
  }

  // Logos variant - grayscale with hover effect
  if (variant === 'logos') {
    return (
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {title && (
            <p 
              className="text-center text-sm uppercase tracking-widest mb-6 opacity-60"
              style={{ color: textColor }}
            >
              {title}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
              >
                <img
                  src={imageUrl}
                  alt={`Logo ${index + 1}`}
                  className="h-8 md:h-12 w-auto object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Prints variant - mobile screenshots grid
  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h3 
            className="text-center text-xl md:text-2xl font-bold mb-6"
            style={{ color: textColor }}
          >
            {title}
          </h3>
        )}
        
        {/* Mobile: Horizontal scroll with snap */}
        {isMobile ? (
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
            <div className="flex gap-3 w-max">
              {images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="snap-center flex-shrink-0 w-[45vw] max-w-[180px]"
                >
                  <div 
                    className="rounded-lg overflow-hidden shadow-lg bg-zinc-900"
                    style={{
                      boxShadow: `0 4px 20px rgba(0,0,0,0.3)`
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`Print ${index + 1}`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: Grid layout */
          <div 
            className={cn(
              "grid gap-4",
              images.length <= 3 ? "grid-cols-3" :
              images.length === 4 ? "grid-cols-4" :
              "grid-cols-5"
            )}
          >
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden shadow-lg bg-zinc-900 transition-transform duration-300 hover:scale-105 hover:-translate-y-1"
                style={{
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3)`
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Print ${index + 1}`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialProofRenderer;
