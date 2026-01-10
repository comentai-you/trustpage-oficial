import { useState, useMemo } from "react";
import { Search, Send, Mail, Rocket, CreditCard, Palette, Wrench, Globe, Copy, Check, ExternalLink, BookOpen, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

interface FAQ {
  question: string;
  answer: string;
}

interface Category {
  id: string;
  label: string;
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
const VERCEL_IP = "216.198.79.1";

const tutorials: Tutorial[] = [
  {
    id: "godaddy-dns",
    title: "Configurando DNS na GoDaddy",
    description: "Aprenda a apontar seu domínio GoDaddy para sua página",
    icon: <Globe className="h-6 w-6" />,
    badge: "Popular",
    featured: true,
  },
  {
    id: "other-dns",
    title: "Configurando DNS em outros provedores",
    description: "Registro.br, Hostgator, Cloudflare e outros",
    icon: <Globe className="h-6 w-6" />,
  },
  {
    id: "first-page",
    title: "Criando sua primeira página",
    description: "Guia completo para criar e publicar",
    icon: <Rocket className="h-6 w-6" />,
  },
  {
    id: "templates",
    title: "Escolhendo o template ideal",
    description: "VSL, Página de Vendas ou Bio Link?",
    icon: <Palette className="h-6 w-6" />,
  },
];

const categories: Category[] = [
  {
    id: "dominio",
    label: "Domínio Próprio",
    icon: <Globe className="h-4 w-4" />,
    faqs: [
      {
        question: "Como configurar meu domínio próprio?",
        answer: "Acesse as configurações da sua página, vá em 'Domínio Personalizado' e siga as instruções para apontar seu domínio. Você precisará adicionar registros DNS no seu provedor de domínio."
      },
      {
        question: "Qual IP devo apontar meu domínio?",
        answer: `Configure um registro tipo 'A' apontando para ${VERCEL_IP}. A propagação pode levar até 2 horas.`
      },
      {
        question: "Por que meu domínio ainda não funciona?",
        answer: "A propagação DNS pode levar de alguns minutos até 2 horas. Verifique se os registros estão corretos e aguarde. Se persistir, entre em contato com nosso suporte."
      },
      {
        question: "Posso usar subdomínio (ex: lp.meusite.com)?",
        answer: "Sim! Para subdomínios, use um registro CNAME ao invés de A. O processo é similar ao domínio principal."
      }
    ]
  },
  {
    id: "primeiros-passos",
    label: "Primeiros Passos",
    icon: <Rocket className="h-4 w-4" />,
    faqs: [
      {
        question: "Como criar minha primeira página?",
        answer: "Clique no botão azul 'Nova Página' na Dashboard, escolha um template (VSL, Vendas ou Bio) e dê um nome para seu link."
      },
      {
        question: "Funciona no celular?",
        answer: "Sim! Tanto o editor quanto as páginas publicadas são 100% otimizados para mobile."
      }
    ]
  },
  {
    id: "financeiro",
    label: "Financeiro e Planos",
    icon: <CreditCard className="h-4 w-4" />,
    faqs: [
      {
        question: "Quais as formas de pagamento?",
        answer: "Aceitamos PIX, Boleto e Cartão de Crédito através da nossa integração segura com a Kiwify."
      },
      {
        question: "Como faço upgrade?",
        answer: "Na sua Dashboard, clique no botão 'Fazer Upgrade' no topo ou acesse as configurações. A liberação é automática após o pagamento."
      },
      {
        question: "Tem fidelidade?",
        answer: "Não. Você pode cancelar sua assinatura a qualquer momento entrando em contato com o suporte."
      }
    ]
  },
  {
    id: "templates",
    label: "Templates e Edição",
    icon: <Palette className="h-4 w-4" />,
    faqs: [
      {
        question: "Qual a diferença entre VSL e Página de Vendas?",
        answer: "A VSL é focada em vídeo com um botão que aparece depois (delay). A Página de Vendas é completa, com depoimentos, benefícios e mais detalhes para convencer o cliente."
      },
      {
        question: "Como funciona o Bio Link?",
        answer: "É um agregador de links estilo Linktree, mas com opção de colocar fotos nos botões e destacar ofertas importantes."
      },
      {
        question: "O que é o Delay do Botão?",
        answer: "É uma função da VSL onde o botão de compra só aparece no momento que você escolher (ex: quando o narrador fala o preço no vídeo)."
      }
    ]
  },
  {
    id: "problemas",
    label: "Solução de Problemas",
    icon: <Wrench className="h-4 w-4" />,
    faqs: [
      {
        question: "Minha imagem não carrega",
        answer: "Verifique se o arquivo tem menos de 5MB e está nos formatos JPG ou PNG."
      },
      {
        question: "Esqueci minha senha",
        answer: "Na tela de login, clique em 'Esqueci minha senha' para receber um link de redefinição no seu e-mail."
      }
    ]
  }
];

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dominio");
  const [godaddyModalOpen, setGodaddyModalOpen] = useState(false);
  const [otherDnsModalOpen, setOtherDnsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTutorialClick = (tutorialId: string) => {
    switch (tutorialId) {
      case "godaddy-dns":
        setGodaddyModalOpen(true);
        break;
      case "other-dns":
        setOtherDnsModalOpen(true);
        break;
      case "first-page":
        setActiveTab("primeiros-passos");
        break;
      case "templates":
        setActiveTab("templates");
        break;
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.map(category => ({
      ...category,
      faqs: category.faqs.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      )
    })).filter(category => category.faqs.length > 0);
  }, [searchQuery]);

  const totalResults = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0);
  }, [filteredCategories]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">
                Ajuda & Tutoriais
              </h1>
            </div>
            <p className="text-blue-100 mb-8">
              Aprenda a configurar sua página e tire todas as suas dúvidas
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por palavra-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white text-foreground border-0 shadow-xl rounded-xl"
              />
            </div>
            
            {searchQuery && (
              <p className="mt-4 text-blue-100">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Tutorials Section */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Tutoriais em Destaque
          </h2>

          {/* Featured Tutorial - GoDaddy */}
          {tutorials.filter(t => t.featured).map(tutorial => (
            <Card 
              key={tutorial.id}
              className="mb-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50"
              onClick={() => handleTutorialClick(tutorial.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    {tutorial.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">{tutorial.title}</h3>
                      {tutorial.badge && (
                        <Badge className="bg-primary/10 text-primary border-0">
                          {tutorial.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{tutorial.description}</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                      Ver tutorial completo →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Other Tutorials Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {tutorials.filter(t => !t.featured).map(tutorial => (
              <Card 
                key={tutorial.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                onClick={() => handleTutorialClick(tutorial.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      {tutorial.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{tutorial.title}</h3>
                      <p className="text-xs text-muted-foreground">{tutorial.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-foreground mb-6">Perguntas Frequentes</h2>
          
          {filteredCategories.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Nenhum resultado encontrado para "{searchQuery}"
                </p>
                <Button
                  variant="link"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Limpar busca
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-8">
                {filteredCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm transition-all"
                  >
                    {category.icon}
                    <span className="hidden sm:inline">{category.label}</span>
                    {searchQuery && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-2 py-0.5 rounded-full">
                        {category.faqs.length}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {filteredCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-b last:border-0"
                          >
                            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-muted/50 transition-colors">
                              <span className="font-medium text-foreground">
                                {faq.question}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4 text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Support Footer */}
          <Card className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Ainda precisa de ajuda?
              </h2>
              <p className="text-muted-foreground mb-6">
                Nossa equipe está pronta para te atender
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-[#25D366] hover:bg-[#1da851] text-white gap-2"
                >
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Preciso de ajuda com minha TrustPage.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chamar no WhatsApp
                  </a>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <a href="mailto:suporte@trustpage.com">
                    <Mail className="h-5 w-5" />
                    Enviar E-mail
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating WhatsApp Button */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Preciso de ajuda com minha TrustPage.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1da851] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      </div>

      {/* GoDaddy Tutorial Modal */}
      <Dialog open={godaddyModalOpen} onOpenChange={setGodaddyModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-6 w-6 text-primary" />
              Configurando DNS na GoDaddy
            </DialogTitle>
            <DialogDescription>
              Siga o passo a passo para apontar seu domínio GoDaddy para sua TrustPage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">Acesse sua conta GoDaddy</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  Faça login em <a href="https://godaddy.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">godaddy.com</a> e 
                  vá em <strong>"Meus Produtos"</strong> → <strong>"DNS"</strong> do seu domínio.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a href="https://dcc.godaddy.com/manage-dns" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Abrir GoDaddy DNS
                  </a>
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">Adicione o Registro A</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  Clique em <strong>"Adicionar"</strong> e crie um registro tipo <strong>"A"</strong> com:
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">Nome</span>
                      <span className="font-mono font-semibold">@</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("@", "name")}
                    >
                      {copiedField === "name" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">Valor (IP)</span>
                      <span className="font-mono font-semibold text-primary">{VERCEL_IP}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(VERCEL_IP, "ip")}
                    >
                      {copiedField === "ip" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">TTL</span>
                    <span className="font-mono">600 (ou "Automático")</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">Configure o registro WWW</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  Adicione também um registro A para <strong>www.seudominio.com</strong>:
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">Nome</span>
                      <span className="font-mono font-semibold">www</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("www", "www")}
                    >
                      {copiedField === "www" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">Valor (IP)</span>
                      <span className="font-mono font-semibold text-primary">{VERCEL_IP}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(VERCEL_IP, "ip-www")}
                    >
                      {copiedField === "ip-www" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm flex items-start gap-2">
                <span className="text-lg">⏱️</span>
                <span>
                  <strong>Importante:</strong> A propagação DNS pode levar até <strong>2 horas</strong>. 
                  Após configurar, aguarde e verifique se seu domínio está funcionando.
                </span>
              </p>
            </div>

            {/* Final Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white gap-2"
                asChild
              >
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Preciso de ajuda para configurar meu domínio GoDaddy.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Preciso de ajuda
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => setGodaddyModalOpen(false)}
              >
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other DNS Providers Modal */}
      <Dialog open={otherDnsModalOpen} onOpenChange={setOtherDnsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-6 w-6 text-primary" />
              Configurando DNS em Outros Provedores
            </DialogTitle>
            <DialogDescription>
              Instruções gerais para Registro.br, Hostgator, Cloudflare e outros
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Configuração Universal</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Independente do provedor, você precisa criar os seguintes registros:
              </p>
              
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Registro A (domínio principal)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-muted px-2 py-1 rounded">@</span>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy("@", "other-name")}>
                          {copiedField === "other-name" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-muted px-2 py-1 rounded text-primary">{VERCEL_IP}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(VERCEL_IP, "other-ip")}>
                          {copiedField === "other-ip" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Registro A (www)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-muted px-2 py-1 rounded">www</span>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy("www", "other-www")}>
                          {copiedField === "other-www" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-muted px-2 py-1 rounded text-primary">{VERCEL_IP}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(VERCEL_IP, "other-ip2")}>
                          {copiedField === "other-ip2" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider-specific tips */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="registro-br">
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-semibold">Registro.br</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Acesse registro.br e faça login</li>
                    <li>Clique no domínio desejado</li>
                    <li>Vá em "DNS" → "Configurar zona"</li>
                    <li>Adicione os registros A conforme acima</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="hostgator">
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-semibold">Hostgator</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Acesse o Portal do Cliente Hostgator</li>
                    <li>Vá em "Domínios" → "Zona DNS"</li>
                    <li>Edite ou crie os registros A</li>
                    <li>Salve as alterações</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cloudflare">
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-semibold">Cloudflare</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Acesse dash.cloudflare.com</li>
                    <li>Selecione seu domínio</li>
                    <li>Vá em "DNS" → "Records"</li>
                    <li>Adicione registros A (desative o proxy/nuvem laranja)</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm flex items-start gap-2">
                <span className="text-lg">⏱️</span>
                <span>
                  A propagação DNS pode levar até <strong>2 horas</strong>. Aguarde antes de testar.
                </span>
              </p>
            </div>

            {/* Final Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white gap-2"
                asChild
              >
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Preciso de ajuda para configurar meu domínio.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Preciso de ajuda
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => setOtherDnsModalOpen(false)}
              >
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HelpPage;
