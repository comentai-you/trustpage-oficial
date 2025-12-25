import { useState, useMemo } from "react";
import { Search, MessageCircle, Mail, Rocket, CreditCard, Palette, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

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

const categories: Category[] = [
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
        question: "Posso usar domínio próprio?",
        answer: "Atualmente seus links são gerados como trustpage.com/seu-nome. A funcionalidade de domínio próprio está em desenvolvimento para o plano Agency."
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
        answer: "Aceitamos PIX e Boleto através da nossa integração segura com o Asaas."
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
  const [activeTab, setActiveTab] = useState("primeiros-passos");

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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Como podemos te ajudar?
            </h1>
            <p className="text-blue-100 mb-8">
              Encontre respostas rápidas para suas dúvidas
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

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-12">
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
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <a
                    href="https://api.whatsapp.com/send?phone=5511999999999&text=Olá! Preciso de ajuda com o TrustPage."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Falar no WhatsApp
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
      </div>
    </DashboardLayout>
  );
};

export default HelpPage;
