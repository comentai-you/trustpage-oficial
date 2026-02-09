interface CookieWallBackgroundProps {
  desktopSrc?: string;
  mobileSrc?: string;
  /** Força o device no preview (mockups). Se omitido, usa <picture> + media queries. */
  forceDevice?: "desktop" | "mobile";
  className?: string;
}

const CookieWallBackground = ({
  desktopSrc,
  mobileSrc,
  forceDevice,
  className,
}: CookieWallBackgroundProps) => {
  const desktop = (desktopSrc ?? "").trim();
  const mobile = (mobileSrc ?? "").trim() || desktop;

  if (!desktop && !mobile) return null;

  const forcedSrc =
    forceDevice === "mobile" ? mobile : forceDevice === "desktop" ? desktop : "";

  return (
    <picture className={"block h-full w-full " + (className ?? "")}>
      {!forceDevice && mobile && (
        <source media="(max-width: 768px)" srcSet={mobile} />
      )}
      {!forceDevice && desktop && (
        <source media="(min-width: 769px)" srcSet={desktop} />
      )}
      <img
        src={forcedSrc || mobile || desktop}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover blur-[8px] scale-[1.05] transform-gpu"
      />
    </picture>
  );
};

export default CookieWallBackground;
