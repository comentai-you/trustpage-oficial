import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import BlogSearchFilters from "@/components/blog/BlogSearchFilters";
import BlogPagination from "@/components/blog/BlogPagination";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string;
  author_name: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

const POSTS_PER_PAGE = 9;

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, published_at, author_name, category_id")
        .eq("is_published", true)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug, color")
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesCategory =
        selectedCategory === null || post.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  // Paginate filtered posts
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Blog - TrustPage | Dicas de Marketing e Conversão";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", "Aprenda estratégias de marketing digital, landing pages de alta conversão e técnicas de vendas online. Artigos exclusivos do TrustPage.");

    const ogTags = [
      { property: "og:title", content: "Blog - TrustPage" },
      { property: "og:description", content: "Aprenda estratégias de marketing digital e técnicas de conversão." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: window.location.href },
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    return () => {
      document.title = "TrustPage";
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">TrustPage</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                to="/auth" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Entrar
              </Link>
              <Link 
                to="/auth" 
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Começar Grátis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Blog TrustPage
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Aprenda a Criar Páginas que{" "}
            <span className="text-primary">Convertem</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Dicas, estratégias e tutoriais para transformar visitantes em clientes 
            usando landing pages de alta conversão.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <BlogSearchFilters
        categories={categories}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
      />

      {/* Blog Posts Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Results count */}
          {(searchQuery || selectedCategory) && posts && (
            <p className="text-sm text-muted-foreground mb-6 text-center">
              {filteredPosts.length} {filteredPosts.length === 1 ? "artigo encontrado" : "artigos encontrados"}
              {searchQuery && ` para "${searchQuery}"`}
              {selectedCategory && categories.find(c => c.id === selectedCategory) && 
                ` em ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>
          )}

          {postsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedPosts && paginatedPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                  <article 
                    key={post.id} 
                    className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      {post.cover_image_url ? (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      <div className="p-6">
                        {/* Category Badge */}
                        {post.category_id && categories.find(c => c.id === post.category_id) && (
                          <span 
                            className="inline-block px-2 py-1 text-xs font-medium rounded-full mb-3 bg-primary/10 text-primary"
                          >
                            {categories.find(c => c.id === post.category_id)?.name}
                          </span>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(post.published_at), "d 'de' MMM, yyyy", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author_name}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                          Ler artigo
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery || selectedCategory 
                  ? "Nenhum artigo encontrado" 
                  : "Nenhum artigo publicado ainda"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory 
                  ? "Tente ajustar os filtros ou buscar por outros termos."
                  : "Em breve teremos conteúdo incrível para você!"}
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-4 text-primary hover:underline font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Pronto para criar sua landing page?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Comece gratuitamente e crie páginas de alta conversão em minutos.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Criar Minha Página Grátis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TrustPage. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
