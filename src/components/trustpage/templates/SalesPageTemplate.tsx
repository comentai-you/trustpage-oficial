import { useState } from "react";
import { LandingPageFormData, SalesPageContent } from "@/types/landing-page";
import ImageCarousel from "./ImageCarousel";
import { 
  Play, Check, Star, Shield, ArrowRight, ChevronDown,
  Zap, Heart, Award, Gift, Crown,
  Rocket, Target, TrendingUp, Users, Clock, Lock, Sparkles,
  ThumbsUp, Gem, Lightbulb, Medal, Trophy, BadgeCheck,
  DollarSign, CreditCard, Wallet, Percent, Tag,
  Package, Truck, Headphones, MessageCircle, Phone, Mail,
  Globe, MapPin, Calendar, Timer, Hourglass, Infinity,
  Sun, Moon, Cloud, Flame, Droplet, Leaf,
  Music, Camera, Video, Image, Mic, Volume2,
  Book, FileText, Folder, Download, Upload, Share2,
  Settings, Wrench, Cpu, Wifi, Battery,
  Smile, AlertCircle, Info, HelpCircle,
  Plus, Minus, X, ArrowUp,
  LucideIcon
} from "lucide-react";

// Icon map for dynamic rendering
const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Star, Heart, Shield, Check, Award, Gift, Crown,
  Rocket, Target, TrendingUp, Users, Clock, Lock, Sparkles,
  ThumbsUp, Gem, Lightbulb, Medal, Trophy, BadgeCheck,
  DollarSign, CreditCard, Wallet, Percent, Tag,
  Package, Truck, Headphones, MessageCircle, Phone, Mail,
  Globe, MapPin, Calendar, Timer, Hourglass, Infinity,
  Sun, Moon, Cloud, Flame, Droplet, Leaf,
  Music, Camera, Video, Image, Mic, Volume2, Play,
  Book, FileText, Folder, Download, Upload, Share2,
  Settings, Wrench, Cpu, Wifi, Battery,
  Smile, AlertCircle, Info, HelpCircle,
  Plus, Minus, X, ArrowRight, ArrowUp, ChevronDown
};

const getIconComponent = (iconName: string): LucideIcon => {
  return ICON_MAP[iconName] || Sparkles;
};

interface SalesPageTemplateProps {
  data: LandingPageFormData;
  isMobile?: boolean;
  fullHeight?: boolean;
}

const SalesPageTemplate = ({
  data,
  isMobile = false,
  fullHeight = true,
}: SalesPageTemplateProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const primaryColor = data.primary_color || '#22c55e';
  const backgroundColor = data.colors.background || '#09090b';
  const textColor = data.colors.text || '#ffffff';
  
  const content = (data.content as SalesPageContent) || {
    heroMediaType: 'image',
    benefits: [],
    testimonials: [],
    priceFrom: '197',
    priceTo: '97',
    guaranteeText: '7 dias de garantia',
    scarcityEnabled: false,
    scarcityText: '',
    faqEnabled: false,
    faqItems: []
  };

  // Determine if dark theme based on background color luminance
  const bgColor = backgroundColor.toLowerCase();
  const isDarkTheme = bgColor === '#000000' || 
    bgColor === '#09090b' ||
    bgColor === '#1e1b4b' ||
    bgColor === '#1a1a1a' ||
    bgColor === '#111111' ||
    bgColor.startsWith('#0') ||
    bgColor.startsWith('#1');

  // Card background colors based on theme
  const cardBg = isDarkTheme 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(0, 0, 0, 0.02)';
  
  const cardBorder = isDarkTheme 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)';

  const getVideoEmbedUrl = (url: string, autoplay = false) => {
    if (!url) return null;
    
    try {
      const parsed = new URL(url);
      
      // Strict YouTube domain validation
      const youtubeHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'];
      if (youtubeHosts.includes(parsed.hostname)) {
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (!youtubeMatch) return null;
        const videoId = youtubeMatch[1];
        const baseParams = `controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`;
        const params = autoplay 
          ? `?autoplay=1&playsinline=1&${baseParams}`
          : `?${baseParams}`;
        return `https://www.youtube.com/embed/${videoId}${params}`;
      }
      
      // Strict Vimeo domain validation
      const vimeoHosts = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];
      if (vimeoHosts.includes(parsed.hostname)) {
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (!vimeoMatch) return null;
        const videoId = vimeoMatch[1];
        const baseParams = 'controls=0&title=0&byline=0&portrait=0&sidedock=0';
        const params = autoplay
          ? `?autoplay=1&${baseParams}`
          : `?${baseParams}`;
        return `https://player.vimeo.com/video/${videoId}${params}`;
      }
      
      // Reject all other domains
      return null;
    } catch {
      // Invalid URL
      return null;
    }
  };

  const handleCtaClick = () => {
    if (data.cta_url) {
      window.open(data.cta_url, '_blank');
    }
  };

  // CTA Button Component with micro-interactions
  const CTAButton = ({ size = 'large', animate = false }: { size?: 'large' | 'medium'; animate?: boolean }) => (
    <button
      onClick={handleCtaClick}
      className={`
        w-full font-bold rounded-2xl transition-all duration-300
        hover:scale-105 hover:brightness-110 active:scale-[0.98]
        uppercase tracking-wider flex items-center justify-center gap-3
        ${size === 'large' ? 'py-5 md:py-6 text-lg md:text-xl' : 'py-4 text-base md:text-lg'}
        ${animate ? 'animate-pulse' : ''}
      `}
      style={{
        backgroundColor: primaryColor,
        color: '#FFFFFF',
        boxShadow: `0 12px 40px ${primaryColor}50`,
      }}
    >
      {data.cta_text || "QUERO AGORA"}
      <ArrowRight className={size === 'large' ? 'w-6 h-6' : 'w-5 h-5'} />
    </button>
  );

  return (
    <main
      className={`${fullHeight ? "min-h-screen" : "h-full min-h-0"} w-full flex flex-col`}
      style={{ backgroundColor, color: textColor }}
    >
      {/* Scarcity Bar - Optional */}
      {content.scarcityEnabled && (
        <div
          className="w-full py-3 px-4 text-center sticky top-0 z-50"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 4px 20px ${primaryColor}40`
          }}
        >
          <p className="text-sm md:text-base font-semibold text-white tracking-wide">
            {content.scarcityText || '🔥 Oferta por tempo limitado! Garanta o preço promocional hoje.'}
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className={`${isMobile ? '' : 'lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center'}`}>
            
            {/* Text Content */}
            <div className={`${isMobile ? 'text-center' : 'text-center lg:text-left'} mb-8 lg:mb-0`}>
              {/* Headline */}
              <h1
                className="font-black leading-[1.1] mb-5 md:mb-6"
                style={{
                  fontSize: isMobile ? '2rem' : 'clamp(2.2rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.02em',
                  color: textColor,
                }}
              >
                {data.headline || "Transforme Sua Vida Hoje"}
              </h1>

              {/* Subheadline */}
              {data.subheadline && (
                <p
                  className="text-xl md:text-2xl lg:text-[1.65rem] mb-8 max-w-xl mx-auto lg:mx-0"
                  style={{ 
                    color: textColor,
                    opacity: 0.8,
                    lineHeight: '1.7',
                  }}
                >
                  {data.subheadline}
                </p>
              )}

              {/* CTA for Mobile */}
              {isMobile && (
                <div className="mb-8">
                  <CTAButton size="large" />
                </div>
              )}

              {/* Desktop CTA */}
              {!isMobile && (
                <div className="hidden lg:block max-w-md">
                  <CTAButton size="large" />
                  
                  {/* Trust indicators */}
                  <div className="flex items-center justify-start gap-6 mt-5 text-sm" style={{ opacity: 0.6, color: textColor }}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Compra segura</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Acesso imediato</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hero Media */}
            <div className="w-full">
              {content.heroMediaType === 'video' && data.video_url ? (
                isVideoPlaying ? (
                  <div 
                    className="relative aspect-video rounded-2xl overflow-hidden"
                    style={{ 
                      boxShadow: isDarkTheme 
                        ? `0 0 80px ${primaryColor}30, 0 25px 50px -12px rgba(0,0,0,0.5)` 
                        : `0 25px 50px -12px rgba(0,0,0,0.25)`,
                      border: isDarkTheme 
                        ? `2px solid ${primaryColor}40` 
                        : `1px solid rgba(0,0,0,0.1)`
                    }}
                  >
                    <iframe
                      src={getVideoEmbedUrl(data.video_url, true) || ''}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-video w-full relative cursor-pointer group rounded-2xl overflow-hidden"
                    onClick={() => setIsVideoPlaying(true)}
                    style={{ 
                      backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.03)',
                      border: isDarkTheme 
                        ? `2px solid ${primaryColor}50` 
                        : `1px solid rgba(0,0,0,0.1)`,
                      boxShadow: isDarkTheme 
                        ? `0 0 80px ${primaryColor}25, 0 25px 60px -12px rgba(0,0,0,0.6), inset 0 1px 0 ${primaryColor}20` 
                        : `0 25px 50px -12px rgba(0,0,0,0.15)`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ 
                          backgroundColor: primaryColor,
                          boxShadow: `0 0 80px ${primaryColor}80, 0 0 40px ${primaryColor}60`
                        }}
                      >
                        <Play className="w-8 h-8 md:w-10 md:h-10 ml-1 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <span style={{ color: textColor, opacity: 0.7 }} className="text-sm font-medium">Clique para assistir</span>
                    </div>
                  </div>
                )
              ) : content.carouselEnabled && content.carouselImages && content.carouselImages.length > 0 ? (
                <ImageCarousel
                  images={content.carouselImages}
                  interval={content.carouselInterval || 4}
                  primaryColor={primaryColor}
                  isDarkTheme={isDarkTheme}
                  alt={data.headline || 'Produto'}
                />
              ) : data.image_url ? (
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
                    src={data.image_url}
                    alt={data.headline || 'Produto'}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="aspect-[4/3] rounded-2xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.02)',
                    border: isDarkTheme 
                      ? `2px dashed ${primaryColor}60` 
                      : `2px dashed rgba(0,0,0,0.2)`,
                    boxShadow: isDarkTheme 
                      ? `0 0 60px ${primaryColor}15, inset 0 0 40px ${primaryColor}05` 
                      : 'none'
                  }}
                >
                  <div className="text-center p-8">
                    <Image className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor, opacity: 0.6 }} />
                    <p className="text-sm" style={{ color: textColor, opacity: 0.5 }}>Adicione uma imagem ou vídeo</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile trust indicators */}
          {isMobile && (
            <div className="mt-8">
              <div className="flex items-center justify-center gap-4 text-xs" style={{ opacity: 0.6, color: textColor }}>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" style={{ color: primaryColor }} />
                  <span>Seguro</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" style={{ color: primaryColor }} />
                  <span>Acesso imediato</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3" style={{ color: primaryColor }} />
                  <span>Garantia</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        className="w-full py-20 md:py-32 px-5 md:px-8"
        style={{ 
          backgroundColor: isDarkTheme 
            ? 'rgba(255, 255, 255, 0.02)' 
            : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16"
            style={{ letterSpacing: '-0.02em', color: textColor }}
          >
            Por que escolher nosso produto?
          </h2>
          
          <div className={`grid gap-8 md:gap-12 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            {content.benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon ? getIconComponent(benefit.icon) : Sparkles;
              return (
                <div
                  key={index}
                  className="text-center p-8 md:p-10 rounded-3xl transition-all duration-300 hover:scale-[1.03] hover:translate-y-[-4px]"
                  style={{ 
                    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : '#FFFFFF',
                    boxShadow: isDarkTheme 
                      ? `0 0 60px ${primaryColor}20, 0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)` 
                      : `0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.08)`,
                    border: isDarkTheme 
                      ? `1.5px solid ${primaryColor}40` 
                      : `1px solid rgba(0, 0, 0, 0.08)`
                  }}
                >
                  {/* Large Icon with glow */}
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ 
                      backgroundColor: `${primaryColor}20`,
                      boxShadow: isDarkTheme ? `0 0 40px ${primaryColor}30` : 'none'
                    }}
                  >
                    <BenefitIcon 
                      className="w-10 h-10 md:w-12 md:h-12" 
                      style={{ color: primaryColor }} 
                    />
                  </div>
                  
                  <h3 
                    className="font-bold text-xl md:text-2xl mb-3"
                    style={{ color: textColor }}
                  >
                    {benefit.title}
                  </h3>
                  <p 
                    className="text-base leading-relaxed"
                    style={{ color: textColor, opacity: 0.75 }}
                  >
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 md:py-32 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16"
            style={{ letterSpacing: '-0.02em', color: textColor }}
          >
            O que nossos clientes dizem
          </h2>
          
          <div className={`grid gap-8 md:gap-10 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            {content.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 md:p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px]"
                style={{ 
                  backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : '#FFFFFF',
                  boxShadow: isDarkTheme 
                    ? `0 0 50px ${primaryColor}15, 0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)` 
                    : `0 10px 40px -10px rgba(0, 0, 0, 0.12), 0 4px 6px -1px rgba(0, 0, 0, 0.06)`,
                  border: isDarkTheme 
                    ? `1.5px solid rgba(255,255,255,0.12)` 
                    : `1px solid rgba(0, 0, 0, 0.08)`
                }}
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5" style={{ color: primaryColor }} fill={primaryColor} />
                  ))}
                </div>
                
                {/* Quote */}
                <p 
                  className="text-base md:text-lg mb-6 leading-relaxed"
                  style={{ color: textColor, opacity: 0.9 }}
                >
                  "{testimonial.text}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  {testimonial.avatarUrl ? (
                    <img 
                      src={testimonial.avatarUrl} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                      style={{ 
                        boxShadow: `0 0 0 3px ${primaryColor}50, 0 0 20px ${primaryColor}30`
                      }}
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ 
                        backgroundColor: primaryColor,
                        boxShadow: isDarkTheme ? `0 0 30px ${primaryColor}50` : 'none'
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold block" style={{ color: textColor }}>{testimonial.name}</span>
                    <span className="text-sm" style={{ color: textColor, opacity: 0.6 }}>Cliente verificado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {content.faqEnabled && content.faqItems && content.faqItems.length > 0 && (
        <section 
          className="w-full py-20 md:py-32 px-5 md:px-8"
          style={{ 
            backgroundColor: isDarkTheme 
              ? 'rgba(255, 255, 255, 0.02)' 
              : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16"
              style={{ letterSpacing: '-0.02em', color: textColor }}
            >
              {content.faqTitle || 'Perguntas Frequentes'}
            </h2>
            
            <div className="space-y-4">
              {content.faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                  style={{ 
                    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                    border: isDarkTheme 
                      ? `1.5px solid ${primaryColor}30` 
                      : `1px solid rgba(0, 0, 0, 0.08)`,
                    boxShadow: isDarkTheme 
                      ? `0 0 40px ${primaryColor}10, 0 10px 30px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)` 
                      : `0 4px 20px -5px rgba(0, 0, 0, 0.1)`
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full p-5 md:p-6 flex items-center justify-between text-left transition-colors duration-200"
                    style={{ color: textColor }}
                  >
                    <span className="font-semibold text-base md:text-lg pr-4">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                      style={{ color: primaryColor }}
                    />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <div 
                      className="px-5 md:px-6 pb-5 md:pb-6 text-base leading-relaxed"
                      style={{ color: textColor, opacity: 0.8 }}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing/Offer Section */}
      <section 
        className="w-full py-20 md:py-32 px-5 md:px-8"
        style={{ 
          backgroundColor: isDarkTheme 
            ? `${primaryColor}08` 
            : '#F8FAFC',
        }}
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-10"
            style={{ letterSpacing: '-0.02em', color: textColor }}
          >
            {content.offerTitle || 'Oferta Especial'}
          </h2>
          
          <div 
            className="p-8 md:p-12 rounded-3xl relative overflow-hidden"
            style={{ 
              backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
              border: `3px solid ${primaryColor}`,
              boxShadow: isDarkTheme 
                ? `0 0 100px ${primaryColor}30, 0 30px 60px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)` 
                : `0 25px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px ${primaryColor}20`
            }}
          >
            {/* Decorative elements with stronger glow */}
            <div 
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl"
              style={{ backgroundColor: primaryColor, opacity: isDarkTheme ? 0.3 : 0.15 }}
            />
            <div 
              className="absolute bottom-0 left-0 w-36 h-36 rounded-full blur-2xl"
              style={{ backgroundColor: primaryColor, opacity: isDarkTheme ? 0.25 : 0.1 }}
            />
            
            <div className="relative z-10">
              {/* Price From */}
              <div className="mb-2">
                <span style={{ color: textColor, opacity: 0.4 }} className="text-base">De </span>
                <span 
                  className="text-2xl line-through font-medium"
                  style={{ color: textColor, opacity: 0.35 }}
                >
                  R$ {content.priceFrom || '197'}
                </span>
              </div>
              
              {/* Price To */}
              <div className="mb-8">
                <span style={{ color: textColor, opacity: 0.6 }} className="text-base">{content.offerSubtitle || 'Por apenas'} </span>
                <div className="mt-1">
                  <span 
                    className="text-6xl md:text-7xl lg:text-8xl font-black"
                    style={{ 
                      color: primaryColor,
                      textShadow: `0 4px 20px ${primaryColor}30`
                    }}
                  >
                    R$ {content.priceTo || '97'}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-10 text-left max-w-xs mx-auto">
                {(content.offerFeatures || ['Acesso imediato ao conteúdo', 'Suporte exclusivo VIP', 'Bônus especiais inclusos', 'Atualizações gratuitas']).map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Check className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-sm md:text-base" style={{ color: textColor }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Final CTA */}
              <CTAButton size="large" animate={true} />

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 mt-6 text-sm" style={{ opacity: 0.65, color: textColor }}>
                <Shield className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="font-medium">{content.guaranteeText || '7 dias de garantia'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      {data.whatsapp_number && (
        <a
          href={`https://wa.me/${data.whatsapp_number.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl group animate-fade-in"
          style={{
            backgroundColor: '#25D366',
            boxShadow: '0 8px 32px rgba(37, 211, 102, 0.4)',
          }}
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-6 h-6 text-white fill-current"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-white text-sm font-semibold whitespace-nowrap">
            Chame no Whats
          </span>
        </a>
      )}

      {/* Footer */}
      <footer className="w-full py-8 text-center">
        <p 
          className="text-sm font-medium tracking-wide"
          style={{ color: textColor, opacity: 0.5 }}
        >
          ✨ Criado com <span className="font-bold">TrustPage</span>
        </p>
      </footer>
    </main>
  );
};

export default SalesPageTemplate;
