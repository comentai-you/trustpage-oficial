import { useEffect, useRef, useState } from "react";

interface ScaledViewportProps {
  children: React.ReactNode;
  viewportWidth: number;
  scale: number;
}

const ScaledViewport = ({ children, viewportWidth, scale }: ScaledViewportProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [wrapperHeight, setWrapperHeight] = useState<number | string>("100%");

  useEffect(() => {
    if (!contentRef.current) return;

    // O "Sniper" que vigia a altura da página real e encolhe o espaço vazio
    const observer = new ResizeObserver(() => {
      if (contentRef.current) {
        const realHeight = contentRef.current.scrollHeight;
        setWrapperHeight(realHeight * scale);
      }
    });

    observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, [scale]);

  return (
    // Essa div de fora é a que esconde o buraco gigante
    <div style={{ height: wrapperHeight, overflow: "hidden" }}>
      {/* Essa div de dentro é a que encolhe a página */}
      <div
        ref={contentRef}
        style={{
          width: `${viewportWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScaledViewport;
