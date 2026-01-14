import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Settings2,
  ShoppingBag,
  Play,
  Link as LinkIcon,
  Check,
  Cloud,
} from "lucide-react";
import {
  LandingPageFormData,
  defaultFormData,
  defaultSalesContent,
  defaultBioContent,
  SalesPageContent,
  TemplateType,
} from "@/types/landing-page";
import EditorSidebar from "@/components/trustpage/editor/EditorSidebar";
import SalesEditorSidebar from "@/components/trustpage/editor/SalesEditorSidebar";
import BioEditorSidebar from "@/components/trustpage/editor/BioEditorSidebar";
import CaptureHeroEditorSidebar from "@/components/trustpage/editor/CaptureHeroEditorSidebar";
import SectionBuilderSidebar from "@/components/trustpage/editor/SectionBuilderSidebar";
import IMacMockup from "@/components/trustpage/editor/IMacMockup";
import IPhoneMockup from "@/components/trustpage/editor/IPhoneMockup";
import MobileEditorControls from "@/components/trustpage/editor/MobileEditorControls";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { AICopywriterProvider } from "@/contexts/AICopywriterContext";

const TrustPageEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get template type from URL params for new pages
  const templateTypeParam = searchParams.get("type") as TemplateType | null;
  const getInitialContent = (type: TemplateType | null) => {
    if (type === "bio") return defaultBioContent;
    if (type === "sales") return defaultSalesContent;
    return defaultSalesContent;
  };
  const initialFormData: LandingPageFormData = {
    ...defaultFormData,
    template_type: templateTypeParam || "vsl",
    content: getInitialContent(templateTypeParam),
  };

  const [formData, setFormData] = useState<LandingPageFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [existingPageId, setExistingPageId] = useState<string | null>(null);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");

  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const { toast } = useToast();
  const { user } = useAuth();
  const lastSavedSlugRef = useRef<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFormDataRef = useRef<string>("");

  // Fetch user plan and existing page data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch user profile to get plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_type")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profile?.plan_type) {
        setUserPlan(profile.plan_type);
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
        const content = (page.content as unknown as SalesPageContent) || defaultSalesContent;
        const templateType = (page.template_type as TemplateType) || "vsl";

        // Extract headline sizes from content JSON (where they are persisted)
        const contentAny = page.content as any;
        const headlineSizeMobile = contentAny?.headline_size_mobile ?? 1.2;
        const headlineSizeDesktop = contentAny?.headline_size_desktop ?? 2.5;

        setFormData({
          slug: page.slug,
          template_id: page.template_id,
          template_type: templateType,
          page_name: page.page_name || "",
          profile_image_url: page.profile_image_url || "",
          headline: page.headline || "",
          headline_size: 2,
          headline_size_mobile: headlineSizeMobile,
          headline_size_desktop: headlineSizeDesktop,
          hero_image_size_mobile: contentAny?.hero_image_size_mobile ?? 100,
          hero_image_size_desktop: contentAny?.hero_image_size_desktop ?? 100,
          subheadline: page.subheadline || "",
          video_url: page.video_url || "",
          video_storage_path: page.video_storage_path || "",
          video_thumbnail_url: "",
          description: page.description || "",
          image_url: page.image_url || "",
          cover_image_url: (page as any).cover_image_url || "",
          cta_text: page.cta_text || "",
          cta_url: page.cta_url || "",
          cta_delay_enabled: page.cta_delay_enabled ?? false,
          cta_delay_percentage: page.cta_delay_percentage ?? 50,
          whatsapp_number: page.whatsapp_number || "",
          pix_pixel_id: page.pix_pixel_id || "",
          facebook_pixel_id: (page as any).facebook_pixel_id || "",
          google_tag_id: contentAny?.google_tag_id || "",
          colors: (page.colors as unknown as LandingPageFormData["colors"]) || defaultFormData.colors,
          primary_color: page.primary_color || "#8B5CF6",
          content,
          theme: "dark",
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate, toast]);

  const handleChange = useCallback((data: Partial<LandingPageFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // Auto-save function (silent, no toasts)
  const performAutoSave = useCallback(async () => {
    if (!user || !existingPageId) return;

    const currentFormDataString = JSON.stringify(formData);
    if (currentFormDataString === lastFormDataRef.current) return;

    if (!formData.page_name.trim()) return;

    setAutoSaveStatus("saving");

    try {
      let slug = formData.slug;
      if (!slug) {
        slug = formData.page_name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "")
          .substring(0, 40);
      }

      const RESERVED_SLUGS = [
        "admin",
        "dashboard",
        "login",
        "auth",
        "register",
        "signup",
        "pricing",
        "api",
        "404",
        "suporte",
        "ajuda",
        "termos",
        "settings",
        "profile",
        "user",
        "users",
        "pages",
        "page",
        "edit",
        "new",
        "create",
        "delete",
        "p",
        "app",
        "home",
        "index",
        "about",
        "contact",
        "blog",
        "checkout",
        "cart",
        "account",
        "subscription",
        "payment",
        "privacy",
        "terms",
        "help",
      ];

      if (RESERVED_SLUGS.includes(slug.toLowerCase().trim())) {
        setAutoSaveStatus("error");
        return;
      }

      // Include headline sizes in the content JSON for persistence
      const contentWithSizes = {
        ...(formData.content as any),
        headline_size_mobile: formData.headline_size_mobile,
        headline_size_desktop: formData.headline_size_desktop,
        google_tag_id: formData.google_tag_id,
      };

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
        cover_image_url: formData.cover_image_url || null,
        cta_text: formData.cta_text || null,
        cta_url: formData.cta_url || null,
        cta_delay_enabled: formData.cta_delay_enabled,
        cta_delay_percentage: formData.cta_delay_percentage,
        whatsapp_number: formData.whatsapp_number || null,
        pix_pixel_id: formData.pix_pixel_id || null,
        facebook_pixel_id: formData.facebook_pixel_id || null,
        colors: formData.colors as unknown as Json,
        primary_color: formData.primary_color,
        content: contentWithSizes as unknown as Json,
        is_published: true,
      };

      const { error } = await supabase.from("landing_pages").update(pageData).eq("id", existingPageId);

      if (error) {
        console.error("Auto-save error:", error);
        setAutoSaveStatus("error");
        return;
      }

      setFormData((prev) => ({ ...prev, slug }));
      lastFormDataRef.current = JSON.stringify({ ...formData, slug });
      setAutoSaveStatus("saved");

      // Reset to idle after 2 seconds
      setTimeout(() => setAutoSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setAutoSaveStatus("error");
    }
  }, [user, existingPageId, formData]);

  // Trigger auto-save on formData changes (debounced 3 seconds)
  useEffect(() => {
    if (!existingPageId || !user) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, 3000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, existingPageId, user, performAutoSave]);

  // Initialize lastFormDataRef after loading
  useEffect(() => {
    if (!isLoading && existingPageId) {
      lastFormDataRef.current = JSON.stringify(formData);
    }
  }, [isLoading, existingPageId]);

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

      // Check availability logic omitted for brevity, keeping existing save logic...
      // (Mantive a lógica original de salvamento para focar no layout)
      // Include headline sizes and hero image sizes in the content JSON for persistence
      const contentWithSizes = {
        ...(formData.content as any),
        headline_size_mobile: formData.headline_size_mobile,
        headline_size_desktop: formData.headline_size_desktop,
        hero_image_size_mobile: formData.hero_image_size_mobile,
        hero_image_size_desktop: formData.hero_image_size_desktop,
      };

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
        cover_image_url: formData.cover_image_url || null,
        cta_text: formData.cta_text || null,
        cta_url: formData.cta_url || null,
        cta_delay_enabled: formData.cta_delay_enabled,
        cta_delay_percentage: formData.cta_delay_percentage,
        whatsapp_number: formData.whatsapp_number || null,
        pix_pixel_id: formData.pix_pixel_id || null,
        facebook_pixel_id: formData.facebook_pixel_id || null,
        colors: formData.colors as unknown as Json,
        primary_color: formData.primary_color,
        content: contentWithSizes as unknown as Json,
        is_published: true,
      };

      if (existingPageId) {
        const { error } = await supabase.from("landing_pages").update(pageData).eq("id", existingPageId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("landing_pages").insert(pageData).select().single();

        if (error) throw error;

        setExistingPageId(data.id);
        navigate(`/edit/${data.id}`, { replace: true });
      }

      setFormData((prev) => ({ ...prev, slug }));
      lastSavedSlugRef.current = slug;

      toast({
        title: "Página salva!",
        description: `Sua página está disponível em /p/${slug}`,
      });
    } catch (error: unknown) {
      console.error("Error saving page:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar sua página.",
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (lastSavedSlugRef.current) {
      window.open(`${window.location.origin}/p/${lastSavedSlugRef.current}`, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getAIPageType = (templateType: TemplateType): "sales" | "vsl" | "bio" => {
    if (templateType === "bio") return "bio";
    if (templateType === "sales") return "sales";
    return "vsl";
  };

  return (
    <AICopywriterProvider initialPageType={getAIPageType(formData.template_type)}>
      <div className="min-h-screen bg-gray-100 flex flex-col h-screen overflow-hidden">
        {/* Header - Always visible */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-14 flex-none">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                {formData.template_type === "sales" ? (
                  <ShoppingBag className="w-5 h-5 text-primary" />
                ) : formData.template_type === "bio" ? (
                  <LinkIcon className="w-5 h-5 text-primary" />
                ) : (
                  <Play className="w-5 h-5 text-primary" />
                )}
                <span className="font-semibold text-gray-900 hidden sm:inline">
                  {formData.template_type === "sales"
                    ? "Página de Vendas"
                    : formData.template_type === "bio"
                      ? "Bio Link"
                      : "VSL Página"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Settings Button */}
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

              {/* Auto-save status */}
              {existingPageId && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 mr-1">
                  {autoSaveStatus === "saving" && (
                    <>
                      <Cloud className="w-3.5 h-3.5 animate-pulse" />
                      <span>Salvando...</span>
                    </>
                  )}
                  {autoSaveStatus === "saved" && (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-600">Salvo</span>
                    </>
                  )}
                  {autoSaveStatus === "error" && <span className="text-red-500">Erro ao salvar</span>}
                </div>
              )}

              <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
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

        {/* Main Content with Fixed Viewport Calculation */}
        {/* Use calc(100vh - 3.5rem) where 3.5rem is the 56px header */}
        <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden">
          {/* Desktop Sidebar - Now scrolls independently */}
          <div className="hidden lg:block h-full overflow-hidden">
            {formData.template_type === "sales" ? (
              <SectionBuilderSidebar formData={formData} onChange={handleChange} userPlan={userPlan} />
            ) : formData.template_type === "bio" ? (
              <BioEditorSidebar formData={formData} onChange={handleChange} userPlan={userPlan} />
            ) : formData.template_type === "capture-hero" ? (
              <CaptureHeroEditorSidebar formData={formData} onChange={handleChange} userPlan={userPlan} />
            ) : (
              <EditorSidebar formData={formData} onChange={handleChange} userPlan={userPlan} />
            )}
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex border-b border-gray-200 bg-white flex-none">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "form" ? "text-primary border-b-2 border-primary" : "text-gray-500"
                }`}
              >
                Editar
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "preview" ? "text-primary border-b-2 border-primary" : "text-gray-500"
                }`}
              >
                Visualizar
              </button>
            </div>

            {/* Mobile Form View */}
            <div className={`lg:hidden flex-1 overflow-y-auto bg-white ${activeTab === "form" ? "block" : "hidden"}`}>
              {formData.template_type === "sales" ? (
                <SectionBuilderSidebar formData={formData} onChange={handleChange} userPlan={userPlan} />
              ) : formData.template_type === "bio" ? (
                <BioEditorSidebar formData={formData} onChange={handleChange} userPlan={userPlan} />
              ) : formData.template_type === "capture-hero" ? (
                <CaptureHeroEditorSidebar formData={formData} onChange={handleChange} userPlan={userPlan} />
              ) : (
                <EditorSidebar formData={formData} onChange={handleChange} userPlan={userPlan} />
              )}
            </div>

            {/* Mobile Preview View */}
            <div className={`lg:hidden flex-1 flex flex-col bg-gray-50 ${activeTab === "preview" ? "flex" : "hidden"}`}>
              <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                <IPhoneMockup formData={formData} size="large" />
              </div>
            </div>

            {/* Desktop Preview Area (Canvas) - Fixed, centered, with internal scroll if needed */}
            <div className="hidden lg:flex flex-1 items-center justify-center gap-8 p-8 h-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 overflow-y-auto">
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
    </AICopywriterProvider>
  );
};

export default TrustPageEditor;
