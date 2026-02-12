import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BackRedirectSectionProps {
  enabled: boolean;
  url: string;
  onEnabledChange: (enabled: boolean) => void;
  onUrlChange: (url: string) => void;
  /** If true, renders as standalone accordion item. If false, renders inline (for sidebars that already have their own accordion). */
  asAccordion?: boolean;
}

const BackRedirectContent = ({ enabled, url, onEnabledChange, onUrlChange }: Omit<BackRedirectSectionProps, 'asAccordion'>) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Tooltip>
        <TooltipTrigger asChild>
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-help">
            <RotateCcw className="w-4 h-4" />
            Ativar Back Redirect
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
          </Label>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs max-w-[240px]">
          Quando o visitante clicar no botão "Voltar" do navegador, ele será enviado para este link em vez de sair do site.
        </TooltipContent>
      </Tooltip>
      <Switch checked={enabled} onCheckedChange={onEnabledChange} />
    </div>

    {enabled && (
      <div className="space-y-2">
        <Label className="text-xs text-gray-600">URL de Destino</Label>
        <Input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Ex: https://wa.me/seunumero ou https://seusite.com/promocao"
          className="bg-gray-50 border-gray-300 focus:border-primary text-sm"
        />
        <p className="text-[10px] text-gray-400">
          WhatsApp, página de oferta ou qualquer URL de retenção.
        </p>
      </div>
    )}
  </div>
);

const BackRedirectSection = ({ asAccordion = true, ...props }: BackRedirectSectionProps) => {
  if (!asAccordion) {
    return <BackRedirectContent {...props} />;
  }

  return (
    <AccordionItem value="back-redirect" className="border-b border-gray-200">
      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-primary" />
          Retenção & Redirecionamento
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <BackRedirectContent {...props} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default BackRedirectSection;
