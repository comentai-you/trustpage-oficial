import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

const SlugHelpModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Ajuda sobre o link da página"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Como funciona o Link da Página
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            O <strong>slug</strong> é a parte final da URL que identifica sua página. 
            Por exemplo: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">tpage.com.br/p/<strong>seu-slug</strong></code>
          </p>

          {/* Good examples */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Boas práticas
            </h4>
            <ul className="space-y-1.5 text-muted-foreground ml-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Use nomes curtos e memoráveis: <code className="bg-muted px-1 rounded text-xs">oferta-natal</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Apenas letras, números e hífens: <code className="bg-muted px-1 rounded text-xs">meu-produto-2024</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Relacione com o conteúdo: <code className="bg-muted px-1 rounded text-xs">curso-marketing</code></span>
              </li>
            </ul>
          </div>

          {/* Bad examples */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-destructive">
              <XCircle className="w-4 h-4" />
              Evite
            </h4>
            <ul className="space-y-1.5 text-muted-foreground ml-6">
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Colar URLs completas (o sistema extrai automaticamente)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Caracteres especiais: <code className="bg-muted px-1 rounded text-xs line-through">oferta@2024!</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Nomes muito longos ou confusos</span>
              </li>
            </ul>
          </div>

          {/* Tip */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-foreground">
              <strong>💡 Dica:</strong> Se você não personalizar, o sistema gera automaticamente 
              um slug baseado no nome do seu negócio.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlugHelpModal;
