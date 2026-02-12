import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Loader2, Settings2, Newspaper, Check, Cloud } from "lucide-react";
import { PUBLIC_PAGES_BASE_URL } from "@/lib/constants";
import { AdvertorialContent, defaultAdvertorialContent } from "@/types/advertorial";
import AdvertorialEditorSidebar from "@/components/trustpage/editor/AdvertorialEditorSidebar";
import AdvertorialIMacMockup from "@/components/trustpage/editor/AdvertorialIMacMockup";
import AdvertorialIPhoneMockup from "@/components/trustpage/editor/AdvertorialIPhoneMockup";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const AdvertorialEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [pageName, setPageName] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState<AdvertorialContent>(defaultAdvertorialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [existingPageId, setExistingPageId] = useState<string | null>(null);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const lastSavedSlugRef = useRef<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("plan_type").eq("id", user.id).maybeSingle();
      if (profile?.plan_type) setUserPlan(profile.plan_type);

      if (id) {
        setIsLoading(true);
        const { data: page, error } = await supabase.from("landing_pages").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
        if (error || !page) {
          toast({ title: "Página não encontrada", description: "A página que você está tentando editar não existe.", variant: "destructive" });
          navigate("/dashboard");
          return;
        }
        setExistingPageId(page.id);
        setPageName(page.page_name || "");
        setSlug(page.slug);
        const savedContent = page.content as unknown as AdvertorialContent;
        if (savedContent) setContent({ ...defaultAdvertorialContent, ...savedContent });
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user, navigate, toast]);

  const handleContentChange = useCallback((updates: Partial<AdvertorialContent>) => {
    setContent((prev) => ({ ...prev, ...updates }));
  }, []);

  const generateSlugFromName = (name: string): string => {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").substring(0, 40);
  };

  // Auto-save
  const performAutoSave = useCallback(async () => {
    if (!user || !existingPageId) return;
    const currentData = JSON.stringify({ pageName, slug, content });
    if (currentData === lastDataRef.current || !pageName.trim()) return;
    setAutoSaveStatus("saving");
    try {
      const { error } = await supabase.from("landing_pages").update({
        user_id: user.id,
        slug: slug || generateSlugFromName(pageName),
        template_type: "advertorial",
        page_name: pageName,
        content: content as unknown as Json,
        is_published: true,
        back_redirect_enabled: content.backRedirectEnabled || false,
        back_redirect_url: content.backRedirectUrl || null,
        colors: { primary: content.ctaColor, background: '#ffffff', text: '#111827', buttonBg: content.ctaColor, buttonText: '#FFFFFF' } as unknown as Json,
      }).eq("id", existingPageId);
      if (error) { setAutoSaveStatus("error"); return; }
      lastDataRef.current = currentData;
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 2000);
    } catch { setAutoSaveStatus("error"); }
  }, [user, existingPageId, pageName, slug, content]);

  useEffect(() => {
    if (!existingPageId || !user) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => performAutoSave(), 3000);
    return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current); };
  }, [pageName, slug, content, existingPageId, user, performAutoSave]);

  useEffect(() => {
    if (!isLoading && existingPageId) lastDataRef.current = JSON.stringify({ pageName, slug, content });
  }, [isLoading, existingPageId]);

  const handleSave = async () => {
    lastSavedSlugRef.current = null;
    if (!user) { toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" }); return; }
    if (!pageName.trim()) { toast({ title: "Nome obrigatório", description: "Insira um nome para sua página.", variant: "destructive" }); return; }
    setIsSaving(true);
    try {
      let finalSlug = slug || generateSlugFromName(pageName);
      const pageData = {
        user_id: user.id,
        slug: finalSlug,
        template_id: 1,
        template_type: "advertorial",
        page_name: pageName,
        headline: content.headline,
        subheadline: content.subheadline,
        cta_text: content.ctaText,
        cta_url: content.ctaUrl,
        content: content as unknown as Json,
        is_published: true,
        back_redirect_enabled: content.backRedirectEnabled || false,
        back_redirect_url: content.backRedirectUrl || null,
        colors: { primary: content.ctaColor, background: '#ffffff', text: '#111827', buttonBg: content.ctaColor, buttonText: '#FFFFFF' } as unknown as Json,
      };
      if (existingPageId) {
        const { error } = await supabase.from("landing_pages").update(pageData).eq("id", existingPageId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("landing_pages").insert(pageData).select().single();
        if (error) throw error;
        setExistingPageId(data.id);
        navigate(`/advertorial/edit/${data.id}`, { replace: true });
      }
      setSlug(finalSlug);
      lastSavedSlugRef.current = finalSlug;
      toast({ title: "Página salva!", description: `Seu advertorial está disponível em /p/${finalSlug}` });
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro ao salvar.";
      if (error && typeof error === 'object' && 'code' in error) {
        const pgError = error as { code: string; message?: string };
        if (pgError.code === '23505') errorMessage = "Já existe uma página com esse URL.";
        else if (pgError.message) errorMessage = pgError.message;
      }
      toast({ title: "Erro ao salvar", description: errorMessage, variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handlePreview = async () => {
    if (!pageName.trim()) { toast({ title: "Nome obrigatório", description: "Preencha o nome antes de visualizar.", variant: "destructive" }); return; }
    await handleSave();
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (lastSavedSlugRef.current) window.open(`${PUBLIC_PAGES_BASE_URL}/p/${lastSavedSlugRef.current}`, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-14 flex-none">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              <span className="font-semibold text-gray-900 hidden sm:inline">Advertorial Editor</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="lg:hidden text-gray-600" onClick={() => setShowMobileControls(true)}>
              <Settings2 className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview} className="border-gray-300 text-gray-700">
              <Eye className="w-4 h-4" /><span className="hidden sm:inline ml-2">Preview</span>
            </Button>
            {existingPageId && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 mr-1">
                {autoSaveStatus === "saving" && <><Cloud className="w-3.5 h-3.5 animate-pulse" /><span>Salvando...</span></>}
                {autoSaveStatus === "saved" && <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Salvo</span></>}
                {autoSaveStatus === "error" && <span className="text-red-500">Erro ao salvar</span>}
              </div>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span className="hidden sm:inline ml-2">Concluir</span></>}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="hidden lg:block h-full overflow-hidden">
          <AdvertorialEditorSidebar pageName={pageName} slug={slug} content={content} onPageNameChange={setPageName} onSlugChange={setSlug} onContentChange={handleContentChange} />
        </div>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex border-b border-gray-200 bg-white flex-none">
            <button onClick={() => setActiveTab("form")} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "form" ? "text-primary border-b-2 border-primary" : "text-gray-500"}`}>Editar</button>
            <button onClick={() => setActiveTab("preview")} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "preview" ? "text-primary border-b-2 border-primary" : "text-gray-500"}`}>Visualizar</button>
          </div>
          <div className={`lg:hidden flex-1 overflow-y-auto bg-white ${activeTab === "form" ? "block" : "hidden"}`}>
            <AdvertorialEditorSidebar pageName={pageName} slug={slug} content={content} onPageNameChange={setPageName} onSlugChange={setSlug} onContentChange={handleContentChange} />
          </div>
          <div className={`lg:hidden flex-1 flex flex-col bg-gray-50 ${activeTab === "preview" ? "flex" : "hidden"}`}>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <AdvertorialIPhoneMockup content={content} ownerPlan={userPlan} size="large" />
            </div>
          </div>
          <div className="hidden lg:block flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
            <div className="min-h-[900px] flex items-center justify-center gap-8 p-8">
              <div className="shrink-0"><AdvertorialIMacMockup content={content} ownerPlan={userPlan} /></div>
              <div className="shrink-0"><AdvertorialIPhoneMockup content={content} ownerPlan={userPlan} /></div>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={showMobileControls} onOpenChange={setShowMobileControls}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2"><Newspaper className="w-5 h-5 text-primary" /> Configurações</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-full">
            <AdvertorialEditorSidebar pageName={pageName} slug={slug} content={content} onPageNameChange={setPageName} onSlugChange={setSlug} onContentChange={handleContentChange} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdvertorialEditor;
