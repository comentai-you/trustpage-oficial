import { LandingPageFormData } from "@/types/landing-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, User, ArrowRight, ImageIcon, Phone, MessageCircle } from "lucide-react";

interface HeroCaptureTemplateProps {
  data: LandingPageFormData;
  isMobile?: boolean;
  fullHeight?: boolean;
}

const HeroCaptureTemplate = ({ data, isMobile, fullHeight }: HeroCaptureTemplateProps) => {
  const bgStart = data.colors.background || "#0f172a";
  const bgEnd = data.colors.primary || "#1e293b";
  const accentColor = data.primary_color || "#3b82f6";
  const textColor = data.colors.text || "#ffffff";

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

  return (
    <div
      className={`relative overflow-hidden w-full ${fullHeight ? 'min-h-screen' : 'min-h-[100%]'}`}
      style={{
        background: `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd}20 100%)`,
        width: '100%',
        minHeight: fullHeight ? '100vh' : '100%',
        boxSizing: 'border-box',
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
                onSubmit={(e) => {
                  e.preventDefault();
                  if (data.cta_url) {
                    window.open(data.cta_url, '_blank');
                  }
                }}
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
                  className="w-full h-14 text-base font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
                    color: '#ffffff',
                    boxShadow: `0 10px 30px -10px ${accentColor}80`,
                  }}
                >
                  {data.cta_text || "GARANTIR MEU LUGAR AGORA!"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p
                  className="text-center text-xs"
                  style={{ color: `${textColor}60` }}
                >
                  🔒 Seus dados estão 100% seguros
                </p>
              </form>
            </div>
          </div>

          {/* Right Column: Hero Image (Ebook or Person) */}
          <div className={`relative flex items-center justify-center ${isMobile ? 'order-first' : ''}`}>
            {/* Light Circle behind image */}
            <div
              className={`absolute ${isMobile ? 'w-48 h-48' : 'w-72 h-72 lg:w-96 lg:h-96'} rounded-full blur-3xl`}
              style={{ backgroundColor: `${accentColor}30` }}
            />

            {data.image_url ? (
              <img
                src={data.image_url}
                alt="Hero"
                className={`relative z-10 max-w-full ${isMobile ? 'max-h-48' : 'max-h-80 lg:max-h-[500px]'} object-contain`}
                style={{
                  filter: `drop-shadow(0 25px 50px ${accentColor}40)`,
                }}
              />
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
