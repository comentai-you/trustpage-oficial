import { useState, useMemo } from "react";
import {
  Search,
  Send,
  Mail,
  Rocket,
  CreditCard,
  Palette,
  Wrench,
  Globe,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  MessageCircle,
  AlertTriangle,
  ShieldCheck,
  PlayCircle,
  BarChart3,
  HelpCircle,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

// --- DADOS E CONSTANTES ---

interface FAQ {
  question: string;
  answer: string | React.ReactNode;
}

interface Category {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  faqs: FAQ[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  featured?: boolean;
}

const WHATSAPP_NUMBER = "5561999686641";
// CORRIGIDO: Voltando para o IP específico do seu projeto
const VERCEL_IP = "216.198.79.1";

// --- TUTORIAIS ---
const tutorials: Tutorial[] = [
  {
    id: "hostinger-dns",
    title: "Domínio na Hostinger",
    description: "Guia passo a passo com vídeo para Hostinger.",
    icon: <Globe className="h-6 w-6" />,
    badge: "Essencial",
    featured: true,
  },
  {
    id: "pixel-setup",
    title: "Instalando Pixel e API",
    description: "Rastreamento avançado para Facebook Ads.",
    icon: <Activity className="h-6 w-6" />,
    badge: "Ads",
    featured: true,
  },
  {
    id: "video-setup",
    title: "Hospedagem de Vídeo (VSL)",
    description: "Por que usar Vimeo/Panda em vez do YouTube?",
    icon: <PlayCircle className="h-6 w-6" />,
    featured: true,
  },
  {
    id: "troubleshooting",
    title: "Resolvendo Erros (404)",
    description: "Minha página não abre, o que fazer?",
    icon: <Wrench className="h-6 w-6" />,
  },
];

// --- CATEGORIAS DE FAQ (EXPANDIDAS E DETALHADAS) ---
const categories: Category[] = [
  {
    id: "primeiros-passos",
    label: "Começando",
    description: "O básico para colocar sua estrutura no ar hoje",
    icon: <Rocket className="h-4 w-4" />,
    faqs: [
      {
        question: "Como criar minha primeira página?",
        answer:
          "Clique no botão azul 'Nova Página' na Dashboard. Escolha o tipo (VSL para vídeo de vendas, Página de Vendas para texto longo ou Bio Link para agregador) e defina um nome interno para sua organização.",
      },
      {
        question: "Preciso pagar hospedagem extra (Hostgator/Hostinger)?",
        answer:
          "Não! A hospedagem de alta velocidade (servidores Vercel Global CDN) já está inclusa em todos os planos da TrustPage. Você só precisa do domínio (o nome do site).",
      },
      {
        question: "Funciona bem em Android e iPhone?",
        answer:
          "Sim! Nosso editor é 'Mobile First'. Isso significa que as páginas são criadas pensando primeiro na experiência do celular, onde acontece 90% das vendas hoje.",
      },
    ],
  },
  {
    id: "dominio",
    label: "Domínios & DNS",
    description: "Configuração técnica do seu endereço .com ou .com.br",
    icon: <Globe className="h-4 w-4" />,
    faqs: [
      {
        question: "Qual a diferença entre Registro A e CNAME?",
        answer: (
          <div>
            <p className="mb-2">São as 'placas de trânsito' da internet:</p>
            <ul className="list-disc pl-4 space-y-2">
              <li>
                <strong>Registro A (@):</strong> É usado para o domínio principal (ex: seusite.com). Ele deve apontar
                para o nosso IP numérico: <code className="bg-slate-100 px-1 rounded">{VERCEL_IP}</code>.
              </li>
              <li>
                <strong>CNAME (www):</strong> É usado para subdomínios (ex: <b>lp</b>.seusite.com) ou para o 'www'. Ele
                aponta para o endereço <code className="bg-slate-100 px-1 rounded">cname.vercel-dns.com</code>.
              </li>
            </ul>
          </div>
        ),
      },
      {
        question: "Quanto tempo demora para o site entrar no ar?",
        answer:
          "Após configurar o DNS, existe o tempo de 'Propagação'. Geralmente leva entre 30 minutos e 2 horas. Em casos raros (como Registro.br antigo), pode levar até 24h. Se passar disso, revise os números do IP.",
      },
      {
        question: "Erro 'Invalid Configuration' ao acessar o site",
        answer:
          "Isso significa que o DNS está apontando para nós (o caminho está certo), mas você esqueceu de cadastrar o domínio dentro da Dashboard da TrustPage. Vá em Configurações > Domínio e adicione a URL lá.",
      },
    ],
  },
  {
    id: "ads-bloqueios",
    label: "Ads & Contingência",
    description: "Evite bloqueios no Facebook e Google",
    icon: <ShieldCheck className="h-4 w-4" />,
    faqs: [
      {
        question: "Minha página evita bloqueios no Facebook?",
        answer:
          "A TrustPage tem código limpo e carregamento rápido, o que aumenta sua nota de qualidade no Facebook. Porém, o bloqueio geralmente acontece por causa da sua COPY (texto) ou do VÍDEO. Recomendamos usar a VSL sem promessas agressivas no texto da página para evitar o robô do Facebook.",
      },
      {
        question: "Como configuro o Pixel do Facebook?",
        answer:
          "Não precisa mexer em código! Vá nas configurações da página > Aba 'Rastreamento'. Cole apenas o ID do Pixel (ex: 123456789). Nós disparamos automaticamente o evento 'PageView' quando alguém visita.",
      },
      {
        question: "Onde coloco a Tag do Google Ads?",
        answer:
          "Na aba 'Rastreamento' ou 'Scripts', há um campo específico para 'Head Code'. Cole a tag global do Google (gtag.js) ali. Para marcar conversão no botão, use a classe do botão ou a url de obrigado.",
      },
    ],
  },
  {
    id: "templates-editor",
    label: "Editor & Design",
    description: "Dúvidas visuais e de conteúdo",
    icon: <Palette className="h-4 w-4" />,
    faqs: [
      {
        question: "Posso usar vídeo do YouTube?",
        answer:
          "Pode, mas não recomendamos para Vendas Profissionais. O YouTube mostra anúncios de concorrentes e vídeos relacionados que distraem seu cliente. Use VIMEO (versão paga) ou PANDA VIDEO para remover controles e manter o foco na sua oferta.",
      },
      {
        question: "Minha imagem de fundo ficou cortada no celular",
        answer:
          "Imagens de fundo se comportam diferente no PC e no Mobile. Recomendamos usar uma imagem vertical (1080x1920px) para o fundo mobile para garantir que o rosto ou produto principal apareça.",
      },
      {
        question: "Como funciona o Delay do Botão (Botão Fantasma)?",
        answer:
          "No editor da VSL, você define o tempo exato (ex: 12 minutos). O botão de compra ficará invisível até esse tempo bater. Isso aumenta muito a conversão, pois força o cliente a assistir a explicação antes de ver o preço.",
      },
    ],
  },
  {
    id: "financeiro",
    label: "Planos & Cobrança",
    description: "Tudo sobre sua assinatura",
    icon: <CreditCard className="h-4 w-4" />,
    faqs: [
      {
        question: "Como faço upgrade para liberar mais páginas?",
        answer:
          "Na Dashboard, clique no botão 'Fazer Upgrade' ou vá em Assinatura. O pagamento é processado pela Kiwify e a liberação das novas funções (como IA e Domínios Ilimitados) é imediata.",
      },
      {
        question: "Tenho garantia de reembolso?",
        answer:
          "Sim! Você tem 7 dias de garantia incondicional pela lei e pela nossa política. Se não se adaptar, pode pedir reembolso direto na plataforma da Kiwify ou com nosso suporte.",
      },
      {
        question: "O que acontece com meus sites se eu cancelar?",
        answer:
          "Suas páginas continuam no ar até o último dia do período pago. Após isso, elas são desativadas e quem acessar verá uma tela de 'Página Indisponível'.",
      },
    ],
  },
  {
    id: "troubleshooting",
    label: "Solução de Erros",
    description: "Resolvendo problemas técnicos sozinho",
    icon: <Wrench className="h-4 w-4" />,
    faqs: [
      {
        question: "Erro 404 (Página não encontrada)",
        answer:
          "Verifique 3 coisas: 1) Você clicou em 'Publicar' no editor? (Botão verde). 2) O endereço (slug) está correto? 3) Se for domínio próprio, o DNS já propagou?",
      },
      {
        question: "O editor não salva minhas alterações",
        answer:
          "Geralmente é instabilidade na internet momentânea. Tente atualizar a página. Se persistir, desative bloqueadores de anúncio (AdBlock) pois eles podem bloquear nossos scripts de salvamento.",
      },
      {
        question: "A página demora para carregar imagens",
        answer:
          "Isso acontece quando você sobe fotos direto da câmera (muito pesadas, > 5MB). Use sites gratuitos como TinyPNG.com para comprimir suas imagens antes de subir. O ideal é manter abaixo de 500KB.",
      },
    ],
  },
];

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("primeiros-passos");

  // Modais
  const [godaddyModalOpen, setGodaddyModalOpen] = useState(false);
  const [otherDnsModalOpen, setOtherDnsModalOpen] = useState(false);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTutorialClick = (tutorialId: string) => {
    switch (tutorialId) {
      case "hostinger-dns":
        setGodaddyModalOpen(true);
        break;
      case "other-dns":
        setOtherDnsModalOpen(true);
        break;
      case "troubleshooting":
        setActiveTab("troubleshooting");
        const element = document.getElementById("troubleshooting-tab");
        element?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        toast.info("Tutorial detalhado em vídeo em breve na área de membros!");
        break;
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        faqs: category.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            (typeof faq.answer === "string" && faq.answer.toLowerCase().includes(query)),
        ),
      }))
      .filter((category) => category.faqs.length > 0);
  }, [searchQuery]);

  const totalResults = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0);
  }, [filteredCategories]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white pb-24 pt-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 mb-4 border-0 backdrop-blur-md">
              Central de Ajuda TrustPage
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Como podemos ajudar você hoje?</h1>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Encontre respostas rápidas, tutoriais passo a passo e resolva problemas técnicos sem esperar pelo suporte.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Ex: configurar pixel, domínio godaddy, erro 404..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-4 py-7 text-lg bg-white text-slate-900 border-0 shadow-2xl rounded-xl w-full focus-visible:ring-offset-2 focus-visible:ring-blue-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            {searchQuery && (
              <p className="mt-4 text-sm text-blue-200 font-medium animate-in fade-in slide-in-from-bottom-2">
                Encontramos {totalResults} resultado{totalResults !== 1 ? "s" : ""} para sua busca
              </p>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-6xl mx-auto px-4 -mt-16 pb-20">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Coluna Esquerda: Tutoriais */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-blue-600" />
                    Guias Rápidos
                  </h2>
                </div>
                <div className="p-2 space-y-1">
                  {tutorials.map((tutorial) => (
                    <div
                      key={tutorial.id}
                      onClick={() => handleTutorialClick(tutorial.id)}
                      className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-start gap-3 ${tutorial.featured ? "bg-blue-50/30" : ""}`}
                    >
                      <div
                        className={`mt-1 p-2 rounded-lg shrink-0 ${tutorial.featured ? "bg-blue-100 text-blue-700 group-hover:bg-blue-200" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"} transition-colors`}
                      >
                        {tutorial.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                            {tutorial.title}
                          </h3>
                          {tutorial.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase shrink-0">
                              {tutorial.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {tutorial.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card de Suporte VIP */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-800">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>

                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 relative z-10">
                  <MessageCircle className="h-5 w-5 text-green-400" />
                  Precisa de um humano?
                </h3>
                <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed">
                  Se não encontrou a resposta aqui, nosso time de suporte está online no WhatsApp.
                </p>
                <Button
                  asChild
                  className="w-full bg-[#25D366] hover:bg-[#1da851] text-white border-0 font-bold shadow-lg shadow-green-900/20 relative z-10 h-12"
                >
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Preciso de ajuda com a TrustPage`} target="_blank">
                    Falar no WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Coluna Direita: Categorias e FAQs */}
            <div className="lg:col-span-8">
              {filteredCategories.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    Não encontramos nada para "{searchQuery}". Tente palavras mais gerais.
                  </p>
                  <Button variant="link" onClick={() => setSearchQuery("")} className="mt-4 text-blue-600">
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <ScrollArea className="w-full pb-2 mb-2">
                    <TabsList className="flex w-max h-auto p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                      {filteredCategories.map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          id={`${category.id}-tab`}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:font-semibold data-[state=active]:shadow-none transition-all text-slate-600"
                        >
                          {category.icon}
                          <span>{category.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  {filteredCategories.map((category) => (
                    <TabsContent
                      key={category.id}
                      value={category.id}
                      className="mt-4 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {category.icon}
                            {category.label}
                          </h2>
                          {category.description && (
                            <p className="text-slate-500 text-sm mt-1 ml-6">{category.description}</p>
                          )}
                        </div>
                        <div className="divide-y divide-slate-100">
                          <Accordion type="single" collapsible className="w-full">
                            {category.faqs.map((faq, index) => (
                              <AccordionItem key={index} value={`item-${index}`} className="border-0">
                                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 transition-colors hover:no-underline group">
                                  <span className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors text-left text-base">
                                    {faq.question}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 text-slate-600 leading-relaxed text-base bg-slate-50/50">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL HOSTINGER DNS --- */}
      <Dialog open={godaddyModalOpen} onOpenChange={setGodaddyModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <div className="bg-slate-50 p-6 border-b border-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="bg-black p-2 rounded-lg text-white">
                  <Globe className="h-6 w-6" />
                </div>
                Configurando DNS na Hostinger
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Assista ao vídeo tutorial ou siga os passos abaixo para configurar seu domínio.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-8">
            {/* Video Tutorial */}
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <iframe
                src="https://player.vimeo.com/video/1153607914?h=0&title=0&byline=0&portrait=0"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Tutorial de configuração de domínio na Hostinger"
              />
            </div>

            {/* Passo 1 */}
            <div className="flex gap-4 relative">
              <div className="absolute left-4 top-10 bottom-[-2rem] w-0.5 bg-slate-200 last:hidden"></div>
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg z-10">
                1
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Acesse a Zona de DNS</h4>
                <p className="text-slate-600 mb-4">
                  Faça login na Hostinger, vá em <strong>Domínios</strong>, clique no seu domínio e depois em{" "}
                  <strong>Zona DNS</strong> ou <strong>Editor de Zona DNS</strong>.
                </p>
                <Button variant="outline" size="sm" asChild className="gap-2 border-slate-300">
                  <a href="https://www.hostinger.com.br/tutoriais/como-editar-zona-dns-na-hostinger" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Ver tutorial da Hostinger
                  </a>
                </Button>
              </div>
            </div>

            {/* Passo 2 - Principal */}
            <div className="flex gap-4 relative">
              <div className="absolute left-4 top-10 bottom-[-2rem] w-0.5 bg-slate-200"></div>
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-200 z-10">
                2
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Configure o Registro A (Principal)</h4>
                <p className="text-slate-600 mb-4">Clique em "Adicionar" e preencha exatamente assim:</p>

                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 space-y-3 font-mono text-sm">
                  {/* Tabela Fake */}
                  <div className="grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="col-span-3 text-slate-500 font-sans font-medium">Tipo</div>
                    <div className="col-span-9 font-bold text-slate-900">A</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="col-span-3 text-slate-500 font-sans font-medium">Nome</div>
                    <div className="col-span-7 font-bold text-slate-900">@</div>
                    <div className="col-span-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-slate-100"
                        onClick={() => handleCopy("@", "name")}
                      >
                        {copiedField === "name" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm ring-1 ring-blue-500/20">
                    <div className="col-span-3 text-slate-500 font-sans font-medium">Valor</div>
                    <div className="col-span-7 font-bold text-blue-600">{VERCEL_IP}</div>
                    <div className="col-span-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-blue-50"
                        onClick={() => handleCopy(VERCEL_IP, "ip")}
                      >
                        {copiedField === "ip" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-blue-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 3 - CNAME */}
            <div className="flex gap-4 relative">
              <div className="absolute left-4 top-10 bottom-[-2rem] w-0.5 bg-slate-200"></div>
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg z-10">
                3
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Configure o CNAME (Para www)</h4>
                <p className="text-slate-600 mb-4">
                  Adicione mais um registro para garantir que <strong>www.seusite.com</strong> funcione.
                </p>
                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 font-mono text-sm">
                  <div className="grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="col-span-3 text-slate-500 font-sans font-medium">Nome</div>
                    <div className="col-span-9 font-bold text-slate-900">www</div>
                  </div>
                  <div className="mt-2 grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="col-span-3 text-slate-500 font-sans font-medium">Valor</div>
                    <div className="col-span-7 font-bold text-slate-900">cname.vercel-dns.com</div>
                    <div className="col-span-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy("cname.vercel-dns.com", "cname")}
                      >
                        {copiedField === "cname" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 4 - Nameservers */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200 z-10">
                4
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Atualize os Nameservers (Servidores DNS)</h4>
                <p className="text-slate-600 mb-4">
                  Esta etapa é <strong>essencial</strong> para que o Vercel DNS funcione corretamente. Vá em{" "}
                  <strong>Meus Produtos &gt; Domínio &gt; Gerenciar DNS &gt; Nameservers</strong> e altere para:
                </p>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 font-mono text-sm space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200 shadow-sm">
                    <div className="font-bold text-indigo-700">ns1.vercel-dns.com</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-indigo-100"
                      onClick={() => handleCopy("ns1.vercel-dns.com", "ns1")}
                    >
                      {copiedField === "ns1" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-indigo-500" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200 shadow-sm">
                    <div className="font-bold text-indigo-700">ns2.vercel-dns.com</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-indigo-100"
                      onClick={() => handleCopy("ns2.vercel-dns.com", "ns2")}
                    >
                      {copiedField === "ns2" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-indigo-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  💡 A alteração dos nameservers pode levar algumas horas para propagar totalmente.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-amber-800 text-sm">Importante: TTL</h5>
                <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                  Se o seu provedor perguntar o <strong>TTL</strong>, selecione <strong>600 segundos</strong> ou{" "}
                  <strong>1/2 Hora</strong>. <br />
                  Depois de salvar, aguarde até 2 horas para propagar.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
            <Button size="lg" onClick={() => setGodaddyModalOpen(false)}>
              Entendi, vou configurar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Outros DNS (Simplificado) */}
      <Dialog open={otherDnsModalOpen} onOpenChange={setOtherDnsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Outros Provedores (Registro.br, Hostgator)</DialogTitle>
            <DialogDescription>
              A lógica é sempre a mesma: Você precisa criar um Registro A apontando para nosso IP.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="font-bold text-slate-900 mb-1">Onde ir:</p>
              <p className="text-sm text-slate-600">
                Procure por "Zona de DNS", "Editor de Zona" ou "Configuração de DNS" no painel da sua hospedagem.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border p-3 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Registro A (Raiz)</p>
                  <p className="font-mono text-lg text-blue-600 font-bold">{VERCEL_IP}</p>
                </div>
                <Button variant="ghost" onClick={() => handleCopy(VERCEL_IP, "ip-other")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HelpPage;
