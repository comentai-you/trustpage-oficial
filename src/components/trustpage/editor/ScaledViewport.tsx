import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react";

interface ScaledViewportProps {
  viewportWidth: number;
  scale: number;
  children: ReactNode;
}

const ScaledViewport = ({ viewportWidth, scale, children }: ScaledViewportProps) => {
  const supportsZoom = useMemo(() => {
    return (
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("zoom", "1")
    );
  }, []);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    if (supportsZoom) return;

    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      setContentHeight(el.scrollHeight);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, [supportsZoom]);

  if (supportsZoom) {
    return (
      <div
        style={{
          width: `${viewportWidth}px`,
          zoom: scale,
          overflow: 'hidden',
          minHeight: `${Math.ceil(1 / scale * 100)}%`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        width: `${viewportWidth * scale}px`,
        height: `${contentHeight * scale}px`,
        position: "relative",
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: `${viewportWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScaledViewport;
