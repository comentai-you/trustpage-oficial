import ReactMarkdown from "react-markdown";
import ContextualCTA from "./ContextualCTA";
import AntiBanBanner from "./AntiBanBanner";

interface ArticleContentWithCTAProps {
  content: string;
  categorySlug: string | null;
  categoryName: string | null;
}

const ArticleContentWithCTA = ({
  content,
  categorySlug,
  categoryName,
}: ArticleContentWithCTAProps) => {
  // Split content to insert AntiBan banner after first paragraph and CTA after 2nd H2
  const insertBannerAndCTA = () => {
    // Find the first paragraph break to insert AntiBan banner
    const firstParagraphEnd = content.indexOf("\n\n");
    
    let beforeBanner = "";
    let afterBanner = content;
    
    if (firstParagraphEnd > 0) {
      beforeBanner = content.slice(0, firstParagraphEnd);
      afterBanner = content.slice(firstParagraphEnd);
    }

    // Now find H2 positions in the remaining content for contextual CTA
    const h2Regex = /^## .+$/gm;
    const matches = [...afterBanner.matchAll(h2Regex)];

    if (matches.length >= 2) {
      const secondH2Match = matches[1];
      const insertPosition = secondH2Match.index! + secondH2Match[0].length;
      const afterSecondH2 = afterBanner.slice(insertPosition);
      const nextH2Position = afterSecondH2.search(/^## /m);
      
      const actualInsertPosition = nextH2Position > 0 
        ? insertPosition + nextH2Position
        : insertPosition + Math.min(afterSecondH2.length, 500);

      const beforeCTA = afterBanner.slice(0, actualInsertPosition);
      const afterCTA = afterBanner.slice(actualInsertPosition);

      return (
        <>
          {beforeBanner && <ReactMarkdown>{beforeBanner}</ReactMarkdown>}
          <AntiBanBanner />
          <ReactMarkdown>{beforeCTA}</ReactMarkdown>
          <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
          <ReactMarkdown>{afterCTA}</ReactMarkdown>
        </>
      );
    }

    // If less than 2 H2s, insert CTA after ~40% of content
    const paragraphs = afterBanner.split(/\n\n/);
    if (paragraphs.length >= 5) {
      const insertIndex = Math.floor(paragraphs.length * 0.4);
      const beforeCTA = paragraphs.slice(0, insertIndex).join("\n\n");
      const afterCTA = paragraphs.slice(insertIndex).join("\n\n");

      return (
        <>
          {beforeBanner && <ReactMarkdown>{beforeBanner}</ReactMarkdown>}
          <AntiBanBanner />
          <ReactMarkdown>{beforeCTA}</ReactMarkdown>
          <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
          <ReactMarkdown>{afterCTA}</ReactMarkdown>
        </>
      );
    }

    // Fallback: render content with banner after first paragraph and CTA at the end
    return (
      <>
        {beforeBanner && <ReactMarkdown>{beforeBanner}</ReactMarkdown>}
        <AntiBanBanner />
        <ReactMarkdown>{afterBanner}</ReactMarkdown>
        <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
      </>
    );
  };

  return <>{insertBannerAndCTA()}</>;
};

export default ArticleContentWithCTA;
