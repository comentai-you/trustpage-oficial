import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Calendar, User, ArrowLeft, Share2, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TableOfContents from "@/components/blog/TableOfContents";
import ArticleContentWithCTA from "@/components/blog/ArticleContentWithCTA";
import AuthorSidebar from "@/components/blog/AuthorSidebar";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string;
  author_name: string;
  meta_title: string | null;
  meta_description: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .not("published_at", "is", null)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });

  // Fetch category info if post has category_id
  const { data: category } = useQuery({
    queryKey: ["blog-category", post?.category_id],
    queryFn: async () => {
      if (!post?.category_id) return null;
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug")
        .eq("id", post.category_id)
        .single();

      if (error) return null;
      return data as Category;
    },
    enabled: !!post?.category_id,
  });

  // Dynamic SEO Meta Tags
  useEffect(() => {
    if (!post) return;

    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt || "";

    document.title = `${title} | Blog TrustPage`;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    const ogTags = [
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: window.location.href },
      ...(post.cover_image_url ? [{ property: "og:image", content: post.cover_image_url }] : []),
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

    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(post.cover_image_url ? [{ name: "twitter:image", content: post.cover_image_url }] : []),
    ];

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    let articlePublished = document.querySelector('meta[property="article:published_time"]');
    if (!articlePublished) {
      articlePublished = document.createElement("meta");
      articlePublished.setAttribute("property", "article:published_time");
      document.head.appendChild(articlePublished);
    }
    articlePublished.setAttribute("content", post.published_at);

    return () => {
      document.title = "TrustPage";
    };
  }, [post]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || "",
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">Este artigo não existe ou foi removido.</p>
          <Button onClick={() => navigate("/blog")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Blog
          </Button>
        </div>
      </div>
    );
  }

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
                to="/blog" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
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

      {isLoading ? (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <Skeleton className="aspect-video w-full mb-8 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ) : post ? (
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="flex gap-8 max-w-7xl mx-auto">
            {/* Table of Contents - Desktop Sidebar */}
            <TableOfContents content={post.content} />
            
            {/* Author Sidebar - Desktop */}
            <AuthorSidebar />

            {/* Main Article Content */}
            <article className="flex-1 max-w-4xl">
              {/* Back Button */}
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o Blog
              </Link>

              {/* Article Header */}
              <header className="mb-8">
                {/* Category Badge */}
                {category && (
                  <Link 
                    to={`/blog?category=${category.id}`}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {category.name}
                  </Link>
                )}

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author_name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="ml-auto"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>

                {post.excerpt && (
                  <p className="text-lg text-muted-foreground border-l-4 border-primary pl-4">
                    {post.excerpt}
                  </p>
                )}
              </header>

              {/* Cover Image */}
              {post.cover_image_url && (
                <div className="aspect-video overflow-hidden rounded-xl mb-10">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Content with Contextual CTA */}
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground">
                <ArticleContentWithCTA 
                  content={post.content}
                  categorySlug={category?.slug || null}
                  categoryName={category?.name || null}
                />
              </div>

              {/* Article Footer */}
              <footer className="mt-12 pt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o Blog
                  </Link>
                  <Button onClick={handleShare} variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar este artigo
                  </Button>
                </div>
              </footer>
            </article>
          </div>
        </div>
      ) : null}

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

export default BlogPostPage;
