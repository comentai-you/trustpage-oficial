import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Sparkles, ExternalLink, BarChart3, Copy, Trash2 } from "lucide-react";

const TrustPageDashboard = () => {
  // Mock data - will be replaced with Supabase data
  const [pages] = useState([
    {
      id: '1',
      page_name: 'Curso de Marketing Digital',
      slug: 'curso-marketing',
      views: 1234,
      is_published: true,
      updated_at: '2024-01-15'
    }
  ]);

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

        {pages.length === 0 ? (
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
                      <CardTitle className="text-base">{page.page_name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        trustpage.com/{page.slug}
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
                      <span>{page.views} views</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/edit/${page.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Editar
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
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
