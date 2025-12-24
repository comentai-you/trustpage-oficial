import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Sparkles, User, FileText, MousePointer, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { LandingPageFormData, defaultFormData } from "@/types/landing-page";
import PerfilTab from "@/components/trustpage/PerfilTab";
import ConteudoTab from "@/components/trustpage/ConteudoTab";
import AcoesTab from "@/components/trustpage/AcoesTab";
import MobilePreview from "@/components/trustpage/MobilePreview";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const TrustPageEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LandingPageFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [userPlan, setUserPlan] = useState<'essential' | 'elite'>('essential');
  const [existingPageId, setExistingPageId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user plan and existing page data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch user plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_type")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.plan_type === 'elite') {
        setUserPlan('elite');
      }

      // If editing, fetch page data
      if (id) {
        setIsLoading(true);
        const { data: page, error } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error || !page) {
          toast({
            title: "Página não encontrada",
            description: "A página que você está tentando editar não existe.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setExistingPageId(page.id);
        setFormData({
          slug: page.slug,
          template_id: page.template_id,
          page_name: page.page_name || '',
          profile_image_url: page.profile_image_url || '',
          headline: page.headline || '',
          subheadline: page.subheadline || '',
          video_url: page.video_url || '',
          video_storage_path: page.video_storage_path || '',
          video_thumbnail_url: '',
          description: page.description || '',
          image_url: page.image_url || '',
          cta_text: page.cta_text || '',
          cta_url: page.cta_url || '',
          whatsapp_number: page.whatsapp_number || '',
          pix_pixel_id: page.pix_pixel_id || '',
          colors: (page.colors as unknown as LandingPageFormData['colors']) || defaultFormData.colors,
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate, toast]);

  const handleChange = (data: Partial<LandingPageFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.page_name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para sua página.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const slug = formData.slug || generateSlug(formData.page_name);
      
      const pageData = {
        user_id: user.id,
        slug,
        template_id: formData.template_id,
        page_name: formData.page_name,
        profile_image_url: formData.profile_image_url || null,
        headline: formData.headline || null,
        subheadline: formData.subheadline || null,
        video_url: formData.video_url || null,
        video_storage_path: formData.video_storage_path || null,
        description: formData.description || null,
        image_url: formData.image_url || null,
        cta_text: formData.cta_text || null,
        cta_url: formData.cta_url || null,
        whatsapp_number: formData.whatsapp_number || null,
        pix_pixel_id: formData.pix_pixel_id || null,
        colors: formData.colors as unknown as Json,
        is_published: true,
      };

      if (existingPageId) {
        // Update existing page
        const { error } = await supabase
          .from("landing_pages")
          .update(pageData)
          .eq("id", existingPageId);

        if (error) throw error;
      } else {
        // Create new page
        const { data, error } = await supabase
          .from("landing_pages")
          .insert(pageData)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Slug já existe",
              description: "Este endereço já está em uso. Tente um nome diferente.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }

        setExistingPageId(data.id);
        navigate(`/edit/${data.id}`, { replace: true });
      }

      setFormData(prev => ({ ...prev, slug }));
      
      toast({
        title: "Página salva!",
        description: `Sua página está disponível em /p/${slug}`,
      });
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar sua página. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/p/${formData.slug}`, '_blank');
    } else {
      toast({
        title: "Salve primeiro",
        description: "Salve sua página para visualizar a prévia.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Prévia
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
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

        {/* Right Panel - Preview (Sticky) */}
        <div className="flex-1 bg-muted/50 flex items-start justify-center overflow-hidden">
          <div className="sticky top-0 h-full flex items-center">
            <MobilePreview formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustPageEditor;
