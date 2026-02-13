import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const leadSchema = z.object({
  landing_page_id: z.string().uuid("Invalid landing page ID"),
  name: z.string().max(200, "Name too long").optional().nullable(),
  email: z.string().email("Invalid email").max(255, "Email too long").optional().nullable(),
  phone: z.string().max(50, "Phone too long").optional().nullable(),
  whatsapp: z.string().max(50, "WhatsApp too long").optional().nullable(),
});

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

// In-memory rate limiting per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

const checkRateLimit = (ipHash: string): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const record = rateLimitMap.get(ipHash);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ipHash, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
};

// Suspicious patterns
const suspiciousEmailPatterns = [
  /^test\d+@/i,
  /^spam\d+@/i,
  /^no-?reply@/i,
  /@(tempmail|guerrillamail|10minutemail|mailinator|throwaway)\./i,
];

// Fire webhook asynchronously (never blocks response)
async function fireWebhook(webhookUrl: string, leadData: Record<string, unknown>) {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "lead.created", data: leadData }),
    });
    console.log(`Webhook fired to ${webhookUrl} — status: ${res.status}`);
  } catch (err) {
    console.error(`Webhook failed for ${webhookUrl}:`, err);
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "60",
          },
        }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = leadSchema.safeParse(body);
    if (!validation.success) {
      console.log("Validation failed:", validation.error.errors);
      return new Response(
        JSON.stringify({
          error: "Invalid data",
          details: validation.error.errors.map((e) => e.message),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { landing_page_id, name, email, phone, whatsapp } = validation.data;

    // Server-side validation: At least one contact field must be provided
    const hasEmail = email && email.trim().length > 0;
    const hasPhone = phone && phone.trim().length > 0;
    const hasWhatsapp = whatsapp && whatsapp.trim().length > 0;
    
    if (!hasEmail && !hasPhone && !hasWhatsapp) {
      console.log("No contact information provided");
      return new Response(
        JSON.stringify({ error: "At least one contact field (email, phone, or WhatsApp) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for suspicious email patterns
    if (hasEmail && suspiciousEmailPatterns.some((pattern) => pattern.test(email!))) {
      console.log(`Suspicious email pattern detected: ${email!.substring(0, 10)}***`);
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for privileged operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify landing page exists, is published, and owner has active subscription
    const { data: canSubmit, error: checkError } = await supabase.rpc("can_submit_lead", {
      target_page_id: landing_page_id,
    });

    if (checkError) {
      console.error("Error checking lead submission:", checkError);
      return new Response(
        JSON.stringify({ error: "Failed to verify page" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!canSubmit) {
      console.log(`Lead submission denied for page ${landing_page_id}`);
      return new Response(
        JSON.stringify({ error: "Page not found or not accepting submissions" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert lead using service role (bypasses RLS)
    const { error: insertError } = await supabase.from("leads").insert({
      landing_page_id,
      name: name || null,
      email: email ? email.toLowerCase().trim() : null,
      phone: phone || null,
      whatsapp: whatsapp || null,
    });

    if (insertError) {
      console.error("Error inserting lead:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Lead submitted for page ${landing_page_id}`);

    // --- Webhook: fire-and-forget ---
    const { data: pageData } = await supabase
      .from("landing_pages")
      .select("webhook_enabled, webhook_url")
      .eq("id", landing_page_id)
      .maybeSingle();

    if (pageData?.webhook_enabled && pageData?.webhook_url) {
      // Extract utm_source from referer or body (passed from client)
      const utmSource = body.utm_source || null;

      const webhookPayload: Record<string, unknown> = {
        data_hora: new Date().toISOString(),
        origem: utmSource,
      };
      if (name) webhookPayload.name = name;
      if (hasEmail) webhookPayload.email = email!.toLowerCase().trim();
      if (hasPhone) webhookPayload.phone = phone;
      if (hasWhatsapp) webhookPayload.whatsapp = whatsapp;

      // Don't await — fire and forget
      fireWebhook(pageData.webhook_url, webhookPayload).catch(() => {});
    }

    return new Response(
      JSON.stringify({ success: true, message: "Lead submitted successfully" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in submit-lead:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
