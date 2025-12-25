import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Sparkles, Loader2, Settings2, Monitor, Smartphone, ShoppingBag, Play, Link as LinkIcon } from "lucide-react";
import { LandingPageFormData, defaultFormData, defaultSalesContent, defaultBioContent, SalesPageContent, TemplateType } from "@/types/landing-page";
import EditorSidebar from "@/components/trustpage/editor/EditorSidebar";
import SalesEditorSidebar from "@/components/trustpage/editor/SalesEditorSidebar";
import BioEditorSidebar from "@/components/trustpage/editor/BioEditorSidebar";
import IMacMockup from "@/components/trustpage/editor/IMacMockup";
import IPhoneMockup from "@/components/trustpage/editor/IPhoneMockup";
import MobileEditorControls from "@/components/trustpage/editor/MobileEditorControls";
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get template type from URL params for new pages
  const templateTypeParam = searchParams.get('type') as TemplateType | null;
  const getInitialContent = (type: TemplateType | null) => {
    if (type === 'bio') return defaultBioContent;
    if (type === 'sales') return defaultSalesContent;
    return defaultSalesContent;
  };
  const initialFormData: LandingPageFormData = {
    ...defaultFormData,
    template_type: templateTypeParam || 'vsl',
    content: getInitialContent(templateTypeParam),
  };
  
  const [formData, setFormData] = useState<LandingPageFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [userPlan, setUserPlan] = useState<'essential' | 'elite'>('essential');
  const [existingPageId, setExistingPageId] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
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
        const content = page.content as unknown as SalesPageContent || defaultSalesContent;
        const templateType = (page.template_type as TemplateType) || 'vsl';
        
        setFormData({
          slug: page.slug,
          template_id: page.template_id,
          template_type: templateType,
          page_name: page.page_name || '',
          profile_image_url: page.profile_image_url || '',
          headline: page.headline || '',
          headline_size: 2,
          headline_size_mobile: 1.2,
          headline_size_desktop: 2.5,
          subheadline: page.subheadline || '',
          video_url: page.video_url || '',
          video_storage_path: page.video_storage_path || '',
          video_thumbnail_url: '',
          description: page.description || '',
          image_url: page.image_url || '',
          cta_text: page.cta_text || '',
          cta_url: page.cta_url || '',
          cta_delay_enabled: page.cta_delay_enabled ?? false,
          cta_delay_percentage: page.cta_delay_percentage ?? 50,
          whatsapp_number: page.whatsapp_number || '',
          pix_pixel_id: page.pix_pixel_id || '',
          colors: (page.colors as unknown as LandingPageFormData['colors']) || defaultFormData.colors,
          primary_color: page.primary_color || '#8B5CF6',
          content,
          theme: 'dark',
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
      let slug = formData.slug;
      if (!slug) {
        slug = generateSlugFromName(formData.page_name);
      }

      if (isReservedSlug(slug)) {
        toast({
          title: "Nome reservado",
          description: "Este nome é reservado pelo sistema. Escolha outro nome para sua página.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

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
        template_type: formData.template_type,
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
        cta_delay_enabled: formData.cta_delay_enabled,
        cta_delay_percentage: formData.cta_delay_percentage,
        whatsapp_number: formData.whatsapp_number || null,
        pix_pixel_id: formData.pix_pixel_id || null,
        colors: formData.colors as unknown as Json,
        primary_color: formData.primary_color,
        content: formData.content as unknown as Json,
        is_published: true,
      };

      if (existingPageId) {
        const { error } = await supabase
          .from("landing_pages")
          .update(pageData)
          .eq("id", existingPageId);

        if (error) {
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
        const { data, error } = await supabase
          .from("landing_pages")
          .insert(pageData)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Link já em uso",
              description: "Este endereço já está sendo usado. Escolha outro nome.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          if (error.message?.includes('reserved by the system')) {
            toast({
              title: "Nome reservado",
              description: "Este nome é reservado pelo sistema. Escolha outro.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          if (error.message?.includes('row-level security') || error.code === '42501') {
            toast({
              title: "Limite atingido",
              description: "Você atingiu o limite de páginas do seu plano ou sua assinatura expirou.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
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
    if (!formData.page_name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Preencha o nome do negócio antes de visualizar.",
        variant: "destructive",
      });
      return;
    }

    await handleSave();
    await new Promise(resolve => setTimeout(resolve, 500));

    if (lastSavedSlugRef.current) {
      window.open(
        `${window.location.origin}/p/${lastSavedSlugRef.current}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      toast({
        title: "Erro ao abrir prévia",
        description: "Não foi possível salvar a página. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header - Always visible (Light Theme) */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              {formData.template_type === 'sales' ? (
                <ShoppingBag className="w-5 h-5 text-primary" />
              ) : formData.template_type === 'bio' ? (
                <LinkIcon className="w-5 h-5 text-primary" />
              ) : (
                <Play className="w-5 h-5 text-primary" />
              )}
              <span className="font-semibold text-gray-900 hidden sm:inline">
                {formData.template_type === 'sales' ? 'Página de Vendas' : formData.template_type === 'bio' ? 'Bio Link' : 'VSL Página'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile: Settings button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setShowMobileControls(true)}
            >
              <Settings2 className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreview}
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Previewar</span>
            </Button>
            
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Concluir</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          {formData.template_type === 'sales' ? (
            <SalesEditorSidebar formData={formData} onChange={handleChange} />
          ) : formData.template_type === 'bio' ? (
            <BioEditorSidebar formData={formData} onChange={handleChange} />
          ) : (
            <EditorSidebar formData={formData} onChange={handleChange} />
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'form' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500'
              }`}
            >
              Editar
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'preview' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500'
              }`}
            >
              Visualizar
            </button>
          </div>

          {/* Mobile Form View */}
          <div className={`lg:hidden flex-1 overflow-y-auto bg-white ${activeTab === 'form' ? 'block' : 'hidden'}`}>
            {formData.template_type === 'sales' ? (
              <SalesEditorSidebar formData={formData} onChange={handleChange} />
            ) : formData.template_type === 'bio' ? (
              <BioEditorSidebar formData={formData} onChange={handleChange} />
            ) : (
              <EditorSidebar formData={formData} onChange={handleChange} />
            )}
          </div>

          {/* Mobile Preview View */}
          <div className={`lg:hidden flex-1 flex flex-col bg-gray-50 ${activeTab === 'preview' ? 'flex' : 'hidden'}`}>
            {/* View Toggle */}
            <div className="flex items-center justify-center gap-3 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    previewMode === 'mobile' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    previewMode === 'desktop' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-500'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </button>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              {previewMode === 'mobile' ? (
                <IPhoneMockup formData={formData} size="large" />
              ) : (
                <div className="transform scale-[0.55] origin-center">
                  <IMacMockup formData={formData} />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Preview Area (Canvas) */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8 p-8 overflow-auto bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
            <IMacMockup formData={formData} />
            <IPhoneMockup formData={formData} />
          </div>
        </div>
      </div>

      {/* Mobile Controls Sheet */}
      <MobileEditorControls
        formData={formData}
        onChange={handleChange}
        open={showMobileControls}
        onOpenChange={setShowMobileControls}
      />
    </div>
  );
};

export default TrustPageEditor;
