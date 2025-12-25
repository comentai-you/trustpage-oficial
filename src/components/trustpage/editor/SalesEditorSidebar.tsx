import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LandingPageFormData, SalesPageContent, Benefit, Testimonial, FAQItem } from "@/types/landing-page";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Palette, Layout, Star, MessageSquare, DollarSign, Upload, Image, Video, X, Loader2, HelpCircle, Plus, Trash2, Images, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import IconSelector from "./IconSelector";
import ThemeSelector, { salesThemes, SalesTheme } from "./ThemeSelector";
import CoverImageUpload from "./CoverImageUpload";

interface SalesEditorSidebarProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
}

const SalesEditorSidebar = ({ formData, onChange }: SalesEditorSidebarProps) => {
  const { user } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCarouselImage, setUploadingCarouselImage] = useState(false);

  const content = formData.content as SalesPageContent;

  // Determine current theme based on colors
  const getCurrentThemeId = (): string => {
    const currentBg = formData.colors.background.toLowerCase();
    const matchedTheme = salesThemes.find(t => t.colors.background.toLowerCase() === currentBg);
    return matchedTheme?.id || 'dark-conversion';
  };

  const [selectedThemeId, setSelectedThemeId] = useState<string>(getCurrentThemeId());

  // Update selectedThemeId when formData changes (e.g., on load)
  useEffect(() => {
    setSelectedThemeId(getCurrentThemeId());
  }, [formData.colors.background]);

  const handleThemeSelect = (theme: SalesTheme) => {
    setSelectedThemeId(theme.id);
    onChange({
      primary_color: theme.colors.primary,
      colors: {
        ...formData.colors,
        background: theme.colors.background,
        text: theme.colors.text,
        buttonBg: theme.colors.primary,
        buttonText: theme.colors.text === '#ffffff' || theme.colors.text === '#f8fafc' ? '#ffffff' : '#ffffff'
      }
    });
  };

  const updateContent = (updates: Partial<SalesPageContent>) => {
    onChange({ content: { ...content, ...updates } });
  };

  const updateBenefit = (index: number, updates: Partial<Benefit>) => {
    const newBenefits = [...content.benefits];
    newBenefits[index] = { ...newBenefits[index], ...updates };
    updateContent({ benefits: newBenefits });
  };

  const updateTestimonial = (index: number, updates: Partial<Testimonial>) => {
    const newTestimonials = [...content.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], ...updates };
    updateContent({ testimonials: newTestimonials });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      if (!user) {
        toast.error("Você precisa estar logado para fazer upload");
        return;
      }
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `product_${uniqueId}.${fileExt}`;
      const filePath = `${user.id}/products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        onChange({ image_url: data.publicUrl });
        toast.success("Imagem enviada com sucesso!");
      } else {
        throw new Error("Falha ao obter URL pública");
      }
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 2MB for avatars)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("O avatar deve ter no máximo 2MB");
      return;
    }

    setUploadingAvatar(index);
    try {
      if (!user) {
        toast.error("Você precisa estar logado para fazer upload");
        return;
      }
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `avatar_${uniqueId}.${fileExt}`;
      const filePath = `${user.id}/avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        updateTestimonial(index, { avatarUrl: data.publicUrl });
        toast.success("Avatar enviado!");
      } else {
        throw new Error("Falha ao obter URL pública");
      }
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error("Erro ao enviar avatar. Tente novamente.");
    } finally {
      setUploadingAvatar(null);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleCarouselImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingCarouselImage(true);
    try {
      if (!user) {
        toast.error("Você precisa estar logado para fazer upload");
        return;
      }
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `carousel_${uniqueId}.${fileExt}`;
      const filePath = `${user.id}/carousel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Carousel upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        const currentImages = content.carouselImages || [];
        updateContent({ carouselImages: [...currentImages, data.publicUrl] });
        toast.success("Imagem adicionada ao carrossel!");
      } else {
        throw new Error("Falha ao obter URL pública");
      }
    } catch (error) {
      console.error('Error uploading carousel image:', error);
      toast.error("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploadingCarouselImage(false);
      e.target.value = '';
    }
  };

  const removeCarouselImage = (index: number) => {
    const currentImages = content.carouselImages || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    updateContent({ carouselImages: newImages });
    toast.success("Imagem removida do carrossel");
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Editor de Página de Vendas</h2>
        <p className="text-sm text-gray-500">Personalize sua página</p>
      </div>

      <Accordion type="multiple" defaultValue={["appearance", "hero", "benefits"]} className="w-full">
        {/* Settings - Cover Image */}
        <AccordionItem value="settings">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Settings className="w-4 h-4 text-primary" />
              Configurações
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <CoverImageUpload 
              coverImageUrl={formData.cover_image_url || ''} 
              onChange={(url) => onChange({ cover_image_url: url })} 
            />
          </AccordionContent>
        </AccordionItem>

        {/* Appearance */}
        <AccordionItem value="appearance">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4 text-primary" />
              Aparência
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Nome da Página</Label>
              <Input
                value={formData.page_name}
                onChange={(e) => onChange({ page_name: e.target.value })}
                placeholder="Minha Página de Vendas"
                className="text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Tema Profissional</Label>
              <ThemeSelector
                selectedThemeId={selectedThemeId}
                onSelectTheme={handleThemeSelect}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Hero Section */}
        <AccordionItem value="hero">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layout className="w-4 h-4 text-primary" />
              Topo (Hero)
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            {/* Scarcity Bar Toggle */}
            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium text-orange-800">Barra de Escassez</Label>
                <Switch
                  checked={content.scarcityEnabled ?? false}
                  onCheckedChange={(checked) => updateContent({ scarcityEnabled: checked })}
                />
              </div>
              {content.scarcityEnabled && (
                <Input
                  value={content.scarcityText || '🔥 Oferta por tempo limitado!'}
                  onChange={(e) => updateContent({ scarcityText: e.target.value })}
                  placeholder="Texto da barra de escassez"
                  className="text-sm mt-2"
                />
              )}
              <p className="text-xs text-orange-600 mt-1">Aumenta urgência e conversões</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Headline Principal</Label>
              <Textarea
                value={formData.headline}
                onChange={(e) => onChange({ headline: e.target.value })}
                placeholder="Transforme sua vida hoje mesmo"
                className="text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Subheadline</Label>
              <Textarea
                value={formData.subheadline}
                onChange={(e) => onChange({ subheadline: e.target.value })}
                placeholder="Descubra o método que já ajudou milhares..."
                className="text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-gray-600">Mídia Principal</Label>
              
              {/* Pro tip about video */}
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <span className="text-base">🎬</span>
                  <div>
                    <p className="text-xs font-semibold text-green-800">Dica de conversão</p>
                    <p className="text-[11px] text-green-700 mt-0.5">
                      Vídeos convertem até <span className="font-bold">3x mais</span> que imagens! 
                      Prefira hospedar no <span className="font-bold">Vimeo</span> para uma experiência mais profissional e sem distrações.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Imagem</span>
                </div>
                <Switch
                  checked={content.heroMediaType === 'video'}
                  onCheckedChange={(checked) => updateContent({ 
                    heroMediaType: checked ? 'video' : 'image' 
                  })}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm">Vídeo</span>
                  <Video className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              {content.heroMediaType === 'video' ? (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">URL do Vídeo (YouTube/Vimeo)</Label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => onChange({ video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Single image or Carousel toggle */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <Images className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-800">Modo Carrossel</span>
                    </div>
                    <Switch
                      checked={content.carouselEnabled ?? false}
                      onCheckedChange={(checked) => updateContent({ carouselEnabled: checked })}
                    />
                  </div>

                  {content.carouselEnabled ? (
                    <div className="space-y-3">
                      {/* Carousel interval slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-600">Intervalo (segundos)</Label>
                          <span className="text-xs font-medium text-primary">{content.carouselInterval || 4}s</span>
                        </div>
                        <Slider
                          value={[content.carouselInterval || 4]}
                          onValueChange={([value]) => updateContent({ carouselInterval: value })}
                          min={2}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Carousel images grid */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Imagens do Carrossel ({(content.carouselImages || []).length})</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {(content.carouselImages || []).map((img, index) => (
                            <div key={index} className="relative aspect-square">
                              <img 
                                src={img} 
                                alt={`Carrossel ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeCarouselImage(index)}
                                className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-md"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          
                          {/* Add image button */}
                          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors">
                            {uploadingCarouselImage ? (
                              <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-5 h-5 text-gray-400" />
                                <span className="text-[10px] text-gray-400 mt-1">Adicionar</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCarouselImageUpload}
                              className="hidden"
                              disabled={uploadingCarouselImage}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-400">Adicione 2 ou mais imagens para ativar o carrossel automático</p>
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700 font-medium">📐 Tamanho ideal: 800x600px (4:3)</p>
                          <p className="text-[10px] text-blue-600 mt-0.5">Use imagens com mesma proporção para melhor resultado</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Imagem do Produto</Label>
                      {formData.image_url ? (
                        <div className="relative">
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => onChange({ image_url: '' })}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">
                            {uploadingImage ? 'Enviando...' : 'Clique para enviar'}
                          </span>
                          <span className="text-[10px] text-primary/70 font-medium mt-1">Recomendado: 800x600px</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Texto do Botão</Label>
              <Input
                value={formData.cta_text}
                onChange={(e) => onChange({ cta_text: e.target.value })}
                placeholder="QUERO AGORA"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Link do Botão</Label>
              <Input
                value={formData.cta_url}
                onChange={(e) => onChange({ cta_url: e.target.value })}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Benefits */}
        <AccordionItem value="benefits">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Star className="w-4 h-4 text-primary" />
              Benefícios
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-700">
                    Benefício {index + 1}
                  </Label>
                  <div className="flex items-center gap-2">
                    <IconSelector
                      value={benefit.icon || "Sparkles"}
                      onChange={(icon) => updateBenefit(index, { icon })}
                      primaryColor={formData.primary_color}
                    />
                  </div>
                </div>
                <Input
                  value={benefit.title}
                  onChange={(e) => updateBenefit(index, { title: e.target.value })}
                  placeholder="Título do benefício"
                  className="text-sm"
                />
                <Textarea
                  value={benefit.description}
                  onChange={(e) => updateBenefit(index, { description: e.target.value })}
                  placeholder="Descrição breve..."
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Testimonials */}
        <AccordionItem value="testimonials">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4 text-primary" />
              Prova Social
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            {content.testimonials.map((testimonial, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-3">
                <Label className="text-xs font-medium text-gray-700">
                  Depoimento {index + 1}
                </Label>
                
                <div className="flex items-center gap-3">
                  {testimonial.avatarUrl ? (
                    <div className="relative">
                      <img 
                        src={testimonial.avatarUrl} 
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <button
                        onClick={() => updateTestimonial(index, { avatarUrl: '' })}
                        className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <label className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300">
                        {uploadingAvatar === index ? (
                          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          <Upload className="w-4 h-4 text-gray-500" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAvatarUpload(e, index)}
                          className="hidden"
                          disabled={uploadingAvatar !== null}
                        />
                      </label>
                      <span className="text-[10px] text-primary/70 font-medium">200x200px</span>
                    </div>
                  )}
                  <Input
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(index, { name: e.target.value })}
                    placeholder="Nome do cliente"
                    className="text-sm flex-1"
                  />
                </div>
                
                <Textarea
                  value={testimonial.text}
                  onChange={(e) => updateTestimonial(index, { text: e.target.value })}
                  placeholder="O que o cliente disse..."
                  className="text-sm resize-none"
                  rows={3}
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Pricing */}
        <AccordionItem value="pricing">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4 text-primary" />
              Oferta Final
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Título da Seção</Label>
              <Input
                value={content.offerTitle || 'Oferta Especial'}
                onChange={(e) => updateContent({ offerTitle: e.target.value })}
                placeholder="Oferta Especial"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Preço DE (riscado)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <Input
                    value={content.priceFrom}
                    onChange={(e) => updateContent({ priceFrom: e.target.value })}
                    placeholder="197"
                    className="text-sm pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Preço POR (destaque)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <Input
                    value={content.priceTo}
                    onChange={(e) => updateContent({ priceTo: e.target.value })}
                    placeholder="97"
                    className="text-sm pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Texto antes do preço</Label>
              <Input
                value={content.offerSubtitle || 'Por apenas'}
                onChange={(e) => updateContent({ offerSubtitle: e.target.value })}
                placeholder="Por apenas"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Lista de Benefícios (um por linha)</Label>
              <Textarea
                value={(content.offerFeatures || []).join('\n')}
                onChange={(e) => updateContent({ 
                  offerFeatures: e.target.value.split('\n').filter(f => f.trim()) 
                })}
                placeholder="Acesso imediato ao conteúdo&#10;Suporte exclusivo VIP&#10;Bônus especiais inclusos"
                className="text-sm resize-none"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Texto da Garantia</Label>
              <Input
                value={content.guaranteeText}
                onChange={(e) => updateContent({ guaranteeText: e.target.value })}
                placeholder="7 dias de garantia incondicional"
                className="text-sm"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* FAQ */}
        <AccordionItem value="faq">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HelpCircle className="w-4 h-4 text-primary" />
              FAQ
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs font-medium text-gray-700">Mostrar seção FAQ</Label>
              <Switch
                checked={content.faqEnabled ?? false}
                onCheckedChange={(checked) => updateContent({ faqEnabled: checked })}
              />
            </div>

            {content.faqEnabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Título da Seção</Label>
                  <Input
                    value={content.faqTitle || 'Perguntas Frequentes'}
                    onChange={(e) => updateContent({ faqTitle: e.target.value })}
                    placeholder="Perguntas Frequentes"
                    className="text-sm"
                  />
                </div>

                {(content.faqItems || []).map((faq, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-gray-700">
                        Pergunta {index + 1}
                      </Label>
                      <button
                        onClick={() => {
                          const newFaqs = [...(content.faqItems || [])];
                          newFaqs.splice(index, 1);
                          updateContent({ faqItems: newFaqs });
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...(content.faqItems || [])];
                        newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                        updateContent({ faqItems: newFaqs });
                      }}
                      placeholder="Qual é a pergunta?"
                      className="text-sm"
                    />
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...(content.faqItems || [])];
                        newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                        updateContent({ faqItems: newFaqs });
                      }}
                      placeholder="Resposta..."
                      className="text-sm resize-none"
                      rows={2}
                    />
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const newFaqs = [...(content.faqItems || []), { question: '', answer: '' }];
                    updateContent({ faqItems: newFaqs });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default SalesEditorSidebar;
