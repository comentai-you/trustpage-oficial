import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
  redirect_url: string | null;
  primary_color: string;
}

interface QuizViewProps {
  slugOverride?: string;
}

const QuizView = ({ slugOverride }: QuizViewProps) => {
  const { slug: routeSlug } = useParams();
  const navigate = useNavigate();
  
  const slug = slugOverride || routeSlug;

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 = cover screen
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchQuiz();
    }
  }, [slug]);

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, description, questions, redirect_url, primary_color, views")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;

      if (data) {
        const parsedQuestions = data.questions as unknown;
        setQuiz({
          ...data,
          questions: Array.isArray(parsedQuestions) ? (parsedQuestions as QuizQuestion[]) : [],
        });

        // Increment views directly
        await supabase
          .from("quizzes")
          .update({ views: (data.views || 0) + 1 })
          .eq("slug", slug);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setCurrentQuestionIndex(0);
  };

  const handleSelectOption = (questionId: string, optionValue: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionValue }));

    // Auto-advance after a brief delay
    setTimeout(() => {
      if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Last question - show analyzing screen
        handleComplete();
      }
    }, 400);
  };

  const handleComplete = async () => {
    setIsAnalyzing(true);

    // Fake loading for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Redirect
    if (quiz?.redirect_url) {
      window.location.href = quiz.redirect_url;
    } else {
      // If no redirect URL, show completion message
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: quiz?.primary_color || "#8B5CF6" }}
      >
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (notFound || !quiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Quiz não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          Este quiz pode ter sido removido ou o link está incorreto.
        </p>
        <Button onClick={() => navigate("/")}>Voltar ao início</Button>
      </div>
    );
  }

  const progress =
    quiz.questions.length > 0
      ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100
      : 0;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  // Analyzing screen
  if (isAnalyzing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: quiz.primary_color }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analisando suas respostas...</h2>
          <p className="text-white/80">Aguarde um momento</p>
        </motion.div>
      </div>
    );
  }

  // Cover screen
  if (currentQuestionIndex === -1) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: quiz.primary_color }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-white/80 text-lg mb-8">{quiz.description}</p>
          )}
          <Button
            size="lg"
            className="bg-white text-foreground hover:bg-white/90 font-semibold px-8 py-6 text-lg"
            onClick={handleStart}
          >
            Começar Quiz
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-white/60 text-sm mt-6">
            {quiz.questions.length} pergunta{quiz.questions.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
      </div>
    );
  }

  // Question screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <Progress
          value={progress}
          className="h-2 rounded-none"
          style={
            {
              "--progress-foreground": quiz.primary_color,
            } as React.CSSProperties
          }
        />
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} de {quiz.questions.length}
          </span>
          <span className="text-sm font-medium" style={{ color: quiz.primary_color }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-lg w-full"
          >
            {/* Question Image */}
            {currentQuestion.imageUrl && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img
                  src={currentQuestion.imageUrl}
                  alt=""
                  className="w-full h-auto max-h-48 object-cover"
                />
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-8 text-center">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSelectOption(currentQuestion.id, option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3",
                      isSelected
                        ? "border-current bg-current/10"
                        : "border-border hover:border-current/50 bg-card"
                    )}
                    style={
                      isSelected
                        ? { borderColor: quiz.primary_color, backgroundColor: `${quiz.primary_color}15` }
                        : undefined
                    }
                  >
                    <span
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                        isSelected ? "bg-current text-white" : "bg-muted text-muted-foreground"
                      )}
                      style={
                        isSelected
                          ? { backgroundColor: quiz.primary_color, color: "white" }
                          : undefined
                      }
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 font-medium text-foreground">{option.label}</span>
                    {isSelected && (
                      <CheckCircle
                        className="w-5 h-5"
                        style={{ color: quiz.primary_color }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizView;
