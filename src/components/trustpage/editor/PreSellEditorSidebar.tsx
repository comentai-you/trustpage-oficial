import { PresellContent, PresellButtonAnimation, PresellMediaType, PresellBackgroundType } from "@/types/landing-page";
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
  Video, 
  MousePointer, 
  Palette, 
  Globe, 
  Clock,
  ImageIcon,
  Type,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PUBLIC_PAGES_DOMAIN } from "@/lib/constants";

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
  onContentChange 
}: PreSellEditorSidebarProps) => {
  
  const buttonColorOptions = [
    { name: 'Verde', value: '#22C55E' },
    { name: 'Azul', value: '#2563EB' },
    { name: 'Vermelho', value: '#DC2626' },
    { name: 'Roxo', value: '#9333EA' },
    { name: 'Laranja', value: '#EA580C' },
    { name: 'Amarelo', value: '#EAB308' },
  ];

  const backgroundColorOptions = [
    { name: 'Preto', value: '#000000' },
    { name: 'Cinza Escuro', value: '#1f2937' },
    { name: 'Azul Escuro', value: '#1e3a5f' },
    { name: 'Roxo Escuro', value: '#2d1b69' },
    { name: 'Verde Escuro', value: '#14532d' },
    { name: 'Branco', value: '#FFFFFF' },
  ];

  const textColorOptions = [
    { name: 'Branco', value: '#FFFFFF' },
    { name: 'Preto', value: '#000000' },
    { name: 'Cinza Claro', value: '#f3f4f6' },
    { name: 'Cinza Escuro', value: '#374151' },
  ];

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
        <Accordion type="multiple" defaultValue={["config", "conteudo", "midia", "cta", "aparencia"]} className="w-full">
          
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
                  onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="meu-presell"
                  className="bg-gray-50 border-gray-300 focus:border-primary"
                />
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                  <span className="font-medium">Preview:</span>
                  <span className="text-primary font-mono">{PUBLIC_PAGES_DOMAIN}/p/{slug || 'seu-link'}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção 2: Conteúdo Principal */}
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

          {/* Seção 3: Mídia */}
          <AccordionItem value="midia" className="border-b border-gray-200">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Mídia
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Tipo de Mídia</Label>
                <Select 
                  value={content.mediaType} 
                  onValueChange={(value: PresellMediaType) => onContentChange({ mediaType: value })}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Vídeo
                      </div>
                    </SelectItem>
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

              {content.mediaType !== 'none' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {content.mediaType === 'video' ? 'URL do Vídeo' : 'URL da Imagem'}
                  </Label>
                  <Input
                    value={content.mediaUrl}
                    onChange={(e) => onContentChange({ mediaUrl: e.target.value })}
                    placeholder={content.mediaType === 'video' ? 'https://youtube.com/...' : 'https://...'}
                    className="bg-gray-50 border-gray-300 focus:border-primary"
                  />
                  {content.mediaType === 'video' && (
                    <p className="text-xs text-gray-500">
                      Suporta YouTube, Vimeo e Panda Video
                    </p>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

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
                          ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
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
                      ? 'Botão visível imediatamente' 
                      : `Botão aparece após ${content.ctaDelaySeconds} segundos`}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção 5: Aparência */}
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

              {content.backgroundType === 'solid' ? (
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
                            ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                            : 'border-gray-300 hover:border-gray-400'
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
                    style={{ background: `linear-gradient(135deg, ${content.gradientStart} 0%, ${content.gradientEnd} 100%)` }}
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
                          ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                          : 'border-gray-300 hover:border-gray-400'
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
              <p className="text-xs text-gray-500">
                Adiciona um fundo semi-transparente atrás do conteúdo
              </p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </aside>
  );
};

export default PreSellEditorSidebar;
