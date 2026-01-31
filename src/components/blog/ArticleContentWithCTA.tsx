import DOMPurify from "isomorphic-dompurify";
import ContextualCTA from "./ContextualCTA";
import AntiBanBanner from "./AntiBanBanner";

interface ArticleContentWithCTAProps {
  content: string;
  categorySlug: string | null;
  categoryName: string | null;
}

// Render HTML content safely
const HTMLContent = ({ html }: { html: string }) => {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ['a'],
    ADD_ATTR: ['target', 'rel', 'href', 'class', 'style'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

const ArticleContentWithCTA = ({
  content,
  categorySlug,
  categoryName,
}: ArticleContentWithCTAProps) => {
  // Split content to insert AntiBan banner after first paragraph and CTA after 2nd H2
  const insertBannerAndCTA = () => {
    // Find the first paragraph break to insert AntiBan banner
    const firstParagraphEnd = content.indexOf("</p>");
    
    let beforeBanner = "";
    let afterBanner = content;
    
    if (firstParagraphEnd > 0) {
      beforeBanner = content.slice(0, firstParagraphEnd + 4); // Include </p>
      afterBanner = content.slice(firstParagraphEnd + 4);
    }

    // Now find H2 positions in the remaining content for contextual CTA
    const h2Regex = /<h2[^>]*>.*?<\/h2>/gi;
    const matches = [...afterBanner.matchAll(h2Regex)];

    if (matches.length >= 2) {
      const secondH2Match = matches[1];
      const insertPosition = secondH2Match.index! + secondH2Match[0].length;
      const afterSecondH2 = afterBanner.slice(insertPosition);
      const nextH2Match = afterSecondH2.match(/<h2/i);
      const nextH2Position = nextH2Match?.index;
      
      const actualInsertPosition = nextH2Position && nextH2Position > 0 
        ? insertPosition + nextH2Position
        : insertPosition + Math.min(afterSecondH2.length, 500);

      const beforeCTA = afterBanner.slice(0, actualInsertPosition);
      const afterCTA = afterBanner.slice(actualInsertPosition);

      return (
        <>
          {beforeBanner && <HTMLContent html={beforeBanner} />}
          <AntiBanBanner />
          <HTMLContent html={beforeCTA} />
          <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
          <HTMLContent html={afterCTA} />
        </>
      );
    }

    // If less than 2 H2s, insert CTA after ~40% of content
    const paragraphs = afterBanner.split(/<\/p>/i).filter(p => p.trim());
    if (paragraphs.length >= 5) {
      const insertIndex = Math.floor(paragraphs.length * 0.4);
      const beforeCTA = paragraphs.slice(0, insertIndex).join("</p>") + "</p>";
      const afterCTA = paragraphs.slice(insertIndex).join("</p>") + "</p>";

      return (
        <>
          {beforeBanner && <HTMLContent html={beforeBanner} />}
          <AntiBanBanner />
          <HTMLContent html={beforeCTA} />
          <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
          <HTMLContent html={afterCTA} />
        </>
      );
    }

    // Fallback: render content with banner after first paragraph and CTA at the end
    return (
      <>
        {beforeBanner && <HTMLContent html={beforeBanner} />}
        <AntiBanBanner />
        <HTMLContent html={afterBanner} />
        <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
      </>
    );
  };

  return <>{insertBannerAndCTA()}</>;
};

export default ArticleContentWithCTA;
