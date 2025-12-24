import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Sparkles, ExternalLink, BarChart3, Copy, Trash2, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LandingPage {
  id: string;
  page_name: string | null;
  slug: string;
  views: number | null;
  is_published: boolean | null;
  updated_at: string;
}

const TrustPageDashboard = () => {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPages();
    }
  }, [user]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("id, page_name, slug, views, is_published, updated_at")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Erro ao carregar suas páginas");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Você saiu da conta");
  };

  const handleDelete = async (id: string, pageName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${pageName || 'esta página'}"?`)) return;

    try {
      const { error } = await supabase
        .from("landing_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setPages(pages.filter(p => p.id !== id));
      toast.success("Página excluída com sucesso");
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Erro ao excluir página");
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">TrustPage</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Página
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Suas Landing Pages</h1>
          <p className="text-muted-foreground">Gerencie suas páginas de alta conversão</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Crie sua primeira página</h3>
                  <p className="text-muted-foreground">Comece a converter visitantes em clientes</p>
                </div>
                <Link to="/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Página
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Create New Card */}
            <Link to="/new">
              <Card className="h-full border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground">Nova Página</p>
                </CardContent>
              </Card>
            </Link>

            {/* Existing Pages */}
            {pages.map((page) => (
              <Card key={page.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{page.page_name || 'Sem nome'}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        /p/{page.slug}
                      </CardDescription>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      page.is_published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.is_published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{page.views || 0} views</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/edit/${page.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Editar
                      </Button>
                    </Link>
                    <Link to={`/p/${page.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleCopyLink(page.slug)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(page.id, page.page_name || '')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrustPageDashboard;
