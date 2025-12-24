import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import ProductGridSection from "@/components/home/ProductGridSection";
import ReviewsSection from "@/components/home/ReviewsSection";

// Import product images
import valorantImg from "@/assets/products/valorant.jpg";
import lolImg from "@/assets/products/lol.jpg";
import csgoImg from "@/assets/products/csgo.png";
import gtaImg from "@/assets/products/gta-v.jpg";
import minecraftImg from "@/assets/products/minecraft.jpg";
import tiktokImg from "@/assets/products/tiktok.jpg";
import primeVideoImg from "@/assets/products/prime-video.png";

// Mock data for products - 6 primeiros são VENDIDOS para mostrar movimentação
const featuredProducts = [
  {
    id: "1",
    title: "Conta Valorant Imortal 3 Full Skins",
    price: 450.00,
    image: valorantImg,
    seller: { name: "ValorantPro", rating: 4.9, isVerified: true },
    category: "Valorant",
    isFastDelivery: true,
    status: 'sold' as const,
  },
  {
    id: "2",
    title: "Conta LoL Desafiante 200+ Skins",
    price: 1299.00,
    image: lolImg,
    seller: { name: "LolMaster", rating: 5.0, isVerified: true },
    category: "League of Legends",
    status: 'sold' as const,
  },
  {
    id: "3",
    title: "Conta CS2 Prime 5000 Horas Global",
    price: 280.00,
    image: csgoImg,
    seller: { name: "CSMaster", rating: 4.8, isVerified: true },
    category: "CS2",
    isFastDelivery: true,
    status: 'sold' as const,
  },
  {
    id: "4",
    title: "GTA V Online 500M + Level 200",
    price: 149.90,
    image: gtaImg,
    seller: { name: "GTAKing", rating: 4.9, isVerified: true },
    category: "GTA V",
    status: 'sold' as const,
  },
  {
    id: "5",
    title: "Minecraft Premium Java + Bedrock",
    price: 69.90,
    image: minecraftImg,
    seller: { name: "MinePro", rating: 4.7, isVerified: true },
    category: "Minecraft",
    isFastDelivery: true,
    status: 'sold' as const,
  },
];

const popularProducts = [
  {
    id: "6",
    title: "TikTok 25k Seguidores Verificado",
    price: 1200.00,
    image: tiktokImg,
    seller: { name: "TikPro", rating: 4.8, isVerified: true },
    category: "TikTok",
    status: 'sold' as const,
  },
  {
    id: "7",
    title: "Prime Video 1 Ano Garantido",
    price: 59.90,
    image: primeVideoImg,
    seller: { name: "StreamPlus", rating: 4.6, isVerified: true },
    category: "Streaming",
    isFastDelivery: true,
  },
  {
    id: "8",
    title: "Conta Free Fire Level 80 Skins Raras",
    price: 249.90,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    seller: { name: "GamerPro", rating: 4.9, isVerified: true },
    category: "Free Fire",
    isFastDelivery: true,
  },
  {
    id: "9",
    title: "Instagram 50k Seguidores Brasileiros",
    price: 899.00,
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop",
    seller: { name: "SocialKing", rating: 4.8, isVerified: true },
    category: "Instagram",
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
    title: "Conta Spotify Premium Vitalício",
    price: 29.90,
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop",
    seller: { name: "MusicHub", rating: 4.6, isVerified: true },
    category: "Streaming",
    isFastDelivery: true,
  },
  {
    id: "12",
    title: "Canal YouTube 100k Monetizado",
    price: 5500.00,
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop",
    seller: { name: "YTBusiness", rating: 4.8, isVerified: true },
    category: "YouTube",
  },
  {
    id: "13",
    title: "Netflix Premium 1 Ano Garantido",
    price: 79.90,
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop",
    seller: { name: "StreamPlus", rating: 4.7, isVerified: false },
    category: "Streaming",
  },
  {
    id: "14",
    title: "Twitter/X 10k Seguidores Orgânicos",
    price: 420.00,
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=300&fit=crop",
    seller: { name: "XBoost", rating: 4.6, isVerified: false },
    category: "Twitter",
    isFastDelivery: true,
  },
  {
    id: "15",
    title: "Conta Fortnite OG com Skins Raras",
    price: 350.00,
    image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400&h=300&fit=crop",
    seller: { name: "FortPro", rating: 4.8, isVerified: true },
    category: "Fortnite",
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