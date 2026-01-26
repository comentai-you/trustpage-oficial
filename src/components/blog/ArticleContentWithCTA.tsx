import ReactMarkdown from "react-markdown";
import ContextualCTA from "./ContextualCTA";

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
  // Split content by H2 headings to insert CTA after the 2nd H2
  const insertCTAAfterSecondH2 = () => {
    // Find all H2 positions in the markdown content
    const h2Regex = /^## .+$/gm;
    const matches = [...content.matchAll(h2Regex)];

    if (matches.length >= 2) {
      // Get the position after the 2nd H2
      const secondH2Match = matches[1];
      const insertPosition = secondH2Match.index! + secondH2Match[0].length;

      // Find the end of the paragraph/section after the 2nd H2
      const afterSecondH2 = content.slice(insertPosition);
      const nextH2Position = afterSecondH2.search(/^## /m);
      
      // Insert CTA marker between 2nd and 3rd H2, or at the end of 2nd section
      const actualInsertPosition = nextH2Position > 0 
        ? insertPosition + nextH2Position
        : insertPosition + Math.min(afterSecondH2.length, 500);

      const beforeCTA = content.slice(0, actualInsertPosition);
      const afterCTA = content.slice(actualInsertPosition);

      return (
        <>
          <ReactMarkdown>{beforeCTA}</ReactMarkdown>
          <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
          <ReactMarkdown>{afterCTA}</ReactMarkdown>
        </>
      );
    }

    // If less than 2 H2s, insert CTA after ~40% of content
    const paragraphs = content.split(/\n\n/);
    if (paragraphs.length >= 5) {
      const insertIndex = Math.floor(paragraphs.length * 0.4);
      const beforeCTA = paragraphs.slice(0, insertIndex).join("\n\n");
      const afterCTA = paragraphs.slice(insertIndex).join("\n\n");

      return (
        <>
          <ReactMarkdown>{beforeCTA}</ReactMarkdown>
          <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
          <ReactMarkdown>{afterCTA}</ReactMarkdown>
        </>
      );
    }

    // Fallback: just render content with CTA at the end
    return (
      <>
        <ReactMarkdown>{content}</ReactMarkdown>
        <ContextualCTA categorySlug={categorySlug} categoryName={categoryName} />
      </>
    );
  };

  return <>{insertCTAAfterSecondH2()}</>;
};

export default ArticleContentWithCTA;
