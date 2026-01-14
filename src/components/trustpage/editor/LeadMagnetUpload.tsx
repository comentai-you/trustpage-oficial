import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface LeadMagnetUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const LeadMagnetUpload = ({ value, onChange }: LeadMagnetUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOC, DOCX, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/epub+zip',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou EPUB.");
      return;
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 50MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para fazer upload.");
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Simulate progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.storage
        .from('lead-magnets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        console.error("Upload error:", error);
        toast.error("Erro ao fazer upload do arquivo.");
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lead-magnets')
        .getPublicUrl(data.path);

      setUploadProgress(100);
      onChange(publicUrl);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload do arquivo.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract path from URL
      const url = new URL(value);
      const pathMatch = url.pathname.match(/\/lead-magnets\/(.+)$/);
      
      if (pathMatch) {
        await supabase.storage.from('lead-magnets').remove([pathMatch[1]]);
      }
      
      onChange('');
      toast.success("Arquivo removido.");
    } catch (error) {
      console.error("Remove error:", error);
      onChange('');
    }
  };

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const fileName = path.split('/').pop() || 'arquivo';
      // Remove the random prefix
      return fileName.replace(/^\d+-[a-z0-9]+-/, '');
    } catch {
      return 'arquivo';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.epub"
        onChange={handleFileChange}
        className="hidden"
        id="lead-magnet-upload"
      />

      {!value ? (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full h-20 border-dashed border-2 flex flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Enviando... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-xs">Clique para enviar arquivo</span>
              </>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            PDF, DOC, DOCX ou EPUB • Máximo 50MB
          </p>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {getFileName(value)}
              </p>
              <p className="text-[10px] text-green-600">Arquivo pronto para download</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                onClick={() => window.open(value, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadMagnetUpload;
