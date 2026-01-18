import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import RichTextEditor from "@/components/ui/RichTextEditor";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Settings,
  Calendar,
  Loader2,
  ExternalLink,
  RefreshCw,
  Pencil,
  User,
  Upload,
  X,
  Tag,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  author_name: string;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const emptyPost: Partial<BlogPost> = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  cover_image_url: "",
  author_name: "TrustPage",
  is_published: false,
  meta_title: "",
  meta_description: "",
  tags: [],
};

const AdminBlogPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedPost, setSelectedPost] = useState<Partial<BlogPost> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isRebuildingSitemap, setIsRebuildingSitemap] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [newTag, setNewTag] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !data) {
        setIsAdmin(false);
        navigate("/dashboard");
        toast.error("Acesso negado");
        return;
      }
      
      setIsAdmin(true);
    };

    if (!authLoading && user) {
      checkAdmin();
    } else if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch all posts (admins can see drafts too)
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
    enabled: isAdmin === true,
  });

  // Save/Create post mutation
  const saveMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      if (!post.title || !post.content) {
        throw new Error("Título e conteúdo são obrigatórios");
      }

      const slug = post.slug || post.title.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (post.id) {
        // Update existing post
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: post.title,
            slug,
            content: post.content,
            excerpt: post.excerpt || null,
            cover_image_url: post.cover_image_url || null,
            author_name: post.author_name || "TrustPage",
            is_published: post.is_published || false,
            meta_title: post.meta_title || null,
            meta_description: post.meta_description || null,
            tags: post.tags || [],
            published_at: post.is_published && !post.published_at ? new Date().toISOString() : post.published_at,
          })
          .eq("id", post.id);
        if (error) throw error;
      } else {
        // Create new post
        const { error } = await supabase
          .from("blog_posts")
          .insert([{
            title: post.title,
            slug,
            content: post.content,
            excerpt: post.excerpt || null,
            cover_image_url: post.cover_image_url || null,
            author_name: post.author_name || "TrustPage",
            is_published: post.is_published || false,
            meta_title: post.meta_title || null,
            meta_description: post.meta_description || null,
            tags: post.tags || [],
            published_at: post.is_published ? new Date().toISOString() : null,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success(selectedPost?.id ? "Post atualizado!" : "Post criado!");
      setIsEditing(false);
      setSelectedPost(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Post excluído!");
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  const handleNewPost = () => {
    setSelectedPost({ ...emptyPost });
    setIsEditing(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost({ ...post });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedPost?.title || !selectedPost?.content) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }
    saveMutation.mutate(selectedPost);
  };

  const handleFieldChange = (field: keyof BlogPost, value: string | boolean | string[]) => {
    setSelectedPost(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('blog-content')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        handleFieldChange('cover_image_url', urlData.publicUrl);
        toast.success('Imagem de capa enviada!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  };

  // Tags management
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const currentTags = selectedPost?.tags || [];
    if (currentTags.includes(newTag.trim())) {
      toast.error('Tag já existe');
      return;
    }
    handleFieldChange('tags', [...currentTags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = selectedPost?.tags || [];
    handleFieldChange('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  // Generate slug preview
  const getSlugPreview = () => {
    const slug = selectedPost?.slug || (selectedPost?.title || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return slug ? `trustpageapp.com/blog/${slug}` : '';
  };

  // Rebuild sitemap via Vercel Deploy Hook
  const handleRebuildSitemap = async () => {
    const deployHookUrl = localStorage.getItem("vercel_deploy_hook");
    
    if (!deployHookUrl) {
      const url = prompt(
        "Cole a URL do Deploy Hook do Vercel.\n\n" +
        "Para criar: Vercel Dashboard → Seu Projeto → Settings → Git → Deploy Hooks\n" +
        "Crie um hook chamado 'Rebuild Sitemap' para a branch 'main'"
      );
      
      if (!url) return;
      localStorage.setItem("vercel_deploy_hook", url);
    }

    const hookUrl = localStorage.getItem("vercel_deploy_hook");
    if (!hookUrl) return;

    setIsRebuildingSitemap(true);
    try {
      const response = await fetch(hookUrl, { method: "POST" });
      
      if (response.ok) {
        toast.success("Deploy iniciado! O sitemap será atualizado em alguns minutos.");
      } else {
        throw new Error("Falha ao disparar deploy");
      }
    } catch (error) {
      toast.error("Erro ao disparar rebuild. Verifique a URL do Deploy Hook.");
      localStorage.removeItem("vercel_deploy_hook");
    } finally {
      setIsRebuildingSitemap(false);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  // Editor View
  if (isEditing && selectedPost) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-muted/30">
          {/* Editor Header */}
          <div className="sticky top-16 z-40 bg-background border-b border-border">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedPost(null);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="publish"
                    checked={selectedPost.is_published}
                    onCheckedChange={(checked) => handleFieldChange("is_published", checked)}
                  />
                  <Label htmlFor="publish" className="text-sm">
                    {selectedPost.is_published ? "Publicado" : "Rascunho"}
                  </Label>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Editor/Preview Tabs */}
            <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as "edit" | "preview")} className="mb-6">
              <TabsList className="grid w-full max-w-xs grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  Editar
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {editorTab === "edit" ? (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Conteúdo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título do Post *</Label>
                        <Input
                          id="title"
                          value={selectedPost.title || ""}
                          onChange={(e) => handleFieldChange("title", e.target.value)}
                          placeholder="Ex: Como Criar Landing Pages que Convertem"
                          className="text-lg font-semibold"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="excerpt">Resumo (Excerpt)</Label>
                        <Textarea
                          id="excerpt"
                          value={selectedPost.excerpt || ""}
                          onChange={(e) => handleFieldChange("excerpt", e.target.value)}
                          placeholder="Um breve resumo do artigo para preview e SEO..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo *</Label>
                        <RichTextEditor
                          value={selectedPost.content || ""}
                          onChange={(markdown) => handleFieldChange("content", markdown)}
                          placeholder="Escreva seu artigo aqui..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Imagem de Capa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {selectedPost.cover_image_url ? (
                          <div className="relative">
                            <div className="aspect-video rounded-lg overflow-hidden border border-border">
                              <img
                                src={selectedPost.cover_image_url}
                                alt="Cover"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => handleFieldChange("cover_image_url", "")}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => coverInputRef.current?.click()}
                            className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/30"
                          >
                            {isUploadingCover ? (
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Clique para enviar
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          Recomendado: 1200x630px (proporção 16:9)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Nova tag..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button onClick={handleAddTag} size="icon" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {(selectedPost.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(selectedPost.tags || []).map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        SEO & Configurações
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input
                          id="slug"
                          value={selectedPost.slug || ""}
                          onChange={(e) => handleFieldChange("slug", e.target.value)}
                          placeholder="meu-artigo-incrivel"
                        />
                        {getSlugPreview() && (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <LinkIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">
                              {getSlugPreview()}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Deixe vazio para gerar automaticamente
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="author">Autor</Label>
                        <Input
                          id="author"
                          value={selectedPost.author_name || ""}
                          onChange={(e) => handleFieldChange("author_name", e.target.value)}
                          placeholder="TrustPage"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                        <Input
                          id="metaTitle"
                          value={selectedPost.meta_title || ""}
                          onChange={(e) => handleFieldChange("meta_title", e.target.value)}
                          placeholder="Título otimizado para Google"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="metaDesc">Meta Description (SEO)</Label>
                        <Textarea
                          id="metaDesc"
                          value={selectedPost.meta_description || ""}
                          onChange={(e) => handleFieldChange("meta_description", e.target.value)}
                          placeholder="Descrição para resultados de busca..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="max-w-4xl mx-auto">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Preview Header */}
                    <div className="bg-muted/50 border-b px-6 py-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Visualização do artigo como será exibido no blog
                      </p>
                    </div>

                    {/* Preview Content */}
                    <article className="p-6 md:p-10">
                      {/* Title */}
                      <header className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                          {selectedPost.title || "Título do Artigo"}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {selectedPost.author_name || "TrustPage"}
                          </span>
                        </div>

                        {selectedPost.excerpt && (
                          <p className="text-lg text-muted-foreground border-l-4 border-primary pl-4">
                            {selectedPost.excerpt}
                          </p>
                        )}
                      </header>

                      {/* Cover Image */}
                      {selectedPost.cover_image_url && (
                        <div className="aspect-video overflow-hidden rounded-xl mb-10">
                          <img
                            src={selectedPost.cover_image_url}
                            alt={selectedPost.title || "Cover"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Article Content */}
                      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground">
                        {selectedPost.content ? (
                          <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Comece a escrever para ver o preview aqui...
                          </p>
                        )}
                      </div>
                    </article>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // List View
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Blog CMS</h1>
              <p className="text-muted-foreground">Gerencie os artigos do blog</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRebuildSitemap}
              disabled={isRebuildingSitemap}
            >
              {isRebuildingSitemap ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Atualizar Sitemap
            </Button>
            <Button onClick={handleNewPost}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Artigo
            </Button>
          </div>
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {post.cover_image_url && (
                    <div className="w-full md:w-48 h-32 md:h-auto shrink-0">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              post.is_published
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {post.is_published ? "Publicado" : "Rascunho"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{post.title}</h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {post.is_published && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setPostToDelete(post);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum artigo ainda
              </h3>
              <p className="text-muted-foreground mb-6">
                Comece criando seu primeiro artigo para o blog
              </p>
              <Button onClick={handleNewPost}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Artigo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Artigo</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Tem certeza que deseja excluir "{postToDelete?.title}"? Esta ação não pode ser desfeita.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => postToDelete && deleteMutation.mutate(postToDelete.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminBlogPage;
