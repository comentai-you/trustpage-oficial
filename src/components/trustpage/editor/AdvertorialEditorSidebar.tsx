import { useState } from "react";
import {
  AdvertorialContent,
  AdvertorialTheme,
  FakeComment,
  ComparisonProduct,
} from "@/types/advertorial";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import AdvertorialRichEditor from "@/components/trustpage/editor/AdvertorialRichEditor";
import { Button } from "@/components/ui/button";
import {
  Home,
  Type,
  ImageIcon,
  Palette,
  MessageCircle,
  RotateCcw,
  AlertTriangle,
  Star,
  Plus,
  Trash2,
  Newspaper,
  BookOpen,
  Monitor,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PUBLIC_PAGES_DOMAIN } from "@/lib/constants";
import ImageUpload from "@/components/trustpage/ImageUpload";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AdvertorialEditorSidebarProps {
  pageName: string;
  slug: string;
  content: AdvertorialContent;
  onPageNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  onContentChange: (content: Partial<AdvertorialContent>) => void;
}

const themeOptions: { id: AdvertorialTheme; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'portal-news', label: 'Portal News', icon: <Newspaper className="w-4 h-4" />, desc: 'Estilo G1/CNN' },
  { id: 'story-blog', label: 'Story Blog', icon: <BookOpen className="w-4 h-4" />, desc: 'Estilo Medium' },
  { id: 'review-tech', label: 'Review Tech', icon: <Monitor className="w-4 h-4" />, desc: 'Comparativo' },
];

const AdvertorialEditorSidebar = ({
  pageName,
  slug,
  content,
  onPageNameChange,
  onSlugChange,
  onContentChange,
}: AdvertorialEditorSidebarProps) => {
  const [showLogoWarning, setShowLogoWarning] = useState(false);

  const updateComment = (index: number, updates: Partial<FakeComment>) => {
    const newComments = [...content.fakeComments];
    newComments[index] = { ...newComments[index], ...updates };
    onContentChange({ fakeComments: newComments });
  };

  const addComment = () => {
    onContentChange({
      fakeComments: [
        ...content.fakeComments,
        { name: 'Novo Usuário', text: 'Ótimo artigo!', timeAgo: '1 hora', likes: 12 },
      ],
    });
  };

  const removeComment = (index: number) => {
    onContentChange({ fakeComments: content.fakeComments.filter((_, i) => i !== index) });
  };

  const updateProduct = (index: number, updates: Partial<ComparisonProduct>) => {
    const newProducts = [...content.comparisonProducts];
    newProducts[index] = { ...newProducts[index], ...updates };
    onContentChange({ comparisonProducts: newProducts });
  };

  return (
    <div className="w-full lg:w-80 h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Back link */}
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <Home className="w-4 h-4" /> Dashboard
        </Link>

        <Accordion type="multiple" defaultValue={["page", "theme", "content", "images"]} className="space-y-1">
          {/* Page Settings */}
          <AccordionItem value="page" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-semibold py-3">
              <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Configurações</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div>
                <Label className="text-xs">Nome da Página</Label>
                <Input value={pageName} onChange={(e) => onPageNameChange(e.target.value)} placeholder="Meu advertorial" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">URL (slug)</Label>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400 whitespace-nowrap">{PUBLIC_PAGES_DOMAIN}/p/</span>
                  <Input value={slug} onChange={(e) => onSlugChange(e.target.value)} placeholder="meu-artigo" className="flex-1" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Theme Selector */}
          <AccordionItem value="theme" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-semibold py-3">
              <span className="flex items-center gap-2"><Palette className="w-4 h-4" /> Tema (Layout)</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pb-4">
              {themeOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onContentChange({ theme: t.id })}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    content.theme === t.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${content.theme === t.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-gray-400">{t.desc}</p>
                  </div>
                </button>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Theme Customization */}
          <AccordionItem value="customization" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-semibold py-3">
              <span className="flex items-center gap-2"><Palette className="w-4 h-4" /> Personalizar Cores</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              {/* Presets */}
              <div>
                <Label className="text-xs mb-2 block">Estilos Prontos</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'default', label: 'Padrão', colors: ['#FFFFFF', '#111827', '#DC2626'] },
                    { id: 'dark', label: 'Dark', colors: ['#1F2937', '#F9FAFB', '#3B82F6'] },
                    { id: 'warm', label: 'Warm', colors: ['#FFFBEB', '#78350F', '#D97706'] },
                    { id: 'ocean', label: 'Ocean', colors: ['#F0F9FF', '#0C4A6E', '#0EA5E9'] },
                    { id: 'forest', label: 'Forest', colors: ['#F0FDF4', '#14532D', '#22C55E'] },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        const presets: Record<string, Partial<typeof content>> = {
                          default: { themePreset: 'default', headlineColor: '#111827', bodyTextColor: '#374151', backgroundColor: '#FFFFFF', accentColor: '#DC2626', headerColor: '#1a237e' },
                          dark: { themePreset: 'dark', headlineColor: '#F9FAFB', bodyTextColor: '#D1D5DB', backgroundColor: '#1F2937', accentColor: '#3B82F6', headerColor: '#1e293b' },
                          warm: { themePreset: 'warm', headlineColor: '#78350F', bodyTextColor: '#92400E', backgroundColor: '#FFFBEB', accentColor: '#D97706', headerColor: '#78350F' },
                          ocean: { themePreset: 'ocean', headlineColor: '#0C4A6E', bodyTextColor: '#164E63', backgroundColor: '#F0F9FF', accentColor: '#0EA5E9', headerColor: '#0C4A6E' },
                          forest: { themePreset: 'forest', headlineColor: '#14532D', bodyTextColor: '#166534', backgroundColor: '#F0FDF4', accentColor: '#22C55E', headerColor: '#14532D' },
                        };
                        onContentChange(presets[preset.id] || {});
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        content.themePreset === preset.id ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {preset.colors.map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-500">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Individual Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">Título</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={content.headlineColor} onChange={(e) => onContentChange({ headlineColor: e.target.value, themePreset: 'custom' })} className="w-7 h-7 rounded border cursor-pointer" />
                    <span className="text-[10px] text-gray-400">{content.headlineColor}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Texto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={content.bodyTextColor} onChange={(e) => onContentChange({ bodyTextColor: e.target.value, themePreset: 'custom' })} className="w-7 h-7 rounded border cursor-pointer" />
                    <span className="text-[10px] text-gray-400">{content.bodyTextColor}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Fundo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={content.backgroundColor} onChange={(e) => onContentChange({ backgroundColor: e.target.value, themePreset: 'custom' })} className="w-7 h-7 rounded border cursor-pointer" />
                    <span className="text-[10px] text-gray-400">{content.backgroundColor}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Destaque</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={content.accentColor} onChange={(e) => onContentChange({ accentColor: e.target.value, themePreset: 'custom' })} className="w-7 h-7 rounded border cursor-pointer" />
                    <span className="text-[10px] text-gray-400">{content.accentColor}</span>
                  </div>
                </div>
                {content.theme === 'portal-news' && (
                  <div>
                    <Label className="text-[10px]">Cabeçalho</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={content.headerColor || '#1a237e'} onChange={(e) => onContentChange({ headerColor: e.target.value, themePreset: 'custom' })} className="w-7 h-7 rounded border cursor-pointer" />
                      <span className="text-[10px] text-gray-400">{content.headerColor || '#1a237e'}</span>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Content */}
          <AccordionItem value="content" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-semibold py-3">
              <span className="flex items-center gap-2"><Type className="w-4 h-4" /> Conteúdo</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div>
                <Label className="text-xs">Manchete (Headline)</Label>
                <Textarea value={content.headline} onChange={(e) => onContentChange({ headline: e.target.value })} rows={2} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Subtítulo</Label>
                <Input value={content.subheadline} onChange={(e) => onContentChange({ subheadline: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Nome do Autor</Label>
                <Input value={content.authorName} onChange={(e) => onContentChange({ authorName: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Bio do Autor</Label>
                <Textarea value={content.authorBio} onChange={(e) => onContentChange({ authorBio: e.target.value })} rows={2} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Data (vazio = data de hoje)</Label>
                <Input value={content.publishDate} onChange={(e) => onContentChange({ publishDate: e.target.value })} placeholder="Ex: 10 de fevereiro de 2026" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Corpo do Texto</Label>
                <div className="mt-1 border rounded-md overflow-hidden">
                  <AdvertorialRichEditor
                    value={content.bodyHtml}
                    onChange={(html) => onContentChange({ bodyHtml: html })}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Use a barra de ferramentas para formatar títulos, negrito, links e mais.</p>
              </div>
              {/* CTA */}
              <div className="pt-2 border-t border-gray-100">
                <Label className="text-xs font-semibold">Botão CTA</Label>
                <div className="space-y-2 mt-2">
                  <Input value={content.ctaText} onChange={(e) => onContentChange({ ctaText: e.target.value })} placeholder="Texto do botão" />
                  <Input value={content.ctaUrl} onChange={(e) => onContentChange({ ctaUrl: e.target.value })} placeholder="https://link-do-produto.com" />
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Cor</Label>
                    <input type="color" value={content.ctaColor} onChange={(e) => onContentChange({ ctaColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                  </div>
                </div>
              </div>
              {/* Nav Categories (Portal News) */}
              {content.theme === 'portal-news' && (
                <div className="pt-2 border-t border-gray-100">
                  <Label className="text-xs">Categoria Principal</Label>
                  <Input value={content.newsCategory} onChange={(e) => onContentChange({ newsCategory: e.target.value })} className="mt-1" />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Images */}
          <AccordionItem value="images" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-semibold py-3">
              <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Imagens</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <ImageUpload
                value={content.coverImageUrl}
                onChange={(url) => onContentChange({ coverImageUrl: url })}
                label="Imagem de Capa"
                hint="Tamanho sugerido: 1200 x 630px (16:9)"
                aspectRatio="video"
              />
              <div>
                <ImageUpload
                  value={content.authorImageUrl}
                  onChange={(url) => {
                    onContentChange({ authorImageUrl: url });
                    if (url && content.theme === 'portal-news') setShowLogoWarning(true);
                  }}
                  label="Foto do Autor"
                  hint="Tamanho sugerido: 200 x 200px (quadrado)"
                />
                {showLogoWarning && content.theme === 'portal-news' && (
                  <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg mt-2 text-xs text-amber-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>O uso de marcas registradas de terceiros sem autorização é de responsabilidade do usuário.</span>
                  </div>
                )}
              </div>
              {/* Body Images */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Imagens do Corpo</Label>
                {(content.bodyImages || []).map((img, i) => (
                  <div key={i} className="mb-2">
                     <ImageUpload
                      value={img}
                      onChange={(url) => {
                        const newImages = [...(content.bodyImages || [])];
                        newImages[i] = url;
                        onContentChange({ bodyImages: newImages });
                      }}
                      label={`Imagem ${i + 1}`}
                      hint="Tamanho sugerido: 800 x 500px"
                      aspectRatio="video"
                    />
                    <Button variant="ghost" size="sm" className="text-xs text-red-500 mt-1" onClick={() => {
                      onContentChange({ bodyImages: content.bodyImages.filter((_, j) => j !== i) });
                    }}>
                      <Trash2 className="w-3 h-3 mr-1" /> Remover
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onContentChange({ bodyImages: [...(content.bodyImages || []), ''] })}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Imagem
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Toggles / Special Components */}
          <AccordionItem value="toggles" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-semibold py-3">
              <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Componentes</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              {/* Urgency Bar */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Barra de Urgência</Label>
                <Switch checked={content.urgencyBarEnabled} onCheckedChange={(v) => onContentChange({ urgencyBarEnabled: v })} />
              </div>
              {content.urgencyBarEnabled && (
                <Input value={content.urgencyBarText} onChange={(e) => onContentChange({ urgencyBarText: e.target.value })} placeholder="Use {count} para número" className="text-xs" />
              )}

              {/* Back Redirect */}
              <div className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="text-xs flex items-center gap-1 cursor-help">
                      <RotateCcw className="w-3 h-3" /> Back Redirect
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs max-w-[200px]">
                    Ao clicar em "voltar" no navegador, redireciona para a URL definida ao invés de sair da página.
                  </TooltipContent>
                </Tooltip>
                <Switch checked={content.backRedirectEnabled} onCheckedChange={(v) => onContentChange({ backRedirectEnabled: v })} />
              </div>
              {content.backRedirectEnabled && (
                <Input value={content.backRedirectUrl} onChange={(e) => onContentChange({ backRedirectUrl: e.target.value })} placeholder="URL de redirecionamento" className="text-xs" />
              )}

              {/* Fake Comments */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Comentários Fake</Label>
                <Switch checked={content.fakeCommentsEnabled} onCheckedChange={(v) => onContentChange({ fakeCommentsEnabled: v })} />
              </div>
              {content.fakeCommentsEnabled && (
                <div className="space-y-3 pl-1">
                  {content.fakeComments.map((c, i) => (
                    <div key={i} className="p-2 border rounded-lg space-y-1.5 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <Input value={c.name} onChange={(e) => updateComment(i, { name: e.target.value })} className="h-7 text-xs flex-1 mr-1" placeholder="Nome" />
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400" onClick={() => removeComment(i)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Textarea value={c.text} onChange={(e) => updateComment(i, { text: e.target.value })} rows={1} className="text-xs" placeholder="Comentário" />
                      <div className="flex gap-2">
                        <Input value={c.timeAgo} onChange={(e) => updateComment(i, { timeAgo: e.target.value })} className="h-7 text-xs flex-1" placeholder="2 horas" />
                        <Input type="number" value={c.likes} onChange={(e) => updateComment(i, { likes: Number(e.target.value) })} className="h-7 text-xs w-16" placeholder="Likes" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={addComment}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar Comentário
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Comparison Table (Review Tech only) */}
          {content.theme === 'review-tech' && (
            <AccordionItem value="comparison" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm font-semibold py-3">
                <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Tabela Comparativa</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Ativar Comparação</Label>
                  <Switch checked={content.comparisonEnabled} onCheckedChange={(v) => onContentChange({ comparisonEnabled: v })} />
                </div>
                {content.comparisonEnabled && content.comparisonProducts.map((product, i) => (
                  <div key={i} className={`p-3 rounded-lg border-2 space-y-2 ${product.isWinner ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <Input value={product.name} onChange={(e) => updateProduct(i, { name: e.target.value })} className="h-8 text-xs font-semibold" placeholder="Nome do produto" />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-12">Nota:</Label>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => updateProduct(i, { rating: s })}>
                            <Star className={`w-4 h-4 ${s <= product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-green-600">Prós (um por linha)</Label>
                      <Textarea value={product.pros.join('\n')} onChange={(e) => updateProduct(i, { pros: e.target.value.split('\n').filter(Boolean) })} rows={2} className="text-xs mt-0.5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-red-500">Contras (um por linha)</Label>
                      <Textarea value={product.cons.join('\n')} onChange={(e) => updateProduct(i, { cons: e.target.value.split('\n').filter(Boolean) })} rows={2} className="text-xs mt-0.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={product.isWinner} onCheckedChange={(v) => updateProduct(i, { isWinner: v })} />
                      <Label className="text-xs">Vencedor</Label>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default AdvertorialEditorSidebar;
