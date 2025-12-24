import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Sparkles, User, FileText, MousePointer } from "lucide-react";
import { Link } from "react-router-dom";
import { LandingPageFormData, defaultFormData } from "@/types/landing-page";
import PerfilTab from "@/components/trustpage/PerfilTab";
import ConteudoTab from "@/components/trustpage/ConteudoTab";
import AcoesTab from "@/components/trustpage/AcoesTab";
import MobilePreview from "@/components/trustpage/MobilePreview";
import { useToast } from "@/hooks/use-toast";

const TrustPageEditor = () => {
  const [formData, setFormData] = useState<LandingPageFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [userPlan] = useState<'essential' | 'elite'>('essential'); // TODO: Get from Supabase
  const { toast } = useToast();

  const handleChange = (data: Partial<LandingPageFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save - will be connected to Supabase later
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Página salva!",
      description: "Suas alterações foram salvas com sucesso.",
    });
    
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">TrustPage</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Prévia
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </header>

      {/* Editor Layout */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Panel - Form */}
        <div className="w-[400px] bg-background border-r border-border overflow-y-auto">
          <div className="p-4">
            <Tabs defaultValue="perfil" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="perfil" className="flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="conteudo" className="flex items-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger value="acoes" className="flex items-center gap-1.5 text-xs">
                  <MousePointer className="w-3.5 h-3.5" />
                  Ações
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="perfil">
                <PerfilTab formData={formData} onChange={handleChange} />
              </TabsContent>
              
              <TabsContent value="conteudo">
                <ConteudoTab formData={formData} onChange={handleChange} />
              </TabsContent>
              
              <TabsContent value="acoes">
                <AcoesTab formData={formData} onChange={handleChange} userPlan={userPlan} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-muted/50 overflow-hidden">
          <MobilePreview formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default TrustPageEditor;
