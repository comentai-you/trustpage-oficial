import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[process-campaigns] Starting campaign processing...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pending campaigns that are due
    const now = new Date().toISOString();
    const { data: campaigns, error: campaignsError } = await supabase
      .from("marketing_campaigns")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", now);

    if (campaignsError) {
      console.error("[process-campaigns] Error fetching campaigns:", campaignsError);
      throw campaignsError;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("[process-campaigns] No pending campaigns to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[process-campaigns] Found ${campaigns.length} campaigns to process`);

    const results = [];

    for (const campaign of campaigns) {
      console.log(`[process-campaigns] Processing campaign: ${campaign.id} - ${campaign.title}`);

      try {
        // Call the send-marketing-email function to handle the actual sending
        const { error: invokeError } = await supabase.functions.invoke(
          "send-marketing-email",
          {
            body: {
              type: "campaign",
              campaignId: campaign.id,
            },
          }
        );

        if (invokeError) {
          console.error(
            `[process-campaigns] Error invoking send-marketing-email for ${campaign.id}:`,
            invokeError
          );
          
          // Mark as failed
          await supabase
            .from("marketing_campaigns")
            .update({ status: "failed" })
            .eq("id", campaign.id);

          results.push({ id: campaign.id, status: "failed", error: invokeError.message });
        } else {
          results.push({ id: campaign.id, status: "processing" });
        }
      } catch (err) {
        console.error(`[process-campaigns] Exception for campaign ${campaign.id}:`, err);
        
        await supabase
          .from("marketing_campaigns")
          .update({ status: "failed" })
          .eq("id", campaign.id);

        results.push({ 
          id: campaign.id, 
          status: "failed", 
          error: err instanceof Error ? err.message : "Unknown error" 
        });
      }
    }

    console.log("[process-campaigns] Completed processing:", results);

    return new Response(
      JSON.stringify({ success: true, processed: campaigns.length, results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("[process-campaigns] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
