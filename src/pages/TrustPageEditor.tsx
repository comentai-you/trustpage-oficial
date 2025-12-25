import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Sparkles, User, FileText, MousePointer, Loader2, Menu, X } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const TrustPageEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LandingPageFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [userPlan, setUserPlan] = useState<'essential' | 'elite'>('essential');
  const [existingPageId, setExistingPageId] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const lastSavedSlugRef = useRef<string | null>(null);

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

  // Lista de slugs reservados pelo sistema (rotas internas)
  const RESERVED_SLUGS = [
    'admin', 'dashboard', 'login', 'auth', 'register', 'signup', 
    'pricing', 'api', '404', 'suporte', 'ajuda', 'termos',
    'settings', 'profile', 'user', 'users', 'pages', 'page',
    'edit', 'new', 'create', 'delete', 'p', 'app', 'home',
    'about', 'contact', 'blog', 'checkout', 'cart', 'account'
  ];

  const generateSlugFromName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 40);
  };

  const isReservedSlug = (slug: string): boolean => {
    return RESERVED_SLUGS.includes(slug.toLowerCase().trim());
  };

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("landing_pages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) return false;
    
    // Se não encontrou, está disponível
    // Se encontrou mas é a página atual, está ok
    if (!data) return true;
    if (existingPageId && data.id === existingPageId) return true;
    
    return false;
  };

  const handleSave = async () => {
    lastSavedSlugRef.current = null;

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
      // Gerar slug a partir do nome se não existir
      let slug = formData.slug;
      if (!slug) {
        slug = generateSlugFromName(formData.page_name);
      }

      // Validar se o slug é reservado
      if (isReservedSlug(slug)) {
        toast({
          title: "Nome reservado",
          description: "Este nome é reservado pelo sistema. Escolha outro nome para sua página.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Verificar disponibilidade do slug
      const isAvailable = await checkSlugAvailability(slug);
      if (!isAvailable) {
        toast({
          title: "Link já em uso",
          description: `O endereço "/p/${slug}" já está sendo usado. Escolha outro nome.`,
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
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

        if (error) {
          // Handle RLS policy violation (subscription expired)
          if (error.message?.includes('row-level security') || error.code === '42501') {
            toast({
              title: "Assinatura expirada",
              description: "Sua assinatura expirou. Faça upgrade para continuar editando.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          throw error;
        }
      } else {
        // Create new page
        const { data, error } = await supabase
          .from("landing_pages")
          .insert(pageData)
          .select()
          .single();

        if (error) {
          // Handle slug already exists
          if (error.code === '23505') {
            toast({
              title: "Link já em uso",
              description: "Este endereço já está sendo usado. Escolha outro nome.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          // Handle reserved slug (trigger exception)
          if (error.message?.includes('reserved by the system')) {
            toast({
              title: "Nome reservado",
              description: "Este nome é reservado pelo sistema. Escolha outro.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          // Handle RLS policy violation (subscription/limit)
          if (error.message?.includes('row-level security') || error.code === '42501') {
            toast({
              title: "Limite atingido",
              description: "Você atingiu o limite de páginas do seu plano ou sua assinatura expirou.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          // Handle CHECK constraint violation (invalid slug format)
          if (error.code === '23514') {
            toast({
              title: "Nome inválido",
              description: "O nome deve ter pelo menos 2 caracteres, começar e terminar com letra ou número.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          throw error;
        }

        setExistingPageId(data.id);
        navigate(`/edit/${data.id}`, { replace: true });
      }

      setFormData(prev => ({ ...prev, slug }));
      lastSavedSlugRef.current = slug;
      
      toast({
        title: "Página salva!",
        description: `Sua página está disponível em /p/${slug}`,
      });
    } catch (error: unknown) {
      console.error("Error saving page:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao salvar sua página.";
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    await handleSave();

    if (lastSavedSlugRef.current) {
      window.open(
        `${window.location.origin}/p/${lastSavedSlugRef.current}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    toast({
      title: "Salve primeiro",
      description: "Salve sua página para visualizar a prévia.",
    });
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
        <div className="flex items-center justify-between px-3 sm:px-4 h-14">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground hidden sm:inline">TrustPage</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Preview Toggle */}
            <Button 
              variant="outline" 
              size="sm" 
              className="lg:hidden"
              onClick={() => setShowMobilePreview(true)}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Prévia</span>
            </Button>
            
            {/* Desktop Preview Button */}
            <Button variant="outline" size="sm" onClick={handlePreview} className="hidden lg:flex">
              <Eye className="w-4 h-4 mr-2" />
              Prévia
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline ml-2">Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Salvar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Editor Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
        {/* Left Panel - Form (Full width on mobile) */}
        <div className="w-full lg:w-[400px] xl:w-[450px] bg-background lg:border-r border-border overflow-y-auto flex-shrink-0">
          <div className="p-3 sm:p-4">
            <Tabs defaultValue="perfil" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                <TabsTrigger value="perfil" className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                  <User className="w-3.5 h-3.5" />
                  <span>Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="conteudo" className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Conteúdo</span>
                </TabsTrigger>
                <TabsTrigger value="acoes" className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Ações</span>
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
          
          {/* Mobile Preview Button (Fixed at bottom on mobile) */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
            <Button 
              className="w-full gradient-button py-6 font-semibold shadow-lg"
              onClick={() => setShowMobilePreview(true)}
            >
              <Eye className="w-5 h-5 mr-2" />
              Ver Prévia da Página
            </Button>
          </div>
          
          {/* Spacer for fixed button */}
          <div className="lg:hidden h-24" />
        </div>

        {/* Right Panel - Preview (Hidden on mobile, visible on lg+) */}
        <div className="hidden lg:flex flex-1 bg-muted/50 items-start justify-center overflow-hidden">
          <div className="sticky top-0 h-full flex items-center">
            <MobilePreview formData={formData} />
          </div>
        </div>
      </div>

      {/* Mobile Preview Sheet */}
      <Sheet open={showMobilePreview} onOpenChange={setShowMobilePreview}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-center">Prévia da Página</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto bg-muted/50 flex items-start justify-center p-4 h-[calc(85vh-60px)]">
            <MobilePreview formData={formData} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TrustPageEditor;
