import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LandingPageFormData } from "@/types/landing-page";
import ImageUpload from "./ImageUpload";
import { Link2, Check, X, Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PerfilTabProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
  existingPageId?: string | null;
}

const RESERVED_SLUGS = [
  'admin', 'dashboard', 'login', 'auth', 'register', 'signup', 
  'pricing', 'api', '404', 'suporte', 'ajuda', 'termos',
  'settings', 'profile', 'user', 'users', 'pages', 'page',
  'edit', 'new', 'create', 'delete', 'p', 'app', 'home',
  'about', 'contact', 'blog', 'checkout', 'cart', 'account'
];

const generateSlugFromName = (name: string): string => {
  if (!name.trim()) return "";
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

const PerfilTab = ({ formData, onChange, existingPageId }: PerfilTabProps) => {
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid' | 'reserved'>('idle');
  const [hasCustomSlug, setHasCustomSlug] = useState(!!formData.slug);

  const generatedSlug = generateSlugFromName(formData.page_name);
  const displaySlug = formData.slug || generatedSlug || "seu-link";

  // Check slug availability
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugStatus('invalid');
      return;
    }

    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      setSlugStatus('reserved');
      return;
    }

    // Validate format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length > 1) {
      if (slug.length === 2 && /^[a-z0-9]{2}$/.test(slug)) {
        // Valid 2-char slug
      } else {
        setSlugStatus('invalid');
        return;
      }
    }

    setSlugStatus('checking');

    const { data, error } = await supabase
      .from("landing_pages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      setSlugStatus('idle');
      return;
    }

    if (!data || (existingPageId && data.id === existingPageId)) {
      setSlugStatus('available');
    } else {
      setSlugStatus('unavailable');
    }
  }, [existingPageId]);

  // Debounced check when editing
  useEffect(() => {
    if (!isEditingSlug || !slugInput) return;

    const timer = setTimeout(() => {
      checkSlugAvailability(slugInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [slugInput, isEditingSlug, checkSlugAvailability]);

  const handleStartEditing = () => {
    setIsEditingSlug(true);
    setSlugInput(formData.slug || generatedSlug);
    setSlugStatus('idle');
  };

  const handleSlugChange = (value: string) => {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .substring(0, 40);
    setSlugInput(normalized);
    setSlugStatus('idle');
  };

  const handleSaveSlug = () => {
    if (slugStatus === 'available' || slugStatus === 'idle') {
      onChange({ slug: slugInput });
      setHasCustomSlug(true);
      setIsEditingSlug(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingSlug(false);
    setSlugInput("");
    setSlugStatus('idle');
  };

  const handleResetToAuto = () => {
    onChange({ slug: "" });
    setHasCustomSlug(false);
    setIsEditingSlug(false);
  };

  const getStatusIcon = () => {
    switch (slugStatus) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'unavailable':
      case 'invalid':
      case 'reserved':
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (slugStatus) {
      case 'available':
        return <span className="text-green-500 text-xs">Disponível!</span>;
      case 'unavailable':
        return <span className="text-destructive text-xs">Já está em uso</span>;
      case 'invalid':
        return <span className="text-destructive text-xs">Mín. 2 caracteres, apenas letras, números e hífen</span>;
      case 'reserved':
        return <span className="text-destructive text-xs">Nome reservado pelo sistema</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Image Upload */}
      <ImageUpload
        value={formData.profile_image_url}
        onChange={(url) => onChange({ profile_image_url: url })}
        label="Foto de Perfil"
        hint="Imagem quadrada recomendada (300x300)"
        aspectRatio="square"
      />

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="page_name">
          Nome do Negócio <span className="text-destructive">*</span>
        </Label>
        <Input
          id="page_name"
          placeholder="Ex: Método Emagrecer Rápido"
          value={formData.page_name}
          onChange={(e) => onChange({ page_name: e.target.value })}
          required
        />
      </div>

      {/* Slug / URL Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Link da Página</Label>
          {!isEditingSlug && (
            <button
              type="button"
              onClick={handleStartEditing}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Personalizar
            </button>
          )}
        </div>

        {isEditingSlug ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-2 rounded-l-md border border-r-0 border-border">
                    /p/
                  </span>
                  <Input
                    value={slugInput}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="rounded-l-none"
                    placeholder="meu-link"
                    autoFocus
                  />
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              {getStatusMessage()}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveSlug}
                  disabled={slugStatus === 'unavailable' || slugStatus === 'invalid' || slugStatus === 'reserved' || slugStatus === 'checking'}
                  className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className={cn(
              "flex items-center gap-2 p-2.5 rounded-lg border border-border",
              hasCustomSlug ? "bg-primary/5" : "bg-muted/50"
            )}>
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground truncate flex-1">
                <span className="opacity-60">seusite.com/p/</span>
                <span className="font-medium text-foreground">{displaySlug}</span>
              </p>
              {hasCustomSlug && (
                <button
                  type="button"
                  onClick={handleResetToAuto}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  title="Usar link automático"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasCustomSlug 
                ? "Link personalizado. Clique no X para usar o automático."
                : "Link gerado automaticamente. Clique em 'Personalizar' para editar."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilTab;
