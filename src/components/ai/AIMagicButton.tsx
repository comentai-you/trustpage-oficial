import { useState, useRef, useEffect } from 'react';
import { Wand2, Loader2, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAICopywriter } from '@/contexts/AICopywriterContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AIMagicButtonProps {
  fieldType: 'headline' | 'subheadline' | 'button' | 'body' | 'benefit' | 'testimonial' | 'faq_question' | 'faq_answer' | 'offer' | 'default';
  currentText?: string;
  onSelect: (text: string) => void;
  className?: string;
}

export const AIMagicButton = ({ fieldType, currentText, onSelect, className }: AIMagicButtonProps) => {
  const { settings, isConfigured } = useAICopywriter();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  // Check if user is PRO
  useEffect(() => {
    const checkPlan = async () => {
      if (!user) {
        setIsPro(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking plan:', error);
        setIsPro(false);
        return;
      }

      // PRO plans: pro, elite
      setIsPro(data?.plan_type === 'pro' || data?.plan_type === 'elite');
    };

    checkPlan();
  }, [user]);

  const handleClick = async () => {
    if (!user) {
      toast.error('Faça login para usar a IA Copywriter');
      return;
    }

    if (!isPro) {
      toast.error('Recurso exclusivo para planos PRO', {
        description: 'Faça upgrade para desbloquear a IA Copywriter.',
        action: {
          label: 'Ver Planos',
          onClick: () => navigate('/oferta')
        }
      });
      return;
    }

    if (!isConfigured) {
      toast.error('Configure a IA primeiro', {
        description: 'Clique no botão "Cérebro IA" na barra lateral para configurar.'
      });
      return;
    }

    setOpen(true);
    setLoading(true);
    setOptions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-copy', {
        body: {
          niche: settings.niche,
          pageType: settings.pageType,
          fieldType,
          currentText: currentText || ''
        }
      });

      if (error) throw error;

      if (data?.options && Array.isArray(data.options)) {
        setOptions(data.options);
      } else {
        throw new Error('Resposta inválida da IA');
      }
    } catch (error) {
      console.error('Error generating copy:', error);
      toast.error('Erro ao gerar sugestões', {
        description: 'Tente novamente em alguns segundos.'
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    onSelect(option);
    setOpen(false);
    toast.success('Texto aplicado!');
  };

  // Don't render if context is not available
  if (!settings) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className={`h-7 w-7 text-purple-500 hover:text-purple-700 hover:bg-purple-50 ${className}`}
          title={isPro ? 'Gerar com IA' : 'Recurso PRO'}
        >
          {isPro === false ? (
            <Crown className="h-4 w-4 text-amber-500" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-800">
            <Sparkles className="w-4 h-4" />
            Sugestões da IA
          </div>
          <p className="text-xs text-purple-600 mt-0.5">
            Nicho: {settings.niche}
          </p>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              <span className="ml-2 text-sm text-gray-500">Gerando sugestões...</span>
            </div>
          ) : options.length > 0 ? (
            <div className="space-y-1.5">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(option)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-purple-800">
                    {option}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-500">
              Clique para gerar sugestões
            </div>
          )}
        </div>

        {options.length > 0 && (
          <div className="p-2 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              disabled={loading}
              className="w-full text-xs text-purple-600 hover:text-purple-800"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Gerar novas opções
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
