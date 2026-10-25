import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  value?: string;
  onChange: (url: string) => void;
}

export default function ShareImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Selecione uma imagem JPG, PNG ou WebP.");
      return;
    }
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Entre na sua conta para enviar a imagem.");
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Não foi possível preparar a imagem.");
      const scale = Math.max(1200 / bitmap.width, 630 / bitmap.height);
      context.drawImage(bitmap, (1200 - bitmap.width * scale) / 2, (630 - bitmap.height * scale) / 2, bitmap.width * scale, bitmap.height * scale);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("Não foi possível preparar a imagem.")), 'image/jpeg', 0.8
      ));
      const path = `${session.user.id}/share-${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from('uploads').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Imagem de compartilhamento enviada!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Imagem do link no WhatsApp</Label>
      <input ref={inputRef} aria-label="Enviar imagem do link no WhatsApp" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} />
      {value && <div className="relative aspect-[1200/630] overflow-hidden rounded-md border border-border">
        <img src={value} alt="Imagem de compartilhamento" className="h-full w-full object-cover" />
        <Button type="button" variant="destructive" size="icon" className="absolute right-2 top-2 h-7 w-7" aria-label="Remover imagem de compartilhamento" disabled={uploading} onClick={() => onChange('')}><X className="h-4 w-4" /></Button>
      </div>}
      <Button type="button" variant="outline" className="w-full" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
        {value ? 'Trocar imagem' : 'Adicionar imagem'}
      </Button>
    </div>
  );
}