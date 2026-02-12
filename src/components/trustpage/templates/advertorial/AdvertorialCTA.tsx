import { AdvertorialContent } from "@/types/advertorial";
import { useCtaTracking } from "@/contexts/CtaTrackingContext";

interface Props {
  content: AdvertorialContent;
}

const AdvertorialCTA = ({ content }: Props) => {
  const { trackCtaClick } = useCtaTracking();

  if (!content.ctaText) return null;

  const handleClick = () => {
    trackCtaClick();
  };

  return (
    <div className="my-8 text-center">
      <a
        href={content.ctaUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-block px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl animate-pulse"
        style={{ backgroundColor: content.ctaColor }}
      >
        {content.ctaText}
      </a>
    </div>
  );
};

export default AdvertorialCTA;
