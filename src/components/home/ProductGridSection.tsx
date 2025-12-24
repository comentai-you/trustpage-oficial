import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  seller: {
    name: string;
    rating: number;
    isVerified: boolean;
  };
  category: string;
  isFastDelivery?: boolean;
}

interface ProductGridSectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductGridSection = ({ title, products, viewAllLink }: ProductGridSectionProps) => {
  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">{title}</h2>
          {viewAllLink && (
            <Link 
              to={viewAllLink} 
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGridSection;
