import { cn } from "@/lib/utils";

interface EmailPreviewProps {
  subject: string;
  content: string;
  mode: "mobile" | "desktop";
}

// Email template wrapper - table-based for compatibility
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
              ${content || '<p style="color: #a1a1aa; text-align: center;">Comece a escrever seu email...</p>'}
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
                <a href="#unsubscribe" style="color: #71717a; text-decoration: underline;">Cancelar inscrição</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const EmailPreview = ({ subject, content, mode }: EmailPreviewProps) => {
  const emailHtml = wrapInEmailTemplate(content, subject);

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300",
        mode === "mobile" ? "w-[375px]" : "w-full max-w-[700px]"
      )}
    >
      {/* Email Client Header */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-12">De:</span>
            <span className="text-gray-900 dark:text-white">TrustPage &lt;noreply@trustpageapp.com&gt;</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-12">Para:</span>
            <span className="text-gray-900 dark:text-white">{"{{user_email}}"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-12">Assunto:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {subject || "Sem assunto"}
            </span>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div
        className={cn(
          "overflow-y-auto",
          mode === "mobile" ? "max-h-[600px]" : "max-h-[500px]"
        )}
      >
        <iframe
          srcDoc={emailHtml}
          title="Email Preview"
          className="w-full h-[600px] border-0"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
};

export default EmailPreview;

// Export the template wrapper for use in edge functions
export { wrapInEmailTemplate };
