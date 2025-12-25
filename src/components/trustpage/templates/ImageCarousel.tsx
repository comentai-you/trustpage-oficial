import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  interval?: number; // seconds
  primaryColor: string;
  isDarkTheme: boolean;
  alt?: string;
}

const ImageCarousel = ({ 
  images, 
  interval = 4, 
  primaryColor, 
  isDarkTheme,
  alt = "Produto"
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [images.length, interval, isHovered, nextSlide]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div 
        className="rounded-2xl overflow-hidden"
        style={{ 
          boxShadow: isDarkTheme 
            ? `0 0 80px ${primaryColor}25, 0 25px 60px -12px rgba(0,0,0,0.5)` 
            : `0 25px 50px -12px rgba(0,0,0,0.2)`,
          border: isDarkTheme 
            ? `2px solid ${primaryColor}40` 
            : `1px solid rgba(0,0,0,0.1)`
        }}
      >
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-auto object-cover"
        />
      </div>
    );
  }

  return (
    <div 
      className="relative rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        boxShadow: isDarkTheme 
          ? `0 0 80px ${primaryColor}25, 0 25px 60px -12px rgba(0,0,0,0.5)` 
          : `0 25px 50px -12px rgba(0,0,0,0.2)`,
        border: isDarkTheme 
          ? `2px solid ${primaryColor}40` 
          : `1px solid rgba(0,0,0,0.1)`
      }}
    >
      {/* Images container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${alt} ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        style={{ 
          backgroundColor: `${primaryColor}e0`,
          boxShadow: `0 4px 20px ${primaryColor}60`
        }}
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        style={{ 
          backgroundColor: `${primaryColor}e0`,
          boxShadow: `0 4px 20px ${primaryColor}60`
        }}
        aria-label="Próximo"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? 'w-8 h-2' 
                : 'w-2 h-2 hover:scale-125'
            }`}
            style={{ 
              backgroundColor: index === currentIndex 
                ? primaryColor 
                : isDarkTheme 
                  ? 'rgba(255,255,255,0.5)' 
                  : 'rgba(0,0,0,0.3)',
              boxShadow: index === currentIndex 
                ? `0 0 10px ${primaryColor}80` 
                : 'none'
            }}
            aria-label={`Ir para imagem ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
        <div 
          className="h-full transition-all"
          style={{ 
            backgroundColor: primaryColor,
            width: `${((currentIndex + 1) / images.length) * 100}%`,
            boxShadow: `0 0 10px ${primaryColor}`
          }}
        />
      </div>
    </div>
  );
};

export default ImageCarousel;
