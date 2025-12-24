import { Link } from "react-router-dom";
import { Star, Shield, Zap } from "lucide-react";

interface ProductCardProps {
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

const ProductCard = ({ id, title, price, image, seller, category, isFastDelivery }: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`} className="product-card group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isFastDelivery && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
            <Zap className="w-3 h-3" />
            Rápido
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3">
        {/* Category */}
        <span className="text-xs text-muted-foreground">{category}</span>
        
        {/* Title */}
        <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-2 min-h-[2.5rem]">
          {title}
        </h3>
        
        {/* Seller */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-1">
            {seller.isVerified && (
              <Shield className="w-3.5 h-3.5 text-primary" />
            )}
            <span className="text-xs text-muted-foreground">{seller.name}</span>
          </div>
          <div className="flex items-center gap-0.5 ml-auto">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-muted-foreground">{seller.rating.toFixed(1)}</span>
          </div>
        </div>
        
        {/* Price */}
        <div className="mt-3">
          <span className="price-badge">
            R$ {price.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
