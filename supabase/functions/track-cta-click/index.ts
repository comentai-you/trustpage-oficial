import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page_id, page_type } = await req.json();

    if (!page_id) {
      return new Response(
        JSON.stringify({ error: "page_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Detect device type from user agent
    const userAgent = req.headers.get("user-agent") || "";
    let deviceType = "desktop";
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      deviceType = /ipad|tablet/i.test(userAgent) ? "tablet" : "mobile";
    }

    // Hash IP for privacy
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);

    const referrer = req.headers.get("referer") || null;

    const { error } = await supabase.from("cta_clicks").insert({
      page_id,
      page_type: page_type || "landing",
      ip_hash: ipHash,
      user_agent: userAgent.slice(0, 512),
      device_type: deviceType,
      referrer,
    });

    if (error) {
      console.error("Error inserting cta click:", error);
      return new Response(
        JSON.stringify({ error: "Failed to track click" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("track-cta-click error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
