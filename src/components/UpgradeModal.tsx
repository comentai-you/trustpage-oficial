import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Crown, Lock, Zap, Video, Clock, Globe, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: 'vsl' | 'sales' | 'delay' | 'domain' | 'video' | 'html' | 'limit';
}

const featureDetails = {
  vsl: {
    icon: Video,
    title: 'Página VSL',
    description: 'Crie páginas de VSL com vídeo de vendas integrado e botão com delay para aumentar suas conversões.',
  },
  sales: {
    icon: Sparkles,
    title: 'Página de Vendas',
    description: 'Layout completo com carrossel de imagens, múltiplos CTAs e design profissional.',
  },
  delay: {
    icon: Clock,
    title: 'Delay no Botão',
    description: 'Aumente suas conversões ocultando o botão até que uma % do vídeo seja assistida.',
  },
  domain: {
    icon: Globe,
    title: 'Domínio Personalizado',
    description: 'Use seu próprio domínio para transmitir mais profissionalismo e confiança.',
  },
  video: {
    icon: Video,
    title: 'Vídeo Integrado',
    description: 'Adicione vídeos às suas páginas para aumentar o engajamento e conversões.',
  },
  html: {
    icon: Lock,
    title: 'HTML Personalizado',
    description: 'Adicione códigos personalizados, iframes e scripts às suas páginas.',
  },
  limit: {
    icon: Crown,
    title: 'Limite de Páginas',
    description: 'Você atingiu o limite de páginas do seu plano. Faça upgrade para criar mais páginas.',
  },
};

const UpgradeModal = ({ open, onOpenChange, feature }: UpgradeModalProps) => {
  const navigate = useNavigate();
  const details = featureDetails[feature];
  const Icon = details.icon;

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/assinatura');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 relative">
            <Icon className="w-8 h-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
              <Lock className="w-3 h-3 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {details.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {details.description}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 my-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Plano Essencial</p>
              <p className="text-xs text-muted-foreground">A partir de R$ 29,90/mês</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            className="w-full gradient-button font-semibold"
            onClick={handleUpgrade}
          >
            <Zap className="w-4 h-4 mr-2" />
            Fazer Upgrade Agora
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Continuar no Plano Gratuito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;