import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface BlogSearchFiltersProps {
  categories: Category[];
  searchQuery: string;
  selectedCategory: string | null;
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

const BlogSearchFilters = ({
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: BlogSearchFiltersProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Search Input */}
          <div className="relative max-w-md mx-auto w-full">
            <div
              className={cn(
                "relative flex items-center rounded-full border transition-all duration-300",
                isFocused
                  ? "border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  : "border-border bg-card/50"
              )}
            >
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-12 pr-10 py-3 h-12 rounded-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-4 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {/* All Categories Chip */}
            <button
              onClick={() => onCategoryChange(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                  : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              Todos
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                    : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSearchFilters;
