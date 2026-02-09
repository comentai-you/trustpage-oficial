import { PresellContent } from "@/types/landing-page";
import PreSellTemplate from "../templates/PreSellTemplate";
import ScaledViewport from "./ScaledViewport";
import { useEffect, useRef, useState } from "react";

interface PreSellIPhoneMockupProps {
  content: PresellContent;
  ownerPlan?: string | null;
  size?: "normal" | "large"; // Mantido para compatibilidade, mas ignorado internamente pela lógica responsiva
}

const PreSellIPhoneMockup = ({ content, ownerPlan }: PreSellIPhoneMockupProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  // DEFINIÇÃO FIXA: Vamos renderizar o iPhone SEMPRE na versão "Ideal/Large"
  // E depois apenas dar zoom-out nele para caber na tela.
  // Isso evita que os botões e a ilha dinâmica saiam do lugar.
  const BASE_DIMENSIONS = {
    width: 340, // Largura base do iPhone renderizado
    height: 690, // Altura base
    contentWidth: 310, // Largura do conteúdo interno
    viewportWidth: 393, // Largura lógica do iPhone 14/15 Pro
    radius: "rounded-[50px]",
    innerRadius: "rounded-[42px]",
  };

  // Cálculo da escala do conteúdo interno (conteúdo HTML -> tela do iPhone)
  const contentScale = BASE_DIMENSIONS.contentWidth / BASE_DIMENSIONS.viewportWidth;

  // Efeito para calcular o Zoom do container externo
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        // Calcula quanto precisamos encolher o iPhone de 340px para caber no pai
        // Deixamos uma margem de segurança (0.9) para não colar nas bordas
        const newScale = Math.min(parentWidth / BASE_DIMENSIONS.width, 1);
        setScaleFactor(newScale);
      }
    };

    // Observador para redimensionar em tempo real
    const resizeObserver = new ResizeObserver(() => updateScale());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Chamada inicial
    updateScale();

    return () => resizeObserver.disconnect();
  }, []);

  // Cores
  const backgroundColor = content.backgroundType === "gradient" ? content.gradientStart : content.backgroundColor;
  const textColor = content.textColor;

  return (
    // Container Pai que ocupa 100% da largura disponível na sidebar
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden py-4">
      {/* Wrapper de Escala: Aplica o Zoom para caber perfeitamente */}
      <div
        style={{
          width: BASE_DIMENSIONS.width,
          height: BASE_DIMENSIONS.height,
          transform: `scale(${scaleFactor})`,
          transformOrigin: "center center", // Zoom a partir do centro
          transition: "transform 0.1s ease-out", // Suaviza o redimensionamento
        }}
        className="relative flex-shrink-0"
      >
        {/* iPhone Frame */}
        <div
          className={`w-full h-full bg-gradient-to-b from-zinc-700 to-zinc-900 ${BASE_DIMENSIONS.radius} p-[12px] shadow-2xl relative`}
          style={{
            boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset",
          }}
        >
          {/* Side buttons (Posicionados fixos baseados no tamanho Base) */}
          <div className="absolute left-[-2px] top-[80px] w-[3px] h-[25px] bg-zinc-600 rounded-l-sm" />
          <div className="absolute left-[-2px] top-[115px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm" />
          <div className="absolute left-[-2px] top-[165px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm" />
          <div className="absolute right-[-2px] top-[130px] w-[3px] h-[60px] bg-zinc-600 rounded-r-sm" />

          {/* Dynamic Island */}
          <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
            <div className="w-[6px] h-[6px] bg-zinc-800 rounded-full mr-[25px]" />
          </div>

          {/* Screen Area */}
          <div
            className={`w-full h-full ${BASE_DIMENSIONS.innerRadius} overflow-hidden relative bg-black`}
            style={{
              boxShadow: "0 0 0 1px rgba(0,0,0,0.2) inset",
              backgroundColor,
            }}
          >
            {/* Status Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-10 flex items-end justify-between px-6 pb-2 text-[10px] font-semibold z-10 pointer-events-none"
              style={{ color: textColor }}
            >
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-[2px]">
                  <div className="w-[2px] h-[6px] rounded-sm" style={{ backgroundColor: textColor }} />
                  <div className="w-[2px] h-[8px] rounded-sm" style={{ backgroundColor: textColor }} />
                  <div className="w-[2px] h-[10px] rounded-sm" style={{ backgroundColor: textColor }} />
                  <div className="w-[2px] h-[12px] rounded-sm" style={{ backgroundColor: `${textColor}40` }} />
                </div>
                <svg className="w-5 h-2.5 ml-1" viewBox="0 0 24 12" fill={textColor}>
                  <rect x="0" y="0" width="21" height="12" rx="3" stroke={textColor} strokeWidth="1" fill="none" />
                  <rect x="2" y="2" width="17" height="8" rx="1" fill={textColor} />
                  <rect x="22" y="3" width="2" height="6" rx="1" fill={textColor} />
                </svg>
              </div>
            </div>

            {/* Content Scrollable Area */}
            <div
              className="absolute top-0 left-0 right-0 bottom-0 overflow-y-auto iphone-presell-scroll pt-10" // pt-10 para compensar a status bar
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                backgroundColor,
                overflowX: "hidden",
              }}
            >
              <style>
                {`
                  .iphone-presell-scroll::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>

              {/* O ScaledViewport cuida de renderizar o conteúdo 393px dentro do nosso espaço */}
              <ScaledViewport viewportWidth={BASE_DIMENSIONS.viewportWidth} scale={contentScale}>
                <div
                  className="w-full relative flex flex-col min-h-screen"
                  style={{
                    backgroundColor,
                    alignItems: "stretch",
                  }}
                >
                  <PreSellTemplate content={content} isMobile={true} isPreview={true} ownerPlan={ownerPlan} />
                </div>
              </ScaledViewport>
            </div>
          </div>
        </div>

        {/* Reflection / Glare (Efeito de Vidro) */}
        <div
          className={`absolute inset-0 ${BASE_DIMENSIONS.radius} pointer-events-none`}
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%)",
            zIndex: 30,
          }}
        />
      </div>
    </div>
  );
};

export default PreSellIPhoneMockup;
