import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const { niche, pageType, fieldType, currentText } = await req.json();

    if (!niche || !pageType || !fieldType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: niche, pageType, fieldType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Map field types to Portuguese descriptions
    const fieldTypeMap: Record<string, string> = {
      headline: "título/headline principal",
      subheadline: "subtítulo",
      button: "texto de botão CTA",
      body: "parágrafo de texto/corpo",
      benefit: "item de benefício",
      testimonial: "depoimento/testemunho",
      faq_question: "pergunta de FAQ",
      faq_answer: "resposta de FAQ",
      offer: "descrição de oferta",
      default: "texto geral"
    };

    const fieldDescription = fieldTypeMap[fieldType] || fieldTypeMap.default;

    // Map page types to Portuguese
    const pageTypeMap: Record<string, string> = {
      sales: "Página de Vendas",
      vsl: "VSL (Video Sales Letter)",
      bio: "Link na Bio"
    };

    const pageDescription = pageTypeMap[pageType] || pageType;

    const systemPrompt = `Você é um Copywriter Expert brasileiro especializado em marketing digital e vendas online.

O usuário está criando uma ${pageDescription} para o nicho "${niche}".

Gere EXATAMENTE 3 opções curtas, persuasivas e de alta conversão para um campo do tipo "${fieldDescription}".

REGRAS:
- Estilo: Agressivo, direto e focado em conversão
- Use gatilhos mentais: urgência, escassez, autoridade, prova social quando apropriado
- Linguagem brasileira informal e impactante
- Cada opção deve ser única e diferente das outras
- NÃO use emojis excessivos (máximo 1 por opção se necessário)
- Mantenha as opções concisas e impactantes

${currentText ? `Texto atual para referência/melhoria: "${currentText}"` : ""}

FORMATO DE RESPOSTA:
Retorne APENAS as 3 opções, uma por linha, sem numeração, sem introdução, sem explicação.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Gere 3 opções de ${fieldDescription} para ${pageDescription} no nicho ${niche}.` }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content || "";
    
    // Parse the response into 3 options
    const options = content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith("-") && !line.match(/^\d+[\.\)]/))
      .slice(0, 3);

    if (options.length === 0) {
      throw new Error("AI did not generate valid options");
    }

    return new Response(
      JSON.stringify({ options }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating copy:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
