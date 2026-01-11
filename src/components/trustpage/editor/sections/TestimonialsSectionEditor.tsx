import { Input } from "@/components/ui/input";
import { InputWithAI } from "@/components/ui/input-with-ai";
import { Label } from "@/components/ui/label";
import { TextareaWithAI } from "@/components/ui/textarea-with-ai";
import { Button } from "@/components/ui/button";
import { TestimonialsSection } from "@/types/section-builder";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TestimonialsSectionEditorProps {
  data: TestimonialsSection['data'];
  onChange: (data: TestimonialsSection['data']) => void;
}

const TestimonialsSectionEditor = ({ data, onChange }: TestimonialsSectionEditorProps) => {
  const { user } = useAuth();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem = {
      id: `testimonial_${Date.now()}`,
      name: 'Nome do Cliente',
      text: 'Depoimento aqui...',
      avatarUrl: ''
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingIndex(index);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `avatar_${uniqueId}.${fileExt}`;
      const filePath = `${user.id}/avatars/${fileName}`;

      const { error } = await supabase.storage.from('uploads').upload(filePath, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        updateItem(index, { avatarUrl: urlData.publicUrl });
        toast.success("Avatar enviado!");
      }
    } catch (error) {
      toast.error("Erro ao enviar avatar");
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Título da Seção</Label>
        <InputWithAI
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="O que nossos clientes dizem"
          className="text-sm"
          aiFieldType="section_title"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Depoimentos ({data.items?.length || 0})</Label>
        {(data.items || []).map((item, index) => (
          <div key={item.id} className="p-3 border border-border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              {item.avatarUrl ? (
                <div className="relative">
                  <img src={item.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <button
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center"
                    onClick={() => updateItem(index, { avatarUrl: '' })}
                  >
                    <X className="w-2 h-2 text-white" />
                  </button>
                </div>
              ) : (
                <label className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, index)} />
                  {uploadingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
                </label>
              )}
              <Input
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                placeholder="Nome"
                className="text-sm flex-1"
              />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeItem(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <TextareaWithAI
              value={item.text}
              onChange={(e) => updateItem(index, { text: e.target.value })}
              placeholder="Depoimento"
              className="text-sm resize-none"
              rows={2}
              aiFieldType="testimonial"
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Adicionar Depoimento
        </Button>
      </div>
    </div>
  );
};

export default TestimonialsSectionEditor;
