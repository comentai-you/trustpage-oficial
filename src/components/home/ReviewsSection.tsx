import { Star, Quote } from "lucide-react";

const reviews = [
  {
    id: "1",
    author: "Lucas M.",
    rating: 5,
    text: "Comprei uma conta de Free Fire e recebi em menos de 5 minutos. Vendedor super atencioso!",
    product: "Conta Free Fire Diamante",
    date: "há 2 horas",
  },
  {
    id: "2",
    author: "Ana C.",
    rating: 5,
    text: "Excelente plataforma, sistema de escrow me deixou muito segura para fazer a compra.",
    product: "Netflix Premium 1 Ano",
    date: "há 5 horas",
  },
  {
    id: "3",
    author: "Pedro S.",
    rating: 5,
    text: "Já é minha terceira compra aqui. Sempre tudo certo, recomendo demais!",
    product: "Conta Instagram 10k",
    date: "há 1 dia",
  },
  {
    id: "4",
    author: "Mariana R.",
    rating: 4,
    text: "Produto conforme anunciado, apenas demorou um pouco mais que o esperado mas chegou.",
    product: "Conta Valorant Imortal",
    date: "há 1 dia",
  },
];

const ReviewsSection = () => {
  return (
    <section className="py-8 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center mb-6">Avaliações Recentes</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-4">
              <div className="flex items-start gap-2 mb-3">
                <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground line-clamp-3">{review.text}</p>
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < review.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{review.author}</span>
                <span className="mx-1">•</span>
                <span>{review.product}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{review.date}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
