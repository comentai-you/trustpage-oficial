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

const extractLegalText = (data: LegalPageTemplateProps["data"]) => {
  // 1) Prefer description (markdown/plaintext) if present
  if (typeof data.description === "string" && data.description.trim()) return data.description;

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
      className="min-h-screen"
      style={{ backgroundColor: data.colors?.background }}
    >
      <main className="mx-auto w-full max-w-3xl px-6 py-10 md:py-14">
        <header className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight"
            style={{ color: data.colors?.text }}
          >
            {title}
          </h1>
        </header>

        <section
          className="rounded-xl border bg-background/70 backdrop-blur-sm p-6 md:p-8"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          {body ? (
            <pre
              className="whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {body}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              Conteúdo indisponível.
            </p>
          )}
        </section>

        <div className="mt-10">
          <LegalFooter textColor="hsl(var(--muted-foreground))" showWatermark={true} />
        </div>
      </main>
    </div>
  );
};

export default LegalPageTemplate;
