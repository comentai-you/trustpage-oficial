import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Rate limit: max views per IP per hour
const MAX_VIEWS_PER_IP_PER_HOUR = 20;

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers (set by reverse proxy/CDN)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     req.headers.get("cf-connecting-ip") ||
                     "unknown";

    if (clientIp === "unknown") {
      console.log("Unable to determine client IP");
      return new Response(
        JSON.stringify({ success: false, error: "Unable to process request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { page_id } = body;

    if (!page_id || typeof page_id !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid page_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(page_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid page_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create IP-based fingerprint (hashed for privacy)
    const ipHash = hashString(clientIp + new Date().toISOString().split('T')[0]);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit: count views from this IP in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentViews, error: countError } = await supabase
      .from("page_view_tracking")
      .select("id")
      .eq("viewer_fingerprint", ipHash)
      .gte("viewed_at", oneHourAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
      // Continue anyway - don't block legitimate users due to DB errors
    }

    const viewCount = recentViews?.length || 0;

    if (viewCount >= MAX_VIEWS_PER_IP_PER_HOUR) {
      console.log(`Rate limit exceeded for IP hash: ${ipHash}, count: ${viewCount}`);
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for recent view from same IP for this specific page (1 hour window)
    const { data: existingView } = await supabase
      .from("page_view_tracking")
      .select("id")
      .eq("page_id", page_id)
      .eq("viewer_fingerprint", ipHash)
      .gte("viewed_at", oneHourAgo)
      .maybeSingle();

    if (existingView) {
      console.log(`Duplicate view blocked for page ${page_id} from IP hash ${ipHash}`);
      return new Response(
        JSON.stringify({ success: true, counted: false, reason: "Already viewed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the page exists and is published
    const { data: page, error: pageError } = await supabase
      .from("landing_pages")
      .select("id, is_published")
      .eq("id", page_id)
      .eq("is_published", true)
      .maybeSingle();

    if (pageError || !page) {
      console.log(`Page not found or not published: ${page_id}`);
      return new Response(
        JSON.stringify({ success: false, error: "Page not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment view count using RPC function
    const { error: rpcError } = await supabase.rpc("increment_page_views", {
      page_id: page_id,
      viewer_fingerprint: ipHash
    });

    if (rpcError) {
      console.error("Error incrementing views:", rpcError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to increment views" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`View counted for page ${page_id} from IP hash ${ipHash}`);

    return new Response(
      JSON.stringify({ success: true, counted: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in increment-page-view:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
