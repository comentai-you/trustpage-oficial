import { useState } from "react";
import {
  PresellContent,
  PresellButtonAnimation,
  PresellMediaType,
  PresellBackgroundType,
  PresellButtonSize,
  PresellLayoutType,
  CookieCardPosition,
  CookieCardTheme,
} from "@/types/landing-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  Monitor,
  Layers,
  Settings,
  FileText,
  MousePointer,
  Palette,
  Globe,
  Clock,
  ImageIcon,
  Type,
  Sparkles,
  Upload,
  X,
  Loader2,
  Cookie,
  LayoutTemplate,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PUBLIC_PAGES_DOMAIN } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PreSellEditorSidebarProps {
  pageName: string;
  slug: string;
  content: PresellContent;
  onPageNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  onContentChange: (content: Partial<PresellContent>) => void;
}

const PreSellEditorSidebar = ({
  pageName,
  slug,
  content,
  onPageNameChange,
  onSlugChange,
  onContentChange,
}: PreSellEditorSidebarProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const isCookieWall = content.layoutType === "cookie-wall";

  const buttonColorOptions = [
    { name: "Verde", value: "#22C55E" },
    { name: "Azul", value: "#2563EB" },
    { name: "Vermelho", value: "#DC2626" },
    { name: "Roxo", value: "#9333EA" },
    { name: "Laranja", value: "#EA580C" },
    { name: "Amarelo", value: "#EAB308" },
  ];

  const backgroundColorOptions = [
    { name: "Preto", value: "#000000" },
    { name: "Cinza Escuro", value: "#1f2937" },
    { name: "Azul Escuro", value: "#1e3a5f" },
    { name: "Roxo Escuro", value: "#2d1b69" },
    { name: "Verde Escuro", value: "#14532d" },
    { name: "Branco", value: "#FFFFFF" },
  ];

  const textColorOptions = [
    { name: "Branco", value: "#FFFFFF" },
    { name: "Preto", value: "#000000" },
    { name: "Cinza Claro", value: "#f3f4f6" },
    { name: "Cinza Escuro", value: "#374151" },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/presell/media_${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("uploads").upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
      if (data?.publicUrl) {
        onContentChange({ mediaUrl: data.publicUrl });
        toast.success("Imagem enviada com sucesso!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDesktopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingDesktop(true);
    try {
      const filePath = `${user.id}/presell/bg_desktop_${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("uploads").upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
      if (data?.publicUrl) {
        onContentChange({ cookieBackgroundImageDesktop: data.publicUrl });
        toast.success("Imagem Desktop enviada!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingDesktop(false);
      e.target.value = "";
    }
  };

  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingMobile(true);
    try {
      const filePath = `${user.id}/presell/bg_mobile_${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("uploads").upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
      if (data?.publicUrl) {
        onContentChange({ cookieBackgroundImageMobile: data.publicUrl });
        toast.success("Imagem Mobile enviada!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingMobile(false);
      e.target.value = "";
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Navigation Icons */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="w-10 h-10 rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
            <Layers className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Pre-sell Anti-Bloqueio
          </h2>
          <p className="text-xs text-gray-500 mt-1">Página de redirecionamento segura</p>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          defaultValue={["layout", "config", "conteudo", "midia", "cta", "aparencia", "cookie-config"]}
          className="w-full"
        >
          {/* Seção 0: Tipo de Layout */}
          <AccordionItem value="layout" className="border-b border-gray-200">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-primary" />
                Tipo de Página
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onContentChange({ layoutType: "default" })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    content.layoutType !== "cookie-wall"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm font-medium">Padrão</span>
                  <p className="text-xs text-gray-500 mt-1">Editor livre</p>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onContentChange({
                      layoutType: "cookie-wall",
                      headline: "Aviso de Privacidade",
                      ctaText: "Aceitar e Continuar",
                      ctaColor: "#22C55E",
                    })
                  }
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    content.layoutType === "cookie-wall"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Cookie className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm font-medium">Cookie Wall</span>
                  <p className="text-xs text-gray-500 mt-1">Estilo LGPD</p>
                </button>
              </div>
              {isCookieWall && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>💡 Dica:</strong> Faça um print da página de vendas e envie como fundo. O card de cookies
                    ficará sobre a imagem borrada.
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Seção 1: Configurações */}
          <AccordionItem value="config" className="border-b border-gray-200">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Configurações
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nome da Página</Label>
                <Input
                  value={pageName}
                  onChange={(e) => onPageNameChange(e.target.value)}
                  placeholder="Minha Pre-sell"
                  className="bg-gray-50 border-gray-300 focus:border-primary"
                />
                <p className="text-xs text-gray-500">Nome interno para organização</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nome do Link (Slug)</Label>
                <Input
                  value={slug}
                  onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="meu-presell"
                  className="bg-gray-50 border-gray-300 focus:border-primary"
                />
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                  <span className="font-medium">Preview:</span>
                  <span className="text-primary font-mono">
                    {PUBLIC_PAGES_DOMAIN}/p/{slug || "seu-link"}
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção 2: Conteúdo Principal - só aparece no modo Padrão */}
          {!isCookieWall && (
            <AccordionItem value="conteudo" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Conteúdo Principal
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Headline (H1)
                  </Label>
                  <Textarea
                    value={content.headline}
                    onChange={(e) => onContentChange({ headline: e.target.value })}
                    placeholder="Assista ao Vídeo Exclusivo"
                    className="bg-gray-50 border-gray-300 focus:border-primary min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Subheadline (H2)</Label>
                  <Textarea
                    value={content.subheadline}
                    onChange={(e) => onContentChange({ subheadline: e.target.value })}
                    placeholder="Descubra o método que está transformando vidas"
                    className="bg-gray-50 border-gray-300 focus:border-primary min-h-[60px] resize-none"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Seção 3: Mídia - só aparece no modo Padrão */}
          {!isCookieWall && (
            <AccordionItem value="midia" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Mídia
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tipo de Mídia</Label>
                  <Select
                    value={content.mediaType === "video" ? "image" : content.mediaType}
                    onValueChange={(value: PresellMediaType) => onContentChange({ mediaType: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Imagem
                        </div>
                      </SelectItem>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Nenhum
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {content.mediaType === "video" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">URL do Vídeo</Label>
                    <Input
                      value={content.mediaUrl}
                      onChange={(e) => onContentChange({ mediaUrl: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="bg-gray-50 border-gray-300 focus:border-primary"
                    />
                    <p className="text-xs text-gray-500">Suporta YouTube, Vimeo e Panda Video</p>
                  </div>
                )}

                {content.mediaType === "image" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Imagem</Label>

                    {content.mediaUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <img src={content.mediaUrl} alt="Mídia" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => onContentChange({ mediaUrl: "" })}
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
                          <div className="flex flex-col items-center gap-2 p-4">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500 text-center">Clique para enviar</span>
                            <span className="text-xs text-gray-400">PNG, JPG até 5MB</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Seção 4: Botão de Ação (CTA) */}
          <AccordionItem value="cta" className="border-b border-gray-200">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-primary" />
                Botão de Ação (CTA)
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Texto do Botão</Label>
                <Input
                  value={content.ctaText}
                  onChange={(e) => onContentChange({ ctaText: e.target.value })}
                  placeholder="ACESSAR O VÍDEO"
                  className="bg-gray-50 border-gray-300 focus:border-primary font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Link de Destino</Label>
                <Input
                  value={content.ctaUrl}
                  onChange={(e) => onContentChange({ ctaUrl: e.target.value })}
                  placeholder="https://seu-link-de-afiliado.com"
                  className="bg-gray-50 border-gray-300 focus:border-primary"
                />
                <p className="text-xs text-gray-500">Link de afiliado ou checkout</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Cor do Botão</Label>
                <div className="flex flex-wrap gap-2">
                  {buttonColorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => onContentChange({ ctaColor: color.value })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        content.ctaColor === color.value
                          ? "border-gray-900 ring-2 ring-offset-2 ring-gray-400"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Tamanho do Botão</Label>
                <Select
                  value={content.ctaSize || "large"}
                  onValueChange={(value: PresellButtonSize) => onContentChange({ ctaSize: value })}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Animação</Label>
                <Select
                  value={content.ctaAnimation}
                  onValueChange={(value: PresellButtonAnimation) => onContentChange({ ctaAnimation: value })}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pulse">Pulsar</SelectItem>
                    <SelectItem value="shake">Tremer</SelectItem>
                    <SelectItem value="none">Nenhuma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-medium text-gray-700">Delay (Timer)</Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Segundos para exibir</span>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {content.ctaDelaySeconds}s
                    </span>
                  </div>
                  <Slider
                    value={[content.ctaDelaySeconds]}
                    onValueChange={(value) => onContentChange({ ctaDelaySeconds: value[0] })}
                    min={0}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    {content.ctaDelaySeconds === 0
                      ? "Botão visível imediatamente"
                      : `Botão aparece após ${content.ctaDelaySeconds} segundos`}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção 5: Aparência - só aparece no modo Padrão */}
          {!isCookieWall && (
            <AccordionItem value="aparencia" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Estilo (Aparência)
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tipo de Fundo</Label>
                  <Select
                    value={content.backgroundType}
                    onValueChange={(value: PresellBackgroundType) => onContentChange({ backgroundType: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Cor Sólida</SelectItem>
                      <SelectItem value="gradient">Gradiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {content.backgroundType === "solid" ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Cor de Fundo</Label>
                    <div className="flex flex-wrap gap-2">
                      {backgroundColorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => onContentChange({ backgroundColor: color.value })}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            content.backgroundColor === color.value
                              ? "border-gray-900 ring-2 ring-offset-2 ring-gray-400"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Label className="text-xs text-gray-500">Custom:</Label>
                      <input
                        type="color"
                        value={content.backgroundColor}
                        onChange={(e) => onContentChange({ backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Cor Inicial</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.gradientStart}
                          onChange={(e) => onContentChange({ gradientStart: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-500">{content.gradientStart}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Cor Final</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.gradientEnd}
                          onChange={(e) => onContentChange({ gradientEnd: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-500">{content.gradientEnd}</span>
                      </div>
                    </div>
                    <div
                      className="h-8 rounded-md border"
                      style={{
                        background: `linear-gradient(135deg, ${content.gradientStart} 0%, ${content.gradientEnd} 100%)`,
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Cor do Texto</Label>
                  <div className="flex flex-wrap gap-2">
                    {textColorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => onContentChange({ textColor: color.value })}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          content.textColor === color.value
                            ? "border-gray-900 ring-2 ring-offset-2 ring-gray-400"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium text-gray-700">Estilo Card (Caixa)</Label>
                  </div>
                  <Switch
                    checked={content.cardStyleEnabled}
                    onCheckedChange={(checked) => onContentChange({ cardStyleEnabled: checked })}
                  />
                </div>
                <p className="text-xs text-gray-500">Adiciona um fundo semi-transparente atrás do conteúdo</p>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Seção Cookie Wall Config - só aparece se layoutType === 'cookie-wall' */}
          {isCookieWall && (
            <AccordionItem value="cookie-config" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Cookie className="w-4 h-4 text-primary" />
                  Configuração Cookie Wall
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-5">
                {/* Upload Desktop */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium text-gray-700">Print Desktop (PC)</Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Recomendado: <strong>1920x1080px</strong> (proporção 16:9)
                  </p>

                  {content.cookieBackgroundImageDesktop ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={content.cookieBackgroundImageDesktop}
                        alt="Fundo Desktop"
                        className="w-full h-full object-cover blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => onContentChange({ cookieBackgroundImageDesktop: "" })}
                        // ADICIONEI z-20 AQUI NO INÍCIO DA CLASSE 👇
                        className="z-20 absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs bg-black/60 text-white px-3 py-1 rounded-full">
                          ✓ Desktop configurado
                        </span>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      {uploadingDesktop ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm text-gray-500">Enviando...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-4">
                          <Monitor className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-500 text-center">Enviar print Desktop</span>
                          <span className="text-xs text-primary font-medium">1920x1080px</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDesktopImageUpload}
                        className="hidden"
                        disabled={uploadingDesktop}
                      />
                    </label>
                  )}
                </div>

                {/* Upload Mobile */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium text-gray-700">Print Mobile (Celular)</Label>
                    </div>
                    <div className="group relative">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full cursor-help">?</span>
                      <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <strong>💡 Dica:</strong> Abra o site do produto no seu celular, tire um print da primeira dobra
                        e envie aqui. Isso aumenta a conversão em 30%!
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Recomendado: <strong>1080x1920px</strong> (proporção 9:16)
                  </p>

                  {content.cookieBackgroundImageMobile ? (
                    <div className="relative w-full max-w-[180px] aspect-[9/16] rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={content.cookieBackgroundImageMobile}
                        alt="Fundo Mobile"
                        className="w-full h-full object-cover blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => onContentChange({ cookieBackgroundImageMobile: "" })}
                        // ADICIONEI z-20 AQUI TAMBÉM 👇
                        className="z-20 absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-full text-center">
                          ✓ Mobile
                        </span>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full max-w-[180px] aspect-[9/16] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      {uploadingMobile ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="text-xs text-gray-500">Enviando...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-3">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 text-center">Print Mobile</span>
                          <span className="text-xs text-primary font-medium">1080x1920</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMobileImageUpload}
                        className="hidden"
                        disabled={uploadingMobile}
                      />
                    </label>
                  )}

                  {/* Alerta se só tem desktop */}
                  {content.cookieBackgroundImageDesktop && !content.cookieBackgroundImageMobile && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800">
                        <strong>⚠️ Atenção:</strong> Para melhor resultado em celulares, adicione também a versão
                        mobile.
                      </p>
                    </div>
                  )}
                </div>

                {/* Posição do Card */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Posição do Aviso</Label>
                  <Select
                    value={content.cookieCardPosition || "center"}
                    onValueChange={(value: CookieCardPosition) => onContentChange({ cookieCardPosition: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Centralizado (Modal)</SelectItem>
                      <SelectItem value="bottom">Rodapé (Banner)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tema do Card */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Estilo do Card</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onContentChange({ cookieCardTheme: "light" })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        content.cookieCardTheme !== "dark"
                          ? "border-primary bg-white ring-2 ring-primary/20"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">Claro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onContentChange({ cookieCardTheme: "dark" })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        content.cookieCardTheme === "dark"
                          ? "border-primary bg-gray-800 ring-2 ring-primary/20"
                          : "border-gray-200 bg-gray-800 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-sm font-medium text-white">Escuro</span>
                    </button>
                  </div>
                </div>

                {/* Texto do Corpo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Texto do Aviso</Label>
                  <Textarea
                    value={content.cookieBodyText || ""}
                    onChange={(e) => onContentChange({ cookieBodyText: e.target.value })}
                    placeholder="Este site utiliza cookies..."
                    className="bg-gray-50 border-gray-300 focus:border-primary min-h-[80px] resize-none"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </aside>
  );
};

export default PreSellEditorSidebar;
