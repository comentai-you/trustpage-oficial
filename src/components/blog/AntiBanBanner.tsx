import { Download } from "lucide-react";
import ebookMockup from "@/assets/ebook-anti-ban-mockup.png";

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
              
              {/* Book mockup image */}
              <img
                src={ebookMockup}
                alt="O Protocolo Anti-Ban 2026 - Manual Técnico"
                className="relative w-40 md:w-56 h-auto transform group-hover:scale-105 transition-transform duration-300 drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 0 30px rgba(0, 255, 0, 0.4))",
                }}
              />
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
