import { useState, useEffect } from 'react';
import { Wand2, Loader2, Crown, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
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
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showConfigWarning, setShowConfigWarning] = useState(false);

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

  const handleGenerate = async () => {
    setLoading(true);
    setOptions([]);
    setShowUpgrade(false);
    setShowConfigWarning(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!user) {
      toast.error('Faça login para usar a IA Copywriter');
      return;
    }

    // Open popover first
    setOpen(true);
    setOptions([]);
    setShowUpgrade(false);
    setShowConfigWarning(false);

    // Check if PRO
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }

    // Check if configured
    if (!isConfigured) {
      setShowConfigWarning(true);
      return;
    }

    // Generate
    handleGenerate();
  };

  const handleSelectOption = (option: string) => {
    onSelect(option);
    setOpen(false);
    toast.success('Texto aplicado!');
  };

  const handleUpgrade = () => {
    setOpen(false);
    navigate('/oferta');
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
      <PopoverContent className="w-80 p-0" align="end" sideOffset={4}>
        {/* Upgrade CTA for Free users */}
        {showUpgrade && (
          <div className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">
              Funcionalidade Exclusiva PRO
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Faça upgrade para desbloquear a IA Copywriter e gerar textos de alta conversão automaticamente.
            </p>
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Ver Planos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Config Warning */}
        {showConfigWarning && !showUpgrade && (
          <div className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">
              Configure a IA primeiro
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Clique no botão <strong>"Cérebro IA"</strong> na barra lateral para configurar o nicho e tipo de página.
            </p>
            <Button 
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Entendi
            </Button>
          </div>
        )}

        {/* Normal flow for PRO + Configured */}
        {!showUpgrade && !showConfigWarning && (
          <>
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
                  Gerando opções...
                </div>
              )}
            </div>

            {options.length > 0 && (
              <div className="p-2 border-t bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full text-xs text-purple-600 hover:text-purple-800"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Tentar Novamente
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
