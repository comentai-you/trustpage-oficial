import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface RecentArticlesProps {
  currentPostId: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string;
}

const RecentArticles = ({ currentPostId }: RecentArticlesProps) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["recent-articles", currentPostId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, published_at")
        .eq("is_published", true)
        .not("published_at", "is", null)
        .neq("id", currentPostId)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as BlogPost[];
    },
    enabled: !!currentPostId,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-muted/30 to-muted/60">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Artigos Recentes
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-muted/60 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Artigos Recentes
          </h2>
          <Link
            to="/blog"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            Ver todos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group"
            >
              <Card className="overflow-hidden h-full bg-card hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                {post.cover_image_url ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xl font-bold">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(post.published_at), "d MMM yyyy", { locale: ptBR })}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos os artigos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentArticles;
