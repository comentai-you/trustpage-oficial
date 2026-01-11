import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { niche, pageType, fieldType, currentText } = await req.json();

    if (!niche || !pageType || !fieldType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: niche, pageType, fieldType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Regras MUITO específicas por tipo de campo com limite de caracteres
    const fieldRules: Record<string, { description: string; rules: string; maxChars: number; examples: string }> = {
      headline: {
        description: "Título/Headline Principal",
        rules: "MÁXIMO 8-12 palavras. Deve ser IMPACTANTE, despertar curiosidade ou destacar transformação. Use números quando possível.",
        maxChars: 80,
        examples: "Ex: 'O Método que Fez 10.000 Pessoas Emagrecerem em 30 Dias' ou 'Descubra o Segredo dos Top 1%'"
      },
      subheadline: {
        description: "Subtítulo de apoio",
        rules: "MÁXIMO 15-20 palavras. Complementa o headline, adiciona contexto ou benefício secundário. Mais explicativo.",
        maxChars: 120,
        examples: "Ex: 'Sem dietas malucas, sem academia, apenas 15 minutos por dia no conforto da sua casa'"
      },
      button: {
        description: "Texto de Botão CTA",
        rules: "MÁXIMO 2-5 palavras. Verbos de AÇÃO no imperativo. Urgência. Curto e direto.",
        maxChars: 30,
        examples: "Ex: 'QUERO AGORA', 'GARANTIR MINHA VAGA', 'SIM, EU QUERO!', 'COMEÇAR HOJE'"
      },
      body: {
        description: "Parágrafo de texto/descrição",
        rules: "2-4 frases curtas. Texto persuasivo que desenvolve um argumento ou benefício. Linguagem conversacional.",
        maxChars: 300,
        examples: "Ex: 'Você já tentou de tudo e nada funcionou? Eu também passei por isso. Até descobrir este método simples que mudou minha vida para sempre.'"
      },
      benefit: {
        description: "Nome/Título de Benefício",
        rules: "MÁXIMO 3-6 palavras. Nome CURTO do benefício, como título de tópico. Direto ao ponto.",
        maxChars: 40,
        examples: "Ex: 'Resultados em 7 dias', 'Suporte Vitalício', 'Acesso Imediato', 'Garantia de 30 dias'"
      },
      benefit_desc: {
        description: "Descrição de Benefício",
        rules: "1-2 frases curtas explicando o benefício. Conecte com a dor ou desejo do cliente.",
        maxChars: 150,
        examples: "Ex: 'Você vai ver os primeiros resultados já na primeira semana, mesmo começando do zero.'"
      },
      testimonial: {
        description: "Depoimento/Testemunho",
        rules: "Texto em primeira pessoa, como se fosse um cliente real. Mencione resultados específicos, números ou transformação.",
        maxChars: 200,
        examples: "Ex: 'Eu era cético no começo, mas em 2 semanas já tinha perdido 5kg! Melhor investimento que fiz na vida.'"
      },
      faq_question: {
        description: "Pergunta de FAQ",
        rules: "Pergunta direta que o cliente real faria. Comece com 'Como', 'Quanto', 'Por que', 'E se', etc.",
        maxChars: 80,
        examples: "Ex: 'Funciona mesmo para iniciantes?', 'Quanto tempo leva para ver resultados?', 'E se eu não gostar?'"
      },
      faq_answer: {
        description: "Resposta de FAQ",
        rules: "Resposta clara e confiante. Quebre objeções. 1-3 frases máximo.",
        maxChars: 200,
        examples: "Ex: 'Sim! O método foi criado pensando em quem está começando do zero. Você terá todo o suporte necessário.'"
      },
      offer: {
        description: "Título/Texto de Oferta",
        rules: "MÁXIMO 5-10 palavras. Destaque o valor ou a oportunidade única. Use urgência ou escassez.",
        maxChars: 60,
        examples: "Ex: 'Oferta Especial de Lançamento', 'Últimas Vagas com 70% OFF', 'Bônus Exclusivo Hoje'"
      },
      section_title: {
        description: "Título de Seção",
        rules: "MÁXIMO 3-8 palavras. Título curto para seção da página. Pode ser pergunta retórica ou afirmação.",
        maxChars: 50,
        examples: "Ex: 'Por que escolher nosso método?', 'O que você vai aprender', 'Depoimentos reais'"
      },
      richtext: {
        description: "Bloco de Texto Livre",
        rules: "2-4 parágrafos curtos. Texto persuasivo de vendas. Pode incluir bullet points. Conte uma história ou desenvolva argumentos.",
        maxChars: 500,
        examples: "Ex: Parágrafo de história pessoal, explicação do método, ou desenvolvimento de benefícios."
      },
      default: {
        description: "Texto geral",
        rules: "Texto persuasivo e conciso adequado ao contexto.",
        maxChars: 150,
        examples: ""
      }
    };

    // Map page types to context
    const pageTypeContext: Record<string, string> = {
      sales: "uma Página de Vendas de alta conversão. Foco em persuasão, gatilhos mentais e quebra de objeções.",
      vsl: "uma VSL (Video Sales Letter). O texto apoia um vídeo de vendas. Seja complementar, não redundante.",
      bio: "um Link na Bio para redes sociais. Seja direto, impactante e adequado para público que veio do Instagram/TikTok."
    };

    const field = fieldRules[fieldType] || fieldRules.default;
    const pageContext = pageTypeContext[pageType] || pageTypeContext.sales;

    const systemPrompt = `Você é um Copywriter Expert brasileiro com 15+ anos de experiência em marketing digital e páginas de alta conversão.

CONTEXTO:
- Nicho: "${niche}"
- Tipo de página: ${pageContext}
- Tipo de campo: ${field.description}

REGRAS ESPECÍFICAS PARA ESTE CAMPO:
${field.rules}
${field.examples}

LIMITE MÁXIMO: ${field.maxChars} caracteres por opção.

REGRAS GERAIS:
1. RESPEITE O LIMITE DE CARACTERES - isso é CRÍTICO
2. Linguagem brasileira natural e persuasiva
3. Use gatilhos mentais apropriados (urgência, escassez, prova social, autoridade)
4. Cada opção deve ser ÚNICA e diferente
5. NÃO use emojis (exceto se for botão ou bio)
6. NÃO adicione aspas ou formatação extra

${currentText ? `TEXTO ATUAL (use como referência para melhorar): "${currentText}"` : ""}

FORMATO: Retorne EXATAMENTE 3 opções, uma por linha, sem numeração, sem explicação.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Gere 3 opções de "${field.description}" para o nicho "${niche}". Lembre-se: máximo ${field.maxChars} caracteres cada.` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar sugestões");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the response into 3 options
    const options = content
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.startsWith("-") && !line.match(/^\d+[\.\)]/))
      .map((line: string) => line.replace(/^["']|["']$/g, '').trim()) // Remove quotes
      .slice(0, 3);

    if (options.length === 0) {
      throw new Error("AI não gerou opções válidas");
    }

    return new Response(
      JSON.stringify({ options }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating copy:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
