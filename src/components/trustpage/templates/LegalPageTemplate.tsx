import ReactMarkdown from "react-markdown";
import LegalFooter from "@/components/trustpage/templates/LegalFooter";

type LegalBlock = {
  id?: string;
  type?: string;
  content?: string;
  title?: string;
  body?: string;
};

interface LegalPageTemplateProps {
  data: {
    headline?: string;
    page_name?: string;
    description?: string;
    content?: unknown;
    colors?: { background?: string; text?: string };
  };
}

const extractLegalText = (data: LegalPageTemplateProps["data"]): string => {
  // 1) Prefer description (markdown/plaintext) if present
  if (typeof data.description === "string" && data.description.trim()) {
    return data.description;
  }

  // 2) If content is an array of blocks: [{type:'text', content:'...'}]
  if (Array.isArray(data.content)) {
    const blocks = data.content as LegalBlock[];
    const texts = blocks
      .filter((b) => (b?.type || "") === "text")
      .map((b) => (typeof b.content === "string" ? b.content : typeof b.body === "string" ? b.body : ""))
      .filter(Boolean);
    if (texts.length) return texts.join("\n\n");
  }

  // 3) Back-compat: { sections: [{ body: '...' }] }
  if (data.content && typeof data.content === "object") {
    const maybeSections = (data.content as any)?.sections;
    if (Array.isArray(maybeSections)) {
      const texts = (maybeSections as LegalBlock[])
        .map((b) => (typeof b.body === "string" ? b.body : typeof b.content === "string" ? b.content : ""))
        .filter(Boolean);
      if (texts.length) return texts.join("\n\n");
    }
  }

  return "";
};

const LegalPageTemplate = ({ data }: LegalPageTemplateProps) => {
  const title = data.headline || data.page_name || "Página";
  const body = extractLegalText(data);

  return (
    <div
      className="min-h-screen bg-background"
      style={{ backgroundColor: data.colors?.background || "hsl(var(--background))" }}
    >
      <main className="mx-auto w-full max-w-3xl px-6 py-10 md:py-14">
        <header className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
          >
            {title}
          </h1>
        </header>

        <article
          className="rounded-xl border bg-card p-6 md:p-8 prose prose-sm md:prose-base dark:prose-invert max-w-none"
        >
          {body ? (
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                hr: () => <hr className="my-6 border-border" />,
                a: ({ href, children }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {body}
            </ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">
              Conteúdo indisponível.
            </p>
          )}
        </article>

        <div className="mt-10">
          <LegalFooter textColor="hsl(var(--muted-foreground))" showWatermark={true} />
        </div>
      </main>
    </div>
  );
};

export default LegalPageTemplate;

