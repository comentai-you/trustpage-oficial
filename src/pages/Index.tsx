import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import ProductGridSection from "@/components/home/ProductGridSection";
import ReviewsSection from "@/components/home/ReviewsSection";

// Mock data for products
const featuredProducts = [
  {
    id: "1",
    title: "Conta Free Fire Level 80 com Skins Raras",
    price: 249.90,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    seller: { name: "GamerPro", rating: 4.9, isVerified: true },
    category: "Free Fire",
    isFastDelivery: true,
  },
  {
    id: "2",
    title: "Instagram 50k Seguidores Reais Brasileiros",
    price: 899.00,
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop",
    seller: { name: "SocialKing", rating: 4.8, isVerified: true },
    category: "Instagram",
  },
  {
    id: "3",
    title: "Conta Valorant Imortal 3 com Knife",
    price: 450.00,
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
    seller: { name: "ValorantPro", rating: 5.0, isVerified: true },
    category: "Valorant",
    isFastDelivery: true,
  },
  {
    id: "4",
    title: "Netflix Premium 1 Ano Garantido",
    price: 79.90,
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop",
    seller: { name: "StreamPlus", rating: 4.7, isVerified: false },
    category: "Streaming",
  },
  {
    id: "5",
    title: "Conta LoL Desafiante com 200+ Skins",
    price: 1299.00,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    seller: { name: "LolMaster", rating: 4.9, isVerified: true },
    category: "League of Legends",
  },
];

const popularProducts = [
  {
    id: "6",
    title: "Conta Spotify Premium Vitalício",
    price: 29.90,
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop",
    seller: { name: "MusicHub", rating: 4.6, isVerified: true },
    category: "Streaming",
    isFastDelivery: true,
  },
  {
    id: "7",
    title: "Canal YouTube 100k Inscritos Monetizado",
    price: 5500.00,
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop",
    seller: { name: "YTBusiness", rating: 4.8, isVerified: true },
    category: "YouTube",
  },
  {
    id: "8",
    title: "TikTok 25k Seguidores + Verificado",
    price: 1200.00,
    image: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=400&h=300&fit=crop",
    seller: { name: "TikPro", rating: 4.5, isVerified: false },
    category: "TikTok",
  },
  {
    id: "9",
    title: "Conta CSGO Prime com 5000 Horas",
    price: 180.00,
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=300&fit=crop",
    seller: { name: "CSMaster", rating: 4.9, isVerified: true },
    category: "CS:GO",
    isFastDelivery: true,
  },
  {
    id: "10",
    title: "Discord Nitro 1 Ano + 2 Boosts",
    price: 89.90,
    image: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400&h=300&fit=crop",
    seller: { name: "DiscordShop", rating: 4.7, isVerified: true },
    category: "Discord",
  },
];

const recentProducts = [
  {
    id: "11",
    title: "Conta Fortnite OG com Skins Raras",
    price: 350.00,
    image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400&h=300&fit=crop",
    seller: { name: "FortPro", rating: 4.8, isVerified: true },
    category: "Fortnite",
  },
  {
    id: "12",
    title: "Twitter/X 10k Seguidores Orgânicos",
    price: 420.00,
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=300&fit=crop",
    seller: { name: "XBoost", rating: 4.6, isVerified: false },
    category: "Twitter",
    isFastDelivery: true,
  },
  {
    id: "13",
    title: "GTA V Online 500 Milhões + Level 200",
    price: 149.90,
    image: "https://images.unsplash.com/photo-1493711662062-fa541f7f2f19?w=400&h=300&fit=crop",
    seller: { name: "GTAKing", rating: 4.9, isVerified: true },
    category: "GTA V",
  },
  {
    id: "14",
    title: "Conta Amazon Prime 6 Meses",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&h=300&fit=crop",
    seller: { name: "PrimeDeals", rating: 4.4, isVerified: true },
    category: "Streaming",
  },
  {
    id: "15",
    title: "Minecraft Premium Java + Bedrock",
    price: 69.90,
    image: "https://images.unsplash.com/photo-1587573089734-09e877e3b3d2?w=400&h=300&fit=crop",
    seller: { name: "MinePro", rating: 4.9, isVerified: true },
    category: "Minecraft",
    isFastDelivery: true,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[104px] md:pt-16">
        <HeroBanner />
        <PopularCategoriesSection />
        <ProductGridSection 
          title="Em Destaque" 
          products={featuredProducts}
          viewAllLink="/featured"
        />
        <ProductGridSection 
          title="Mais Populares" 
          products={popularProducts}
          viewAllLink="/popular"
        />
        <ProductGridSection 
          title="Recém Adicionados" 
          products={recentProducts}
          viewAllLink="/recent"
        />
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
