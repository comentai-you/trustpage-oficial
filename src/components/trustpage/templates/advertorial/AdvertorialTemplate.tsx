import { AdvertorialContent } from "@/types/advertorial";
import PortalNewsTemplate from "./PortalNewsTemplate";
import StoryBlogTemplate from "./StoryBlogTemplate";
import ReviewTechTemplate from "./ReviewTechTemplate";

interface Props {
  content: AdvertorialContent;
  isMobile?: boolean;
  isPreview?: boolean;
  ownerPlan?: string | null;
}

const AdvertorialTemplate = ({ content, isMobile, isPreview, ownerPlan }: Props) => {
  switch (content.theme) {
    case 'story-blog':
      return <StoryBlogTemplate content={content} isMobile={isMobile} isPreview={isPreview} />;
    case 'review-tech':
      return <ReviewTechTemplate content={content} isMobile={isMobile} isPreview={isPreview} />;
    case 'portal-news':
    default:
      return <PortalNewsTemplate content={content} isMobile={isMobile} isPreview={isPreview} />;
  }
};

export default AdvertorialTemplate;
