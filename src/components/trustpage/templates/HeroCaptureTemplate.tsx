import { useState } from "react";
import { LandingPageFormData } from "@/types/landing-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, User, ArrowRight, ImageIcon, Phone, MessageCircle, CheckCircle, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeroCaptureTemplateProps {
  data: LandingPageFormData;
  isMobile?: boolean;
  fullHeight?: boolean;
  pageId?: string; // ID da landing page para salvar leads
}

const HeroCaptureTemplate = ({ data, isMobile, fullHeight, pageId }: HeroCaptureTemplateProps) => {
  const bgStart = data.colors.background || "#0f172a";
  const bgEnd = data.colors.primary || "#1e293b";
  const accentColor = data.primary_color || "#3b82f6";
  const textColor = data.colors.text || "#ffffff";
  
  // Check if background is a gradient
  const isGradientBg = bgStart.includes('linear-gradient') || bgStart.includes('radial-gradient');

  // Headline sizes
  const headlineSizeMobile = data.headline_size_mobile || 1.5;
  const headlineSizeDesktop = data.headline_size_desktop || 2.5;

  // Form fields configuration
  const formFields = (data.content as any)?.formFields || {
    showName: true,
    showEmail: true,
    showPhone: false,
    showWhatsapp: false,
  };

  // Lead magnet configuration
  const magnetConfig = (data.content as any)?.magnetConfig || {
    type: 'link',
    link: '',
    fileUrl: '',
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (formFields.showEmail && !formData.email) {
      toast.error("Por favor, preencha seu e-mail.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save lead to database if we have a pageId
      if (pageId) {
        const { error } = await supabase
          .from('leads')
          .insert({
            landing_page_id: pageId,
            name: formData.name || null,
            email: formData.email || null,
            phone: formData.phone || null,
            whatsapp: formData.whatsapp || null,
          });

        if (error) {
          console.error("Error saving lead:", error);
          // Don't block the user, continue with the flow
        }
      }

      // Handle magnet type
      if (magnetConfig.type === 'link' && magnetConfig.link) {
        // Redirect to external link
        window.location.href = magnetConfig.link;
      } else if (magnetConfig.type === 'file' && magnetConfig.fileUrl) {
        // Show success screen with download
        setIsSuccess(true);
      } else if (data.cta_url) {
        // Fallback to legacy cta_url
        window.location.href = data.cta_url;
      } else {
        // No destination configured - show success anyway
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!magnetConfig.fileUrl) return;

    setIsDownloading(true);

    try {
      // Fetch the file
      const response = await fetch(magnetConfig.fileUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      // Convert to blob
      const blob = await response.blob();

      // Extract original filename from URL
      const urlParts = magnetConfig.fileUrl.split('/');
      const rawFilename = urlParts[urlParts.length - 1] || 'download';
      // Clean filename: remove query params, decode URI, remove timestamp prefix
      const decodedFilename = decodeURIComponent(rawFilename.split('?')[0]);
      // Remove timestamp prefix (e.g., "1234567890_filename.pdf" -> "filename.pdf")
      const cleanFilename = decodedFilename.replace(/^\d+_/, '').replace(/_/g, ' ');
      
      // Create temporary URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFilename || 'Ebook_TrustPage.pdf';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Download iniciado! Verifique sua pasta de downloads.");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Erro ao baixar. Tentando abrir em nova aba...");
      
      // Fallback: open in new tab
      window.open(magnetConfig.fileUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Success Screen Component
  const SuccessScreen = () => (
    <div className="text-center space-y-6">
      <div
        className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: `${accentColor}20`,
          boxShadow: `0 0 30px ${accentColor}40`,
        }}
      >
        <CheckCircle className="w-10 h-10" style={{ color: accentColor }} />
      </div>

      <div className="space-y-2">
        <h2
          className="text-2xl font-bold"
          style={{ color: textColor }}
        >
          Quase lá! 🎉
        </h2>
        <p
          className="text-base"
          style={{ color: `${textColor}cc` }}
        >
          Seu download está pronto. Clique no botão abaixo para baixar.
        </p>
      </div>

      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full h-16 text-lg font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:opacity-80"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
          color: '#ffffff',
          boxShadow: `0 10px 30px -10px ${accentColor}80`,
        }}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            Baixando...
          </>
        ) : (
          <>
            <Download className="w-6 h-6 mr-3" />
            BAIXAR AGORA
          </>
        )}
      </Button>

      <p
        className="text-xs"
        style={{ color: `${textColor}60` }}
      >
        💡 O download iniciará automaticamente. Verifique sua pasta de downloads.
      </p>
    </div>
  );

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: isGradientBg ? bgStart : `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd}20 100%)`,
        backgroundColor: isGradientBg ? undefined : bgStart,
        width: '100%',
        minWidth: '100%',
        minHeight: fullHeight ? '100vh' : '100%',
        height: fullHeight ? '100vh' : 'auto',
        boxSizing: 'border-box',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: fullHeight ? 0 : 'auto',
      }}
    >
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className={`relative z-10 container mx-auto ${isMobile ? 'px-4 py-8' : 'px-6 py-16'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'lg:grid-cols-2 gap-12'} items-center`}>
          
          {/* Left Column: Copy + Form (Neon Box) */}
          <div
            className="relative p-[1px] rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accentColor}60 0%, transparent 50%, ${accentColor}30 100%)`,
            }}
          >
            {/* Decorative Neon Line at Top */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                boxShadow: `0 0 20px ${accentColor}`,
              }}
            />

            <div
              className={`rounded-2xl backdrop-blur-xl ${isMobile ? 'p-6' : 'p-8 lg:p-10'}`}
              style={{
                backgroundColor: `${bgStart}cc`,
              }}
            >
              {isSuccess ? (
                <SuccessScreen />
              ) : (
                <>
                  {/* Headline */}
                  <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                    {data.subheadline && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider`}
                        style={{
                          backgroundColor: `${accentColor}20`,
                          color: accentColor,
                          border: `1px solid ${accentColor}40`,
                        }}
                      >
                        {data.subheadline}
                      </span>
                    )}
                    <h1
                      className="font-extrabold leading-tight"
                      style={{ 
                        color: textColor,
                        fontSize: isMobile
                          ? `${headlineSizeMobile}rem`
                          : `clamp(1.5rem, 4vw, ${headlineSizeDesktop}rem)`,
                        lineHeight: 1.15,
                      }}
                    >
                      {data.headline || "Sua Headline Impactante Vai Aqui"}
                    </h1>
                    <p
                      className={`leading-relaxed ${isMobile ? 'text-sm' : 'text-base lg:text-lg'}`}
                      style={{ color: `${textColor}cc` }}
                    >
                      {data.description || "Descrição persuasiva sobre o que a pessoa vai ganhar ao se cadastrar agora."}
                    </p>
                  </div>

                  {/* Capture Form */}
                  <form
                    className={`${isMobile ? 'mt-6 space-y-3' : 'mt-8 space-y-4'}`}
                    onSubmit={handleSubmit}
                  >
                    {formFields.showName && (
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: `${textColor}60` }}
                        />
                        <Input
                          type="text"
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="pl-10 h-12 border-0 text-base"
                          style={{
                            backgroundColor: `${textColor}10`,
                            color: textColor,
                          }}
                        />
                      </div>
                    )}

                    {formFields.showEmail && (
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: `${textColor}60` }}
                        />
                        <Input
                          type="email"
                          placeholder="Seu melhor e-mail"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required={formFields.showEmail}
                          className="pl-10 h-12 border-0 text-base"
                          style={{
                            backgroundColor: `${textColor}10`,
                            color: textColor,
                          }}
                        />
                      </div>
                    )}

                    {formFields.showPhone && (
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: `${textColor}60` }}
                        />
                        <Input
                          type="tel"
                          placeholder="Seu telefone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10 h-12 border-0 text-base"
                          style={{
                            backgroundColor: `${textColor}10`,
                            color: textColor,
                          }}
                        />
                      </div>
                    )}

                    {formFields.showWhatsapp && (
                      <div className="relative">
                        <MessageCircle
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: `${textColor}60` }}
                        />
                        <Input
                          type="tel"
                          placeholder="Seu WhatsApp"
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                          className="pl-10 h-12 border-0 text-base"
                          style={{
                            backgroundColor: `${textColor}10`,
                            color: textColor,
                          }}
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 text-base font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
                        color: '#ffffff',
                        boxShadow: `0 10px 30px -10px ${accentColor}80`,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          {data.cta_text || "GARANTIR MEU LUGAR AGORA!"}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p
                      className="text-center text-xs"
                      style={{ color: `${textColor}60` }}
                    >
                      🔒 Seus dados estão 100% seguros
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Hero Image (Ebook or Person) - Premium Studio Effect */}
          <div className={`relative flex flex-col items-center justify-end ${isMobile ? 'order-first pb-4' : 'pb-8'}`}>
            
            {data.image_url ? (
              <>
                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
                  {[...Array(isMobile ? 8 : 15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: `${Math.random() * 6 + 2}px`,
                        height: `${Math.random() * 6 + 2}px`,
                        backgroundColor: accentColor,
                        opacity: Math.random() * 0.5 + 0.2,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 80 + 10}%`,
                        boxShadow: `0 0 ${Math.random() * 10 + 5}px ${accentColor}`,
                        animation: `float-particle-${i % 3} ${Math.random() * 4 + 3}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>

                {/* CSS Animations for Particles and Breathing */}
                <style>{`
                  @keyframes float-particle-0 {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    50% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
                  }
                  @keyframes float-particle-1 {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
                    50% { transform: translateY(-15px) translateX(-8px); opacity: 0.6; }
                  }
                  @keyframes float-particle-2 {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
                    50% { transform: translateY(-25px) translateX(5px); opacity: 0.5; }
                  }
                  @keyframes breathe-slow {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.15); opacity: 0.35; }
                  }
                  @keyframes breathe-medium {
                    0%, 100% { transform: scale(1); opacity: 0.35; }
                    50% { transform: scale(1.1); opacity: 0.5; }
                  }
                  @keyframes breathe-fast {
                    0%, 100% { transform: scale(1); opacity: 0.45; }
                    50% { transform: scale(1.08); opacity: 0.6; }
                  }
                `}</style>

                {/* Layered Backlight System with Breathing Animation */}
                {/* Layer 1: Large ambient glow - creates atmosphere */}
                <div
                  className={`absolute ${isMobile ? 'w-72 h-72' : 'w-[450px] h-[450px] lg:w-[600px] lg:h-[600px]'} rounded-full blur-[120px]`}
                  style={{ 
                    backgroundColor: accentColor,
                    top: '10%',
                    animation: 'breathe-slow 6s ease-in-out infinite',
                  }}
                />
                
                {/* Layer 2: Medium focused glow - highlights silhouette */}
                <div
                  className={`absolute ${isMobile ? 'w-48 h-48' : 'w-72 h-72 lg:w-96 lg:h-96'} rounded-full blur-[80px]`}
                  style={{ 
                    backgroundColor: accentColor,
                    top: '20%',
                    animation: 'breathe-medium 4s ease-in-out infinite',
                    animationDelay: '0.5s',
                  }}
                />
                
                {/* Layer 3: Tight intense core glow - rim light effect */}
                <div
                  className={`absolute ${isMobile ? 'w-32 h-40' : 'w-48 h-60 lg:w-56 lg:h-72'} rounded-full blur-[50px]`}
                  style={{ 
                    background: `radial-gradient(ellipse, ${accentColor} 0%, transparent 70%)`,
                    top: '15%',
                    animation: 'breathe-fast 3s ease-in-out infinite',
                    animationDelay: '1s',
                  }}
                />

                {/* Side Integration Glows - Left */}
                <div
                  className={`absolute ${isMobile ? 'w-24 h-48' : 'w-40 h-80 lg:w-48 lg:h-96'} blur-[60px] opacity-30`}
                  style={{ 
                    background: `radial-gradient(ellipse at center, ${accentColor} 0%, transparent 70%)`,
                    left: isMobile ? '-10%' : '-5%',
                    top: '20%',
                    animation: 'breathe-slow 5s ease-in-out infinite',
                    animationDelay: '0.3s',
                  }}
                />

                {/* Side Integration Glows - Right */}
                <div
                  className={`absolute ${isMobile ? 'w-24 h-48' : 'w-40 h-80 lg:w-48 lg:h-96'} blur-[60px] opacity-30`}
                  style={{ 
                    background: `radial-gradient(ellipse at center, ${accentColor} 0%, transparent 70%)`,
                    right: isMobile ? '-10%' : '-5%',
                    top: '20%',
                    animation: 'breathe-slow 5s ease-in-out infinite',
                    animationDelay: '0.8s',
                  }}
                />

                {/* Main Image Container with Enhanced Multi-Directional Mask */}
                <div 
                  className="relative z-10"
                  style={{
                    WebkitMaskImage: `
                      linear-gradient(to bottom, black 0%, black 65%, transparent 100%),
                      linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)
                    `,
                    WebkitMaskComposite: 'source-in',
                    maskImage: `
                      linear-gradient(to bottom, black 0%, black 65%, transparent 100%),
                      linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)
                    `,
                    maskComposite: 'intersect',
                  }}
                >
                  <img
                    src={data.image_url}
                    alt="Hero"
                    className={`relative max-w-full ${isMobile ? 'max-h-60' : 'max-h-[420px] lg:max-h-[540px]'} object-contain`}
                    style={{
                      filter: `drop-shadow(0 0 80px ${accentColor}60) drop-shadow(0 30px 50px rgba(0,0,0,0.5))`,
                    }}
                  />
                </div>

                {/* Soft Vignette Overlay for Edge Blending */}
                <div 
                  className="absolute inset-0 z-[11] pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 70% 60% at center 40%, transparent 40%, ${isGradientBg ? 'rgba(0,0,0,0.3)' : bgStart}90 100%)`,
                  }}
                />

                {/* Reflection Layer - Mirrored Image */}
                <div 
                  className="absolute z-[5] w-full flex justify-center"
                  style={{
                    bottom: isMobile ? '-18%' : '-15%',
                    transform: 'scaleY(-1)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%)',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%)',
                    filter: 'blur(4px)',
                    opacity: 0.35,
                  }}
                >
                  <img
                    src={data.image_url}
                    alt=""
                    aria-hidden="true"
                    className={`max-w-full ${isMobile ? 'max-h-60' : 'max-h-[420px] lg:max-h-[540px]'} object-contain`}
                  />
                </div>

                {/* Ground Shadow - Elliptical for realism */}
                <div
                  className={`absolute z-[4] ${isMobile ? 'w-40 h-5' : 'w-56 h-8 lg:w-72 lg:h-10'} rounded-[100%] blur-2xl`}
                  style={{
                    background: `radial-gradient(ellipse, ${accentColor}50 0%, transparent 70%)`,
                    bottom: isMobile ? '5%' : '8%',
                  }}
                />
                
                {/* Secondary dark ground shadow for depth */}
                <div
                  className={`absolute z-[3] ${isMobile ? 'w-32 h-4' : 'w-48 h-6 lg:w-64 lg:h-8'} rounded-[100%] blur-xl`}
                  style={{
                    background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)',
                    bottom: isMobile ? '3%' : '6%',
                  }}
                />
              </>
            ) : (
              // Visual placeholder if no image
              <div
                className={`relative z-10 flex flex-col items-center justify-center ${isMobile ? 'w-48 h-48' : 'w-72 h-72 lg:w-96 lg:h-96'} rounded-2xl border-2 border-dashed`}
                style={{
                  borderColor: `${textColor}30`,
                  backgroundColor: `${textColor}05`,
                }}
              >
                <ImageIcon
                  className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mb-4`}
                  style={{ color: `${textColor}40` }}
                />
                <p
                  className={`text-center px-4 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  style={{ color: `${textColor}50` }}
                >
                  Adicione uma imagem sem fundo (PNG) para o efeito Hero
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCaptureTemplate;
