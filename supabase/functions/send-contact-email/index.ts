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
  honeypot: z.string().optional(), // Honeypot field for bot detection
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

// Simple hash function for IP fingerprinting
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// In-memory rate limiting (resets on function cold start)
// For production, consider using Supabase table or KV store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 contact form submissions per IP per hour

const checkRateLimit = (ipHash: string): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const record = rateLimitMap.get(ipHash);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(ipHash, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
};

// Suspicious email patterns
const suspiciousEmailPatterns = [
  /^test\d+@/i,
  /^spam\d+@/i,
  /^no-?reply@/i,
  /@(tempmail|guerrillamail|10minutemail|mailinator|throwaway)\./i,
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     req.headers.get("cf-connecting-ip") ||
                     "unknown";

    const ipHash = hashString(clientIp);

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ipHash);
    if (!allowed) {
      console.log(`Rate limit exceeded for IP hash: ${ipHash}`);
      return new Response(
        JSON.stringify({ 
          error: "Limite de envios atingido. Tente novamente em 1 hora." 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "3600"
          } 
        }
      );
    }

    const body = await req.json();

    // Check honeypot - if filled, it's likely a bot
    if (body.honeypot) {
      console.log(`Bot detected via honeypot from IP hash: ${ipHash}`);
      // Return fake success to not alert bots
      return new Response(
        JSON.stringify({ success: true, message: "Email enviado com sucesso" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Check for suspicious email patterns
    if (suspiciousEmailPatterns.some(pattern => pattern.test(email))) {
      console.log(`Suspicious email pattern detected: ${email.substring(0, 10)}***`);
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received contact form submission:", { 
      name, 
      email: email.substring(0, 5) + "***", 
      subject,
      ipHash,
      remaining 
    });

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
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(remaining)
        } 
      }
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
