import { InputWithAI } from "@/components/ui/input-with-ai";
import { Label } from "@/components/ui/label";
import { TextareaWithAI } from "@/components/ui/textarea-with-ai";
import { Button } from "@/components/ui/button";
import { FAQSection } from "@/types/section-builder";
import { Plus, Trash2 } from "lucide-react";

interface FAQSectionEditorProps {
  data: FAQSection['data'];
  onChange: (data: FAQSection['data']) => void;
}

const FAQSectionEditor = ({ data, onChange }: FAQSectionEditorProps) => {
  const addItem = () => {
    const newItem = {
      id: `faq_${Date.now()}`,
      question: 'Nova pergunta?',
      answer: 'Resposta aqui...'
    };
    onChange({ ...data, items: [...(data.items || []), newItem] });
  };

  const updateItem = (index: number, updates: Partial<typeof data.items[0]>) => {
    const newItems = [...(data.items || [])];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = (data.items || []).filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Título da Seção</Label>
        <InputWithAI
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Perguntas Frequentes"
          className="text-sm"
          aiFieldType="section_title"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Perguntas ({data.items?.length || 0})</Label>
        {(data.items || []).map((item, index) => (
          <div key={item.id} className="p-3 border border-border rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <InputWithAI
                  value={item.question}
                  onChange={(e) => updateItem(index, { question: e.target.value })}
                  placeholder="Pergunta"
                  className="text-sm"
                  aiFieldType="faq_question"
                />
                <TextareaWithAI
                  value={item.answer}
                  onChange={(e) => updateItem(index, { answer: e.target.value })}
                  placeholder="Resposta"
                  className="text-sm resize-none"
                  rows={2}
                  aiFieldType="faq_answer"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Adicionar Pergunta
        </Button>
      </div>
    </div>
  );
};

export default FAQSectionEditor;
