import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CoverImageUploadProps {
  coverImageUrl: string;
  onChange: (url: string) => void;
}

const CoverImageUpload = ({ coverImageUrl, onChange }: CoverImageUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/covers/cover_${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('uploads').upload(filePath, file);
      if (error) throw error;
      
      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      if (data?.publicUrl) {
        onChange(data.publicUrl);
        toast.success("Imagem de capa enviada!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        Imagem de Capa (Dashboard)
      </Label>
      <p className="text-xs text-gray-500">
        Esta imagem aparece na sua dashboard para identificar o template
      </p>
      
      {coverImageUrl ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={coverImageUrl} 
            alt="Capa do template" 
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-gray-500">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">Clique para enviar</span>
              <span className="text-xs text-gray-400">PNG, JPG até 2MB</span>
              <span className="text-xs text-primary/70 font-medium">Recomendado: 1280x720px</span>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            className="hidden" 
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};

export default CoverImageUpload;