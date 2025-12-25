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
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });

  const primaryColor = data.primary_color || '#8B5CF6';
  const content: SalesPageContent = data.content || {
    heroMediaType: 'image',
    benefits: [],
    testimonials: [],
    priceFrom: '197',
    priceTo: '97',
    guaranteeText: '7 dias de garantia'
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <main
      className={`${fullHeight ? "min-h-screen" : "h-full min-h-0"} w-full flex flex-col`}
      style={{ backgroundColor: data.colors.background, color: data.colors.text }}
    >
      {/* Urgency Bar */}
      <header
        className="w-full py-2 px-4 text-center"
        style={{ backgroundColor: primaryColor }}
      >
        <p className="text-xs md:text-sm font-medium text-white">
          🔥 OFERTA ESPECIAL - Termina em{" "}
          <span className="font-bold">
            {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </p>
      </header>

      {/* Hero Section */}
      <section className="w-full py-8 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1
            className="font-extrabold leading-tight mb-4 md:mb-6"
            style={{
              fontSize: isMobile ? '1.5rem' : 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: 1.2,
            }}
          >
            {data.headline || "Transforme Sua Vida Hoje"}
          </h1>

          {/* Subheadline */}
          {data.subheadline && (
            <p
              className="text-base md:text-xl opacity-80 mb-6 md:mb-8 max-w-2xl mx-auto"
              style={{ color: data.colors.text }}
            >
              {data.subheadline}
            </p>
          )}

          {/* Hero Media */}
          <div className="w-full max-w-2xl mx-auto mb-6 md:mb-8">
            {content.heroMediaType === 'video' && data.video_url ? (
              isVideoPlaying ? (
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={getVideoEmbedUrl(data.video_url, true) || ''}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div
                  className="aspect-video w-full relative cursor-pointer group rounded-xl overflow-hidden shadow-2xl"
                  onClick={() => setIsVideoPlaying(true)}
                  style={{ backgroundColor: `${data.colors.text}10` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Play className="w-7 h-7 md:w-9 md:h-9 ml-1 text-white" fill="white" />
                    </div>
                  </div>
                </div>
              )
            ) : data.image_url ? (
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={data.image_url}
                  alt={data.headline || 'Produto'}
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : (
              <div 
                className="aspect-video rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <p className="text-sm opacity-50">Adicione uma imagem ou vídeo</p>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleCtaClick}
            className="w-full max-w-md mx-auto py-4 md:py-5 rounded-xl font-bold text-base md:text-lg shadow-lg transition-all hover:scale-105 active:scale-[0.98] uppercase tracking-wide flex items-center justify-center gap-2 animate-pulse"
            style={{
              backgroundColor: primaryColor,
              color: '#FFFFFF',
              boxShadow: `0 8px 25px ${primaryColor}50`,
            }}
          >
            {data.cta_text || "QUERO AGORA"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-10 md:py-16 px-4" style={{ backgroundColor: `${data.colors.text}05` }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">
            Por que escolher nosso produto?
          </h2>
          
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            {content.benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon ? getIconComponent(benefit.icon) : Sparkles;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl text-center transition-transform hover:scale-105"
                  style={{ 
                    backgroundColor: data.colors.background,
                    border: `2px solid ${primaryColor}30`,
                    boxShadow: `0 4px 20px ${primaryColor}10`
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <BenefitIcon className="w-7 h-7" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm opacity-70">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-10 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">
            O que nossos clientes dizem
          </h2>
          
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            {content.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl"
                style={{ 
                  backgroundColor: `${data.colors.text}05`,
                  border: `1px solid ${data.colors.text}10`
                }}
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" style={{ color: primaryColor }} fill={primaryColor} />
                  ))}
                </div>
                <p className="text-sm mb-4 italic opacity-80">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  {testimonial.avatarUrl ? (
                    <img 
                      src={testimonial.avatarUrl} 
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-sm">{testimonial.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        className="w-full py-10 md:py-16 px-4"
        style={{ backgroundColor: `${primaryColor}10` }}
      >
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-6">
            Oferta Especial por Tempo Limitado
          </h2>
          
          <div 
            className="p-6 md:p-8 rounded-2xl shadow-xl"
            style={{ 
              backgroundColor: data.colors.background,
              border: `3px solid ${primaryColor}`
            }}
          >
            {/* Price From */}
            <div className="mb-2">
              <span className="text-sm opacity-60">De </span>
              <span className="text-xl line-through opacity-50">
                R$ {content.priceFrom || '197'}
              </span>
            </div>
            
            {/* Price To */}
            <div className="mb-4">
              <span className="text-sm opacity-80">Por apenas </span>
              <span 
                className="text-4xl md:text-5xl font-extrabold"
                style={{ color: primaryColor }}
              >
                R$ {content.priceTo || '97'}
              </span>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6 text-left">
              {['Acesso imediato', 'Suporte exclusivo', 'Bônus especiais'].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4" style={{ color: primaryColor }} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleCtaClick}
              className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-[0.98] uppercase flex items-center justify-center gap-2"
              style={{
                backgroundColor: primaryColor,
                color: '#FFFFFF',
                animation: 'pulse 2s infinite'
              }}
            >
              {data.cta_text || "QUERO AGORA"}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Guarantee */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm opacity-70">
              <Shield className="w-4 h-4" style={{ color: primaryColor }} />
              <span>{content.guaranteeText || '7 dias de garantia'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center">
        <p className="text-xs font-medium tracking-wide" style={{ opacity: 0.4 }}>
          ✨ Criado com <span className="font-bold">TrustPage</span>
        </p>
      </footer>
    </main>
  );
};

export default SalesPageTemplate;
