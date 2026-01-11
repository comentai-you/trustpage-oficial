import { TextSection } from "@/types/section-builder";

interface TextRendererProps {
  data: TextSection["data"];
  textColor: string;
  bgColor?: string;
}

// Convert data-accent-color attributes to inline styles for rendering
const applyAccentColors = (html: string): string => {
  // Replace <span data-accent-color="#xxx"> with <span style="color: #xxx">
  return html.replace(
    /<span\s+data-accent-color="([^"]+)">/gi,
    '<span style="color: $1">'
  );
};

const TextRenderer = ({ data, textColor }: TextRendererProps) => {
  const resolvedTextColor = data.textColor || textColor;

  const maxWidthClass = data.maxWidth === "wide" ? "max-w-4xl" : "max-w-2xl";

  const alignmentClass =
    {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    }[data.alignment || "left"];

  const getCardBackground = () => {
    if (!data.hasBackground) return "transparent";

    const isLightText =
      resolvedTextColor.toLowerCase().includes("fff") ||
      resolvedTextColor.toLowerCase().includes("white") ||
      (resolvedTextColor.startsWith("#") &&
        parseInt(resolvedTextColor.slice(1), 16) > 0x808080);

    return isLightText ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
  };

  // Generate unique ID for scoped styles
  const scopeId = `rich-text-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <section className="w-full py-10 md:py-14 px-5 md:px-8">
      <div
        className={`${maxWidthClass} mx-auto ${alignmentClass}`}
        style={{
          backgroundColor: getCardBackground(),
          borderRadius: data.hasBackground ? "16px" : "0",
          padding: data.hasBackground ? "32px" : "0",
          border: data.hasBackground ? "1px solid rgba(128, 128, 128, 0.1)" : "none",
        }}
      >
        <div
          id={scopeId}
          className="rich-text-content"
          style={{ color: resolvedTextColor }}
          dangerouslySetInnerHTML={{ __html: applyAccentColors(data.content || "") }}
        />
      </div>

      {/* Scoped styles for rich text content */}
      <style>{`
        #${scopeId} {
          line-height: 1.8;
        }
        #${scopeId} h1,
        #${scopeId} h2,
        #${scopeId} h3,
        #${scopeId} h4,
        #${scopeId} p,
        #${scopeId} li {
          color: inherit;
        }
        #${scopeId} h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          line-height: 1.2;
        }
        #${scopeId} h2 {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 0.875rem;
          margin-top: 1.25rem;
          line-height: 1.3;
        }
        #${scopeId} h3 {
          font-size: 1.375rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1rem;
          line-height: 1.4;
        }
        #${scopeId} h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 0.875rem;
          line-height: 1.4;
        }
        #${scopeId} p {
          margin-bottom: 1rem;
          font-size: 1.0625rem;
          opacity: 0.9;
        }
        #${scopeId} p:last-child {
          margin-bottom: 0;
        }
        #${scopeId} ul,
        #${scopeId} ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        #${scopeId} ul {
          list-style-type: disc;
        }
        #${scopeId} ol {
          list-style-type: decimal;
        }
        #${scopeId} li {
          margin-bottom: 0.5rem;
          font-size: 1.0625rem;
          opacity: 0.9;
        }
        #${scopeId} strong,
        #${scopeId} b {
          font-weight: 700;
        }
        #${scopeId} em,
        #${scopeId} i {
          font-style: italic;
        }
        #${scopeId} u {
          text-decoration: underline;
        }
        #${scopeId} a {
          color: inherit;
          text-decoration: underline;
        }
        #${scopeId} *:first-child {
          margin-top: 0;
        }
      `}</style>
    </section>
  );
};

export default TextRenderer;
