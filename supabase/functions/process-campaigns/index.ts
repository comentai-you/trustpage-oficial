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
    const serverTime = new Date();
    const serverTimeISO = serverTime.toISOString();
    
    console.log("===========================================");
    console.log("[process-campaigns] Starting campaign processing...");
    console.log("[process-campaigns] Hora Atual do Servidor (UTC):", serverTimeISO);
    console.log("[process-campaigns] Hora Atual do Servidor (Local):", serverTime.toString());
    console.log("===========================================");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pending campaigns that are due
    // Using NOW() directly in the query for accurate server-side comparison
    console.log("[process-campaigns] Buscando campanhas pendentes agendadas antes de:", serverTimeISO);
    
    const { data: campaigns, error: campaignsError } = await supabase
      .from("marketing_campaigns")
      .select("*")
      .eq("status", "pending")
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", serverTimeISO);

    if (campaignsError) {
      console.error("[process-campaigns] Error fetching campaigns:", campaignsError);
      throw campaignsError;
    }

    // Also log all pending campaigns for debugging
    const { data: allPending } = await supabase
      .from("marketing_campaigns")
      .select("id, title, scheduled_at, status")
      .eq("status", "pending");
    
    console.log("[process-campaigns] Todas as campanhas pendentes:");
    allPending?.forEach(c => {
      const scheduledAt = c.scheduled_at ? new Date(c.scheduled_at) : null;
      const isPastDue = scheduledAt ? scheduledAt <= serverTime : false;
      console.log(`  - ${c.id}: "${c.title}" | scheduled_at: ${c.scheduled_at} | isPastDue: ${isPastDue}`);
    });

    if (!campaigns || campaigns.length === 0) {
      console.log("[process-campaigns] No pending campaigns to process at this time");
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0,
          serverTime: serverTimeISO,
          pendingCampaigns: allPending?.length || 0,
          message: "Nenhuma campanha pendente para processar agora"
        }),
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
      console.log(`[process-campaigns] Campaign scheduled_at: ${campaign.scheduled_at}`);

      try {
        // Update status to processing first
        await supabase
          .from("marketing_campaigns")
          .update({ status: "processing" })
          .eq("id", campaign.id);

        // Call the send-marketing-email function to handle the actual sending
        const { data: invokeData, error: invokeError } = await supabase.functions.invoke(
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

          results.push({ 
            id: campaign.id, 
            title: campaign.title,
            status: "failed", 
            error: invokeError.message 
          });
        } else {
          console.log(`[process-campaigns] Successfully invoked send-marketing-email for ${campaign.id}:`, invokeData);
          
          // Mark as completed
          await supabase
            .from("marketing_campaigns")
            .update({ 
              status: "completed",
              updated_at: new Date().toISOString()
            })
            .eq("id", campaign.id);

          results.push({ 
            id: campaign.id, 
            title: campaign.title,
            status: "completed",
            response: invokeData
          });
        }
      } catch (err) {
        console.error(`[process-campaigns] Exception for campaign ${campaign.id}:`, err);
        
        await supabase
          .from("marketing_campaigns")
          .update({ status: "failed" })
          .eq("id", campaign.id);

        results.push({ 
          id: campaign.id, 
          title: campaign.title,
          status: "failed", 
          error: err instanceof Error ? err.message : "Unknown error" 
        });
      }
    }

    console.log("[process-campaigns] Completed processing:", JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: campaigns.length, 
        results,
        serverTime: serverTimeISO
      }),
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
