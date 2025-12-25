import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Server-side validation schema (mirrors client-side)
const contactSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  subject: z.string().trim().min(5, "Assunto deve ter pelo menos 5 caracteres").max(200, "Assunto muito longo"),
  message: z.string().trim().min(20, "Mensagem deve ter pelo menos 20 caracteres").max(2000, "Mensagem muito longa"),
});

// HTML escape function to prevent XSS in email content
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate with Zod (server-side validation)
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      console.log("Validation failed:", validation.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Dados inválidos",
          details: validation.error.errors.map(e => e.message)
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, subject, message } = validation.data;

    console.log("Received contact form submission:", { name, email: email.substring(0, 5) + "***", subject });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TrustPage <onboarding@resend.dev>",
        to: ["atendimento@trustpageapp.com"],
        subject: `[Contato TrustPage] ${escapeHtml(subject)}`,
        reply_to: email,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B5CF6;">Nova mensagem de contato - TrustPage</h2>
            <hr style="border: 1px solid #e5e7eb;" />
            
            <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Assunto:</strong> ${escapeHtml(subject)}</p>
            
            <h3 style="color: #374151;">Mensagem:</h3>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #8B5CF6;">
              <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>
            
            <hr style="border: 1px solid #e5e7eb; margin-top: 24px;" />
            <p style="color: #6b7280; font-size: 12px;">
              Esta mensagem foi enviada através do formulário de contato do TrustPage.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Email enviado com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao enviar mensagem. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
