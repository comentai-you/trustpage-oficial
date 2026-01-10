import { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAICopywriter } from '@/contexts/AICopywriterContext';
import { toast } from 'sonner';

interface AIConfigDialogProps {
  trigger?: React.ReactNode;
}

export const AIConfigDialog = ({ trigger }: AIConfigDialogProps) => {
  const { settings, updateSettings, isConfigured } = useAICopywriter();
  const [open, setOpen] = useState(false);
  const [localNiche, setLocalNiche] = useState(settings.niche);
  const [localPageType, setLocalPageType] = useState(settings.pageType);

  const handleSave = () => {
    if (!localNiche.trim()) {
      toast.error('Digite o nicho do seu negócio');
      return;
    }

    updateSettings({
      niche: localNiche.trim(),
      pageType: localPageType
    });

    toast.success('Configurações da IA salvas!', {
      description: 'Agora você pode usar a varinha mágica nos campos de texto.'
    });
    setOpen(false);
  };

  const nicheExamples = [
    'Emagrecimento',
    'Renda Extra',
    'Marketing Digital',
    'Investimentos',
    'Desenvolvimento Pessoal',
    'Fitness',
    'Culinária',
    'Beleza e Estética'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 ${isConfigured ? 'border-purple-300 bg-purple-50 text-purple-700' : ''}`}
          >
            <Brain className="w-4 h-4" />
            Cérebro IA
            {isConfigured && <Sparkles className="w-3 h-3" />}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Configurar IA Copywriter
          </DialogTitle>
          <DialogDescription>
            Configure o contexto para que a IA gere textos mais relevantes para seu negócio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Niche Input */}
          <div className="space-y-2">
            <Label htmlFor="niche">Qual é o seu Nicho?</Label>
            <Input
              id="niche"
              value={localNiche}
              onChange={(e) => setLocalNiche(e.target.value)}
              placeholder="Ex: Emagrecimento, PLR de Renda Extra..."
              className="bg-gray-50"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {nicheExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setLocalNiche(example)}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Page Type Select */}
          <div className="space-y-2">
            <Label htmlFor="pageType">Objetivo da Página</Label>
            <Select value={localPageType} onValueChange={(value: 'sales' | 'vsl' | 'bio') => setLocalPageType(value)}>
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Página de Vendas</SelectItem>
                <SelectItem value="vsl">VSL (Video Sales Letter)</SelectItem>
                <SelectItem value="bio">Link na Bio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">💡 Dica:</span> Quanto mais específico for o nicho, 
              melhores serão as sugestões de copy geradas pela IA.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
