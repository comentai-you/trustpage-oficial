import { useState, useEffect } from "react";
import { LandingPageFormData, SalesPageContent } from "@/types/landing-page";
import { 
  Play, Check, Star, Shield, ArrowRight,
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
  Plus, Minus, X, ArrowUp, ChevronRight,
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
  Plus, Minus, X, ArrowRight, ArrowUp, ChevronRight
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

  const primaryColor = data.primary_color || '#8B5CF6';
  const content: SalesPageContent = data.content || {
    heroMediaType: 'image',
    benefits: [],
    testimonials: [],
    priceFrom: '197',
    priceTo: '97',
    guaranteeText: '7 dias de garantia',
    scarcityEnabled: false,
    scarcityText: ''
  };

  // Determine if dark theme based on background color
  const bgColor = data.colors.background.toLowerCase();
  const isDarkTheme = bgColor === '#000000' || 
    bgColor === '#09090b' ||
    bgColor === '#1e1b4b' ||
    bgColor === '#1a1a1a' ||
    bgColor === '#111111';

  const getVideoEmbedUrl = (url: string, autoplay = false) => {
    if (!url) return null;
    
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      const baseParams = `controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`;
      const params = autoplay 
        ? `?autoplay=1&playsinline=1&${baseParams}`
        : `?${baseParams}`;
      return `https://www.youtube.com/embed/${youtubeMatch[1]}${params}`;
    }
    
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const baseParams = 'controls=0&title=0&byline=0&portrait=0&sidedock=0';
      const params = autoplay
        ? `?autoplay=1&${baseParams}`
        : `?${baseParams}`;
      return `https://player.vimeo.com/video/${vimeoMatch[1]}${params}`;
    }
    
    return null;
  };

  const handleCtaClick = () => {
    if (data.cta_url) {
      window.open(data.cta_url, '_blank');
    }
  };

  // CTA Button Component for reuse
  const CTAButton = ({ size = 'large', animate = false }: { size?: 'large' | 'medium'; animate?: boolean }) => (
    <button
      onClick={handleCtaClick}
      className={`
        w-full font-bold rounded-2xl shadow-xl transition-all duration-300
        hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]
        uppercase tracking-wider flex items-center justify-center gap-3
        ${size === 'large' ? 'py-5 md:py-6 text-lg md:text-xl' : 'py-4 text-base md:text-lg'}
        ${animate ? 'animate-pulse' : ''}
      `}
      style={{
        backgroundColor: primaryColor,
        color: '#FFFFFF',
        boxShadow: `0 12px 40px ${primaryColor}40`,
      }}
    >
      {data.cta_text || "QUERO AGORA"}
      <ArrowRight className={size === 'large' ? 'w-6 h-6' : 'w-5 h-5'} />
    </button>
  );

  return (
    <main
      className={`${fullHeight ? "min-h-screen" : "h-full min-h-0"} w-full flex flex-col`}
      style={{ backgroundColor: data.colors.background, color: data.colors.text }}
    >
      {/* Scarcity Bar - Optional */}
      {content.scarcityEnabled && (
        <div
          className="w-full py-3 px-4 text-center sticky top-0 z-50"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 4px 20px ${primaryColor}30`
          }}
        >
          <p className="text-sm md:text-base font-semibold text-white tracking-wide">
            {content.scarcityText || '🔥 Oferta por tempo limitado! Garanta o preço promocional hoje.'}
          </p>
        </div>
      )}

      {/* Hero Section - Mobile First with Desktop 2-column option */}
      <section className="w-full py-12 md:py-20 lg:py-24 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Layout (stacked) or Desktop 2-column */}
          <div className={`${isMobile ? '' : 'lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center'}`}>
            
            {/* Text Content */}
            <div className={`${isMobile ? 'text-center' : 'text-center lg:text-left'} mb-8 lg:mb-0`}>
              {/* Headline - Impactful */}
              <h1
                className="font-black leading-[1.1] mb-5 md:mb-6"
                style={{
                  fontSize: isMobile ? '2rem' : 'clamp(2.2rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {data.headline || "Transforme Sua Vida Hoje"}
              </h1>

              {/* Subheadline */}
              {data.subheadline && (
                <p
                  className="text-lg md:text-xl lg:text-2xl opacity-75 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
                  style={{ color: data.colors.text }}
                >
                  {data.subheadline}
                </p>
              )}

              {/* CTA for Mobile - appears below text on mobile */}
              {isMobile && (
                <div className="mb-8">
                  <CTAButton size="large" />
                </div>
              )}

              {/* Desktop only - CTA next to text */}
              {!isMobile && (
                <div className="hidden lg:block max-w-md">
                  <CTAButton size="large" />
                  
                  {/* Trust indicators */}
                  <div className="flex items-center justify-start gap-6 mt-5 text-sm opacity-60">
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
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <iframe
                      src={getVideoEmbedUrl(data.video_url, true) || ''}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-video w-full relative cursor-pointer group rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                    onClick={() => setIsVideoPlaying(true)}
                    style={{ backgroundColor: `${data.colors.text}08` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/20 to-transparent">
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-3xl"
                        style={{ 
                          backgroundColor: primaryColor,
                          boxShadow: `0 0 60px ${primaryColor}60`
                        }}
                      >
                        <Play className="w-8 h-8 md:w-10 md:h-10 ml-1 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <span className="text-white/80 text-sm font-medium">Clique para assistir</span>
                    </div>
                  </div>
                )
              ) : data.image_url ? (
                <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
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
                    backgroundColor: `${primaryColor}15`,
                    border: `2px dashed ${primaryColor}40`
                  }}
                >
                  <div className="text-center p-8">
                    <Image className="w-12 h-12 mx-auto mb-3 opacity-40" style={{ color: primaryColor }} />
                    <p className="text-sm opacity-50">Adicione uma imagem ou vídeo</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: CTA appears after media too for better conversion */}
          {isMobile && (
            <div className="mt-8">
              {/* Trust indicators mobile */}
              <div className="flex items-center justify-center gap-4 mb-4 text-xs opacity-60">
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

      {/* Benefits Section - Clean Design */}
      <section 
        className="w-full py-16 md:py-24 px-5 md:px-8"
        style={{ 
          backgroundColor: isDarkTheme 
            ? `${data.colors.text}05` 
            : `${data.colors.text}03`
        }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16"
            style={{ letterSpacing: '-0.02em' }}
          >
            Por que escolher nosso produto?
          </h2>
          
          <div className={`grid gap-8 md:gap-10 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            {content.benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon ? getIconComponent(benefit.icon) : Sparkles;
              return (
                <div
                  key={index}
                  className="text-center p-8 md:p-10 rounded-3xl transition-all duration-300 hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: data.colors.background,
                    boxShadow: isDarkTheme 
                      ? `0 8px 40px ${primaryColor}10` 
                      : `0 8px 40px rgba(0,0,0,0.08)`,
                    border: `1px solid ${isDarkTheme ? `${primaryColor}20` : `${data.colors.text}08`}`
                  }}
                >
                  {/* Large Icon */}
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ 
                      backgroundColor: `${primaryColor}12`,
                    }}
                  >
                    <BenefitIcon 
                      className="w-10 h-10 md:w-12 md:h-12" 
                      style={{ color: primaryColor }} 
                    />
                  </div>
                  
                  <h3 className="font-bold text-xl md:text-2xl mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-base opacity-65 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 md:py-24 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16"
            style={{ letterSpacing: '-0.02em' }}
          >
            O que nossos clientes dizem
          </h2>
          
          <div className={`grid gap-6 md:gap-8 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            {content.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 md:p-8 rounded-2xl transition-all duration-300"
                style={{ 
                  backgroundColor: isDarkTheme 
                    ? `${data.colors.text}06` 
                    : `${data.colors.text}04`,
                  border: `1px solid ${data.colors.text}08`
                }}
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5" style={{ color: primaryColor }} fill={primaryColor} />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-base md:text-lg mb-6 leading-relaxed opacity-85">
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
                        boxShadow: `0 0 0 2px ${primaryColor}40`
                      }}
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold block">{testimonial.name}</span>
                    <span className="text-sm opacity-50">Cliente verificado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Offer Section - High Impact */}
      <section 
        className="w-full py-16 md:py-24 px-5 md:px-8"
        style={{ 
          backgroundColor: isDarkTheme 
            ? `${primaryColor}08` 
            : '#F8FAFC',
        }}
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8"
            style={{ letterSpacing: '-0.02em' }}
          >
            Oferta Especial
          </h2>
          
          <div 
            className="p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden"
            style={{ 
              backgroundColor: data.colors.background,
              border: `3px solid ${primaryColor}`,
              boxShadow: `0 20px 60px ${primaryColor}25`
            }}
          >
            {/* Decorative elements */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: primaryColor }}
            />
            <div 
              className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-15"
              style={{ backgroundColor: primaryColor }}
            />
            
            <div className="relative z-10">
              {/* Price From - Small and muted */}
              <div className="mb-2">
                <span className="text-base opacity-40">De </span>
                <span 
                  className="text-2xl line-through opacity-35 font-medium"
                  style={{ color: data.colors.text }}
                >
                  R$ {content.priceFrom || '197'}
                </span>
              </div>
              
              {/* Price To - GIGANTIC */}
              <div className="mb-6">
                <span className="text-base opacity-60">Por apenas </span>
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
              <div className="space-y-3 mb-8 text-left max-w-xs mx-auto">
                {['Acesso imediato ao conteúdo', 'Suporte exclusivo VIP', 'Bônus especiais inclusos', 'Atualizações gratuitas'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Check className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-sm md:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Final CTA - Pulsing */}
              <CTAButton size="large" animate={true} />

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 mt-6 text-sm opacity-65">
                <Shield className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="font-medium">{content.guaranteeText || '7 dias de garantia'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center">
        <p 
          className="text-sm font-medium tracking-wide"
          style={{ opacity: 0.5 }}
        >
          ✨ Criado com <span className="font-bold">TrustPage</span>
        </p>
      </footer>
    </main>
  );
};

export default SalesPageTemplate;
