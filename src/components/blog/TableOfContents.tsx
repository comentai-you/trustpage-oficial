import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from rendered content
  useEffect(() => {
    const timer = setTimeout(() => {
      const articleContent = document.querySelector(".prose");
      if (!articleContent) return;

      const headingElements = articleContent.querySelectorAll("h2, h3");
      const items: TOCItem[] = [];

      headingElements.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        items.push({
          id,
          text: heading.textContent || "",
          level: heading.tagName === "H2" ? 2 : 3,
        });
      });

      setHeadings(items);
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  // Track active heading on scroll
  const handleScroll = useCallback(() => {
    const headingElements = headings.map((h) => document.getElementById(h.id));
    const scrollPosition = window.scrollY + 120;

    for (let i = headingElements.length - 1; i >= 0; i--) {
      const element = headingElements[i];
      if (element && element.offsetTop <= scrollPosition) {
        setActiveId(headings[i].id);
        return;
      }
    }

    if (headings.length > 0) {
      setActiveId(headings[0].id);
    }
  }, [headings]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.offsetTop - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-24 w-64 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="relative pl-4">
        {/* Tech HUD Header */}
        <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-widest text-primary font-semibold">
          <List className="w-4 h-4" />
          <span>Índice</span>
        </div>

        {/* Vertical Line */}
        <div className="absolute left-0 top-8 bottom-0 w-px bg-gradient-to-b from-primary/50 via-border to-transparent" />

        {/* TOC Items */}
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id} className="relative">
              {/* Active Indicator Dot */}
              <div
                className={cn(
                  "absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300",
                  activeId === heading.id
                    ? "bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                    : "bg-border"
                )}
              />

              {/* Connection Line to Dot */}
              <div
                className={cn(
                  "absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-px transition-colors duration-300",
                  activeId === heading.id ? "bg-primary" : "bg-border"
                )}
              />

              <button
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "block w-full text-left py-1.5 text-sm transition-all duration-300 hover:text-foreground",
                  heading.level === 3 ? "pl-4" : "pl-2",
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents;
