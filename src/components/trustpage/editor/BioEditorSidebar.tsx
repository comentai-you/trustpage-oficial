import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LandingPageFormData, BioLinkContent, BioLink, defaultBioContent } from "@/types/landing-page";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { User, Share2, Link2, Palette, Upload, X, Loader2, Plus, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSelector, { salesThemes, SalesTheme } from "./ThemeSelector";

interface BioEditorSidebarProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
}

const BioEditorSidebar = ({ formData, onChange }: BioEditorSidebarProps) => {
  const { user } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState<string | null>(null);

  const content: BioLinkContent = (formData.content as BioLinkContent) || defaultBioContent;

  const updateContent = (updates: Partial<BioLinkContent>) => {
    onChange({ content: { ...content, ...updates } });
  };

  const updateLink = (id: string, updates: Partial<BioLink>) => {
    const newLinks = content.links.map(link => 
      link.id === id ? { ...link, ...updates } : link
    );
    updateContent({ links: newLinks });
  };

  const addLink = () => {
    const newLink: BioLink = {
      id: Date.now().toString(),
      text: 'Novo Link',
      url: '',
      isHighlighted: false
    };
    updateContent({ links: [...content.links, newLink] });
  };

  const removeLink = (id: string) => {
    updateContent({ links: content.links.filter(l => l.id !== id) });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error("Selecione uma imagem"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Máximo 2MB"); return; }

    setUploadingAvatar(true);
    try {
      const filePath = `${user.id}/bio/avatar_${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('uploads').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      if (data?.publicUrl) updateContent({ avatarUrl: data.publicUrl });
      toast.success("Avatar enviado!");
    } catch { toast.error("Erro no upload"); }
    finally { setUploadingAvatar(false); e.target.value = ''; }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, linkId: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error("Selecione uma imagem"); return; }
    if (file.size > 1 * 1024 * 1024) { toast.error("Máximo 1MB"); return; }

    setUploadingThumbnail(linkId);
    try {
      const filePath = `${user.id}/bio/thumb_${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('uploads').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      if (data?.publicUrl) updateLink(linkId, { thumbnailUrl: data.publicUrl });
      toast.success("Miniatura enviada!");
    } catch { toast.error("Erro no upload"); }
    finally { setUploadingThumbnail(null); e.target.value = ''; }
  };

  const handleThemeSelect = (theme: SalesTheme) => {
    onChange({
      primary_color: theme.colors.primary,
      colors: { ...formData.colors, background: theme.colors.background, text: theme.colors.text, buttonBg: theme.colors.primary }
    });
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Editor Bio Link</h2>
        <p className="text-sm text-gray-500">Crie seu agregador de links</p>
      </div>

      <Accordion type="multiple" defaultValue={["profile", "social", "links"]} className="w-full">
        {/* Profile */}
        <AccordionItem value="profile">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium"><User className="w-4 h-4 text-primary" />Perfil</div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Nome da Página</Label>
              <Input value={formData.page_name} onChange={(e) => onChange({ page_name: e.target.value })} placeholder="Meu Bio Link" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Avatar</Label>
              <div className="flex items-center gap-3">
                {content.avatarUrl ? (
                  <div className="relative">
                    <img src={content.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                    <button onClick={() => updateContent({ avatarUrl: '' })} className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary">
                    {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-gray-400" />}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Nome do Perfil</Label>
              <Input value={content.profileName} onChange={(e) => updateContent({ profileName: e.target.value })} placeholder="@seuperfil" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Bio</Label>
              <Textarea value={content.bio} onChange={(e) => updateContent({ bio: e.target.value })} placeholder="Sua descrição..." rows={3} className="text-sm resize-none" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Social */}
        <AccordionItem value="social">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium"><Share2 className="w-4 h-4 text-primary" />Redes Sociais</div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            {(['instagram', 'whatsapp', 'tiktok', 'youtube', 'linkedin'] as const).map(network => (
              <div key={network} className="space-y-1">
                <Label className="text-xs text-gray-600 capitalize">{network}</Label>
                <Input 
                  value={content.socialLinks[network] || ''} 
                  onChange={(e) => updateContent({ socialLinks: { ...content.socialLinks, [network]: e.target.value } })} 
                  placeholder={network === 'whatsapp' ? '5511999999999' : `@seu${network}`} 
                  className="text-sm" 
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Links */}
        <AccordionItem value="links">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium"><Link2 className="w-4 h-4 text-primary" />Links ({content.links.length})</div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            {content.links.map((link) => (
              <div key={link.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Link</span>
                  <button onClick={() => removeLink(link.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
                <Input value={link.text} onChange={(e) => updateLink(link.id, { text: e.target.value })} placeholder="Texto do botão" className="text-sm" />
                <Input value={link.url} onChange={(e) => updateLink(link.id, { url: e.target.value })} placeholder="https://..." className="text-sm" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs">Destacar</span>
                  </div>
                  <Switch checked={link.isHighlighted || false} onCheckedChange={(checked) => updateLink(link.id, { isHighlighted: checked })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Miniatura (40x40)</Label>
                  {link.thumbnailUrl ? (
                    <div className="relative w-10 h-10">
                      <img src={link.thumbnailUrl} className="w-full h-full object-cover rounded" />
                      <button onClick={() => updateLink(link.id, { thumbnailUrl: '' })} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full text-white"><X className="w-2 h-2" /></button>
                    </div>
                  ) : (
                    <label className="w-10 h-10 border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary">
                      {uploadingThumbnail === link.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 text-gray-400" />}
                      <input type="file" accept="image/*" onChange={(e) => handleThumbnailUpload(e, link.id)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addLink} className="w-full gap-2"><Plus className="w-4 h-4" />Adicionar Link</Button>
          </AccordionContent>
        </AccordionItem>

        {/* Appearance */}
        <AccordionItem value="appearance">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium"><Palette className="w-4 h-4 text-primary" />Aparência</div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ThemeSelector selectedThemeId={salesThemes.find(t => t.colors.background === formData.colors.background)?.id || 'dark-conversion'} onSelectTheme={handleThemeSelect} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default BioEditorSidebar;
