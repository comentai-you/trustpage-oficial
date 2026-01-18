import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Send email using Resend API directly
async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TrustPage <noreply@trustpageapp.com>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Email template wrapper - table-based for maximum compatibility
const wrapInEmailTemplate = (content: string, subject: string): string => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
      line-height: 1.6;
    }
    a {
      color: #8B5CF6;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    h1, h2, h3 {
      margin-top: 0;
      color: #18181b;
    }
    p {
      margin: 0 0 16px;
    }
    blockquote {
      border-left: 4px solid #8B5CF6;
      margin: 16px 0;
      padding-left: 16px;
      color: #52525b;
    }
    ul, ol {
      margin: 0 0 16px;
      padding-left: 24px;
    }
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Header -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img 
                src="https://trustpageapp.com/logo.png" 
                alt="TrustPage" 
                width="150" 
                style="display: block;"
              />
            </td>
          </tr>
        </table>

        <!-- Main Content Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px;">
              {{CONTENT}}
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="font-size: 12px; color: #71717a; margin: 0;">
                Enviado via <a href="https://trustpageapp.com" style="color: #8B5CF6; text-decoration: none;">TrustPage</a>
              </p>
              <p style="font-size: 12px; color: #71717a; margin: 8px 0 0;">
                <a href="{{UNSUBSCRIBE_URL}}" style="color: #71717a; text-decoration: underline;">Cancelar inscrição</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.replace("{{CONTENT}}", content);
};

// Replace personalization variables
const personalizeContent = (
  content: string,
  user: { name?: string; email?: string }
): string => {
  return content
    .replace(/\{\{user_name\}\}/g, user.name || "Usuário")
    .replace(/\{\{user_email\}\}/g, user.email || "");
};

interface SendRequest {
  type: "test" | "campaign";
  campaignId?: string;
  to?: string;
  subject?: string;
  content?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, campaignId, to, subject, content }: SendRequest =
      await req.json();

    console.log(`[send-marketing-email] Type: ${type}`);

    // TEST EMAIL - Send to a single address
    if (type === "test" && to && subject && content) {
      console.log(`[send-marketing-email] Sending test email to: ${to}`);

      const personalizedContent = personalizeContent(content, {
        name: "Usuário Teste",
        email: to,
      });
      const finalHtml = wrapInEmailTemplate(personalizedContent, subject).replace(
        "{{UNSUBSCRIBE_URL}}",
        "#"
      );

      const emailResponse = await sendEmail(to, subject, finalHtml);

      console.log("[send-marketing-email] Test email sent:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, data: emailResponse }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // CAMPAIGN EMAIL - Send to all users (for cron job)
    if (type === "campaign" && campaignId) {
      console.log(`[send-marketing-email] Processing campaign: ${campaignId}`);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError || !campaign) {
        console.error("[send-marketing-email] Campaign not found:", campaignError);
        return new Response(
          JSON.stringify({ error: "Campaign not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Update status to processing
      await supabase
        .from("marketing_campaigns")
        .update({ status: "processing" })
        .eq("id", campaignId);

      // Get all users with emails
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) {
        console.error("[send-marketing-email] Error fetching users:", usersError);
        throw usersError;
      }

      const validUsers = users.users.filter((u) => u.email);
      console.log(`[send-marketing-email] Sending to ${validUsers.length} users`);

      let sentCount = 0;
      let failedCount = 0;

      for (const user of validUsers) {
        try {
          const personalizedContent = personalizeContent(campaign.content, {
            name: user.user_metadata?.full_name || "Usuário",
            email: user.email,
          });
          const finalHtml = wrapInEmailTemplate(
            personalizedContent,
            campaign.subject
          ).replace("{{UNSUBSCRIBE_URL}}", "#");

          await sendEmail(user.email!, campaign.subject, finalHtml);

          sentCount++;
        } catch (emailErr) {
          console.error(
            `[send-marketing-email] Failed to send to ${user.email}:`,
            emailErr
          );
          failedCount++;
        }
      }

      // Update campaign with results
      await supabase
        .from("marketing_campaigns")
        .update({
          status: "completed",
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq("id", campaignId);

      console.log(
        `[send-marketing-email] Campaign completed: ${sentCount} sent, ${failedCount} failed`
      );

      return new Response(
        JSON.stringify({ success: true, sentCount, failedCount }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request type" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("[send-marketing-email] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
