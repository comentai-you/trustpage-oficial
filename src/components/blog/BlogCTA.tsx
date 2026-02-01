import { cn } from "@/lib/utils";

interface BlogCTAProps {
  text: string;
  url: string;
  color?: "primary" | "secondary" | "accent" | "success";
  className?: string;
}

const colorVariants = {
  primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
  secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  accent: "bg-accent hover:bg-accent/90 text-accent-foreground",
  success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
};

const BlogCTA = ({ text, url, color = "success", className }: BlogCTAProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        // Base styles
        "inline-flex items-center justify-center",
        "font-semibold text-base",
        "rounded-lg",
        "no-underline",
        // Mobile-first: 100% width on small screens
        "w-full sm:w-auto",
        // Padding
        "px-6 py-3 sm:px-8 sm:py-4",
        // Margins for spacing from surrounding content
        "my-6",
        // Hover effect
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:scale-[1.02]",
        "hover:-translate-y-0.5",
        // Focus styles
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        // Color variant
        colorVariants[color],
        className
      )}
    >
      {text}
    </a>
  );
};

export default BlogCTA;
