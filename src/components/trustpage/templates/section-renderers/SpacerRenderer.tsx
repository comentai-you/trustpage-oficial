import { SpacerSection } from "@/types/section-builder";

interface SpacerRendererProps {
  data: SpacerSection['data'];
}

const SpacerRenderer = ({ data }: SpacerRendererProps) => {
  const heightMap = {
    sm: 'h-8 md:h-12',
    md: 'h-12 md:h-20',
    lg: 'h-20 md:h-32',
    xl: 'h-32 md:h-48'
  };

  return (
    <div className={heightMap[data.height || 'md']} />
  );
};

export default SpacerRenderer;
