import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Eye, GripVertical, Settings, ExternalLink, Loader2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuizQuestion, QuizOption } from "@/types/quiz";
import { getQuizPublicUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/trustpage/ImageUpload";

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultQuestion: () => QuizQuestion = () => ({
  id: generateId(),
  text: "Nova pergunta",
  options: [
    { label: "Opção 1", value: "opcao_1" },
    { label: "Opção 2", value: "opcao_2" },
  ],
});

const QuizEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("perguntas");

  // Form state
  const [title, setTitle] = useState("Meu Quiz");
  const [pageName, setPageName] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#8B5CF6");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([defaultQuestion()]);

  useEffect(() => {
    if (isEditing) {
      fetchQuiz();
    } else {
      // Generate initial slug
      setSlug(`quiz-${generateId()}`);
      setLoading(false);
    }
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setPageName(data.page_name || "");
        setCoverImageUrl(data.cover_image_url || "");
        setDescription(data.description || "");
        setSlug(data.slug);
        setRedirectUrl(data.redirect_url || "");
        setPrimaryColor(data.primary_color || "#8B5CF6");
        setIsPublished(data.is_published || false);
        // Parse questions from JSONB
        const parsedQuestions = data.questions as unknown;
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          setQuestions(parsedQuestions as QuizQuestion[]);
        }
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Erro ao carregar quiz");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!title.trim()) {
      toast.error("Digite um título para o quiz");
      return;
    }

    if (!slug.trim()) {
      toast.error("Digite um slug para o quiz");
      return;
    }

    if (questions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta");
      return;
    }

    setSaving(true);

    try {
      const quizPayload = {
        user_id: user.id,
        title: title.trim(),
        page_name: pageName.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        description: description.trim() || null,
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        redirect_url: redirectUrl.trim() || null,
        primary_color: primaryColor,
        is_published: isPublished,
        questions: JSON.parse(JSON.stringify(questions)),
      };

      if (isEditing) {
        const { error } = await supabase
          .from("quizzes")
          .update(quizPayload)
          .eq("id", id);

        if (error) throw error;
        toast.success("Quiz atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from("quizzes")
          .insert(quizPayload)
          .select("id")
          .single();

        if (error) {
          if (error.code === '23505') {
            toast.error("Esse slug já está em uso. Escolha outro.");
            return;
          }
          throw error;
        }
        toast.success("Quiz criado com sucesso!");
        navigate(`/dashboard/quiz/edit/${data.id}`);
      }
    } catch (error: unknown) {
      console.error("Error saving quiz:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar quiz";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
    setActiveQuestionIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("O quiz precisa ter pelo menos uma pergunta");
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (activeQuestionIndex >= newQuestions.length) {
      setActiveQuestionIndex(Math.max(0, newQuestions.length - 1));
    }
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const addOption = () => {
    const question = questions[activeQuestionIndex];
    const newOptions = [
      ...question.options,
      { label: `Opção ${question.options.length + 1}`, value: `opcao_${question.options.length + 1}` },
    ];
    updateQuestion(activeQuestionIndex, { options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    const question = questions[activeQuestionIndex];
    if (question.options.length <= 2) {
      toast.error("Uma pergunta precisa ter pelo menos 2 opções");
      return;
    }
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion(activeQuestionIndex, { options: newOptions });
  };

  const updateOption = (optionIndex: number, updates: Partial<QuizOption>) => {
    const question = questions[activeQuestionIndex];
    const newOptions = [...question.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
    updateQuestion(activeQuestionIndex, { options: newOptions });
  };

  const handlePreview = () => {
    if (isEditing && isPublished) {
      window.open(getQuizPublicUrl(slug), '_blank');
    } else {
      toast.info("Salve e publique o quiz para visualizar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeQuestion = questions[activeQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {isEditing ? "Editar Quiz" : "Novo Quiz"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Quiz Builder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && isPublished && (
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Questions Timeline */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Perguntas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors group",
                      activeQuestionIndex === index
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted border border-transparent"
                    )}
                    onClick={() => setActiveQuestionIndex(index)}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {index + 1}. {q.text || "Sem título"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {q.options.length} opções
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(index);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={addQuestion}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="perguntas">Pergunta Ativa</TabsTrigger>
                <TabsTrigger value="configuracoes">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="perguntas">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Pergunta {activeQuestionIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div className="space-y-2">
                      <Label>Texto da Pergunta</Label>
                      <Textarea
                        placeholder="Digite sua pergunta aqui..."
                        value={activeQuestion?.text || ""}
                        onChange={(e) =>
                          updateQuestion(activeQuestionIndex, { text: e.target.value })
                        }
                        rows={2}
                      />
                    </div>

                    {/* Question Image */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Imagem da Pergunta (opcional)
                      </Label>
                      <div className="flex items-start gap-4">
                        <ImageUpload
                          value={activeQuestion?.imageUrl || ""}
                          onChange={(url) =>
                            updateQuestion(activeQuestionIndex, { imageUrl: url })
                          }
                          label=""
                          hint=""
                          aspectRatio="square"
                        />
                        <div className="text-xs text-muted-foreground pt-2">
                          <p>Tamanho recomendado: <strong>400x300px</strong></p>
                          <p className="mt-1">Formatos: PNG, JPG até 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Opções de Resposta</Label>
                        <Button variant="outline" size="sm" onClick={addOption}>
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {activeQuestion?.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <Input
                              placeholder={`Opção ${index + 1}`}
                              value={option.label}
                              onChange={(e) =>
                                updateOption(index, {
                                  label: e.target.value,
                                  value: e.target.value
                                    .toLowerCase()
                                    .replace(/\s+/g, "_")
                                    .replace(/[^a-z0-9_]/g, ""),
                                })
                              }
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(index)}
                            >
                              <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuracoes">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configurações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Page Name - for dashboard identification */}
                    <div className="space-y-2">
                      <Label>Nome da Página (Dashboard)</Label>
                      <Input
                        placeholder="Ex: Quiz Perfil de Investidor"
                        value={pageName}
                        onChange={(e) => setPageName(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Este nome aparece no seu dashboard para identificar o quiz
                      </p>
                    </div>

                    {/* Cover Image - for dashboard thumbnail */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Imagem de Capa (Dashboard)
                      </Label>
                      <div className="flex items-start gap-4">
                        <ImageUpload
                          value={coverImageUrl}
                          onChange={setCoverImageUrl}
                          label=""
                          hint=""
                          aspectRatio="square"
                        />
                        <div className="text-xs text-muted-foreground pt-2">
                          <p>Tamanho recomendado: <strong>240x320px</strong></p>
                          <p className="mt-1">Formatos: PNG, JPG até 5MB</p>
                          <p className="mt-1 text-primary/70">Esta imagem aparece como thumbnail no dashboard</p>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border pt-6">
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Configurações do Quiz</h4>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label>Título do Quiz</Label>
                      <Input
                        placeholder="Ex: Descubra seu perfil"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Título que aparece na tela inicial do quiz para o usuário
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Descrição (opcional)</Label>
                      <Textarea
                        placeholder="Uma breve descrição que aparece na tela inicial..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <Label>Slug (URL)</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">/q/</span>
                        <Input
                          placeholder="descubra-seu-perfil"
                          value={slug}
                          onChange={(e) =>
                            setSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, "")
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Redirect URL */}
                    <div className="space-y-2">
                      <Label>URL de Redirecionamento</Label>
                      <Input
                        placeholder="https://seusite.com/checkout"
                        value={redirectUrl}
                        onChange={(e) => setRedirectUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        O usuário será redirecionado para esta URL após completar o quiz
                      </p>
                    </div>

                    {/* Primary Color */}
                    <div className="space-y-2">
                      <Label>Cor Principal</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </div>

                    {/* Published */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <Label>Publicar Quiz</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Deixe público para os usuários acessarem
                        </p>
                      </div>
                      <Switch
                        checked={isPublished}
                        onCheckedChange={setIsPublished}
                      />
                    </div>

                    {isEditing && isPublished && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <Label className="text-sm">Link público:</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="flex-1 text-sm bg-background px-3 py-2 rounded border truncate">
                            {getQuizPublicUrl(slug)}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(getQuizPublicUrl(slug));
                              toast.success("Link copiado!");
                            }}
                          >
                            Copiar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;
