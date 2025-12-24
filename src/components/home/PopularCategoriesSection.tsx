import { Link } from "react-router-dom";
import { Gamepad2, Instagram, Sword, Crosshair, Tv, ShoppingBag, MessageCircle, Music } from "lucide-react";

const categories = [
  { id: "free-fire", title: "Free Fire", icon: Crosshair, href: "/games/free-fire", color: "text-orange-500" },
  { id: "instagram", title: "Instagram", icon: Instagram, href: "/social-media/instagram", color: "text-pink-500" },
  { id: "lol", title: "League of Legends", icon: Sword, href: "/games/lol", color: "text-yellow-500" },
  { id: "valorant", title: "Valorant", icon: Crosshair, href: "/games/valorant", color: "text-red-500" },
  { id: "netflix", title: "Netflix", icon: Tv, href: "/services/netflix", color: "text-red-600" },
  { id: "spotify", title: "Spotify", icon: Music, href: "/services/spotify", color: "text-green-500" },
  { id: "telegram", title: "Telegram", icon: MessageCircle, href: "/social-media/telegram", color: "text-blue-500" },
  { id: "games", title: "Todos Games", icon: Gamepad2, href: "/games", color: "text-purple-500" },
];

const PopularCategoriesSection = () => {
  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Categorias Populares</h2>
          <Link to="/categories" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.href}
              className="category-card"
            >
              <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${category.color}`}>
                <category.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-foreground text-center line-clamp-1">
                {category.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategoriesSection;
