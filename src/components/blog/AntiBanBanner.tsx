import { Download } from "lucide-react";

const AntiBanBanner = () => {
  return (
    <a
      href="https://www.tpage.com.br/p/pagina-de-captura"
      target="_blank"
      rel="noopener noreferrer"
      className="block my-8 no-underline group"
    >
      <div
        className="relative overflow-hidden rounded-xl p-6 md:p-8"
        style={{
          background: "#0a0a0a",
          boxShadow: "0 0 30px rgba(0, 255, 0, 0.3), inset 0 0 60px rgba(0, 255, 0, 0.05)",
          border: "1px solid rgba(0, 255, 0, 0.4)",
        }}
      >
        {/* Circuit texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff00' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Left Column - Book Image */}
          <div className="w-full md:w-[40%] flex justify-center">
            <div className="relative">
              {/* Glow effect behind book */}
              <div
                className="absolute inset-0 blur-3xl opacity-60"
                style={{
                  background: "radial-gradient(circle, rgba(0, 255, 0, 0.6) 0%, transparent 70%)",
                  transform: "scale(1.5)",
                }}
              />
              
              {/* Book mockup */}
              <div
                className="relative w-40 md:w-48 h-56 md:h-64 rounded-lg transform group-hover:scale-105 transition-transform duration-300"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
                  boxShadow: `
                    0 0 40px rgba(0, 255, 0, 0.4),
                    0 25px 50px -12px rgba(0, 0, 0, 0.8),
                    inset 0 0 0 1px rgba(0, 255, 0, 0.3)
                  `,
                  border: "2px solid rgba(0, 255, 0, 0.5)",
                }}
              >
                {/* Book spine effect */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-3"
                  style={{
                    background: "linear-gradient(90deg, rgba(0, 255, 0, 0.2), transparent)",
                  }}
                />
                
                {/* Book content */}
                <div className="absolute inset-4 flex flex-col items-center justify-center text-center">
                  {/* Decorative lines */}
                  <div className="w-12 h-0.5 mb-4" style={{ background: "#00ff00" }} />
                  
                  <span
                    className="text-xs font-bold tracking-widest mb-2"
                    style={{ color: "#00ff00" }}
                  >
                    MANUAL TÉCNICO
                  </span>
                  
                  <h3
                    className="text-lg md:text-xl font-black leading-tight"
                    style={{ color: "#ffffff" }}
                  >
                    O PROTOCOLO
                    <br />
                    <span style={{ color: "#00ff00" }}>ANTI-BAN</span>
                    <br />
                    2026
                  </h3>
                  
                  {/* Decorative lines */}
                  <div className="w-12 h-0.5 mt-4" style={{ background: "#00ff00" }} />
                  
                  {/* Circuit decoration */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-30">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#00ff00" }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: "#00ff00" }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: "#00ff00" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Text and CTA */}
          <div className="w-full md:w-[60%] flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 leading-tight">
              <span style={{ color: "#ffffff" }}>O PROTOCOLO </span>
              <span
                style={{
                  color: "#00ff00",
                  textShadow: "0 0 20px rgba(0, 255, 0, 0.5)",
                }}
              >
                ANTI-BAN
              </span>
              <span style={{ color: "#ffffff" }}> 2026</span>
            </h2>

            <p
              className="text-sm md:text-base mb-6 max-w-md"
              style={{ color: "#cccccc" }}
            >
              A infraestrutura oculta dos players de 8 dígitos. Pare de rodar como amador.
            </p>

            {/* Fake Button */}
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm md:text-base uppercase tracking-wide transform group-hover:scale-105 transition-all duration-300"
              style={{
                background: "#00ff00",
                color: "#000000",
                boxShadow: "0 0 20px rgba(0, 255, 0, 0.5)",
              }}
            >
              <Download className="w-5 h-5" />
              <span>BAIXAR MANUAL TÉCNICO (GRÁTIS)</span>
            </div>

            {/* Small disclaimer */}
            <p
              className="mt-3 text-xs opacity-60"
              style={{ color: "#888888" }}
            >
              Download imediato • 100% gratuito
            </p>
          </div>
        </div>
      </div>
    </a>
  );
};

export default AntiBanBanner;
