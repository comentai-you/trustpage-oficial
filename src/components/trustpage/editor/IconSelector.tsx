import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { 
  Zap, Star, Heart, Shield, Check, Award, Gift, Crown,
  Rocket, Target, TrendingUp, Users, Clock, Lock, Sparkles,
  ThumbsUp, Gem, Lightbulb, Medal, Trophy, BadgeCheck,
  DollarSign, CreditCard, Wallet, Percent, Tag,
  Package, Truck, Headphones, MessageCircle, Phone, Mail,
  Globe, MapPin, Calendar, Timer, Hourglass, Infinity,
  Sun, Moon, Cloud, Flame, Droplet, Leaf, 
  Music, Camera, Video, Image, Mic, Volume2, Play,
  Book, FileText, Folder, Download, Upload, Share2,
  Settings, Wrench, Cpu, Wifi, Battery,
  Smile, AlertCircle, Info, HelpCircle,
  Plus, Minus, X, ArrowRight, ArrowUp, ChevronRight,
  LucideIcon
} from "lucide-react";

interface IconSelectorProps {
  value: string;
  onChange: (icon: string) => void;
  primaryColor?: string;
}

// Icon map for popular icons
const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Star, Heart, Shield, Check, Award, Gift, Crown,
  Rocket, Target, TrendingUp, Users, Clock, Lock, Sparkles,
  ThumbsUp, Gem, Lightbulb, Medal, Trophy, BadgeCheck,
  DollarSign, CreditCard, Wallet, Percent, Tag,
  Package, Truck, Headphones, MessageCircle, Phone, Mail,
  Globe, MapPin, Calendar, Timer, Hourglass, Infinity,
  Sun, Moon, Cloud, Flame, Droplet, Leaf,
  Music, Camera, Video, Image, Mic, Volume2, Play,
  Book, FileText, Folder, Download, Upload, Share2,
  Settings, Wrench, Cpu, Wifi, Battery,
  Smile, AlertCircle, Info, HelpCircle,
  Plus, Minus, X, ArrowRight, ArrowUp, ChevronRight
};

const POPULAR_ICONS = Object.keys(ICON_MAP);

const IconSelector = ({ value, onChange, primaryColor = "#8B5CF6" }: IconSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = POPULAR_ICONS.filter(icon => 
    icon.toLowerCase().includes(search.toLowerCase())
  );

  // Get the icon component
  const getIconComponent = (iconName: string): LucideIcon => {
    return ICON_MAP[iconName] || Sparkles;
  };

  const CurrentIcon = getIconComponent(value || "Sparkles");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-14 h-10 p-0 flex items-center justify-center"
        >
          <CurrentIcon className="w-5 h-5" style={{ color: primaryColor }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 bg-white z-50" align="start">
        <div className="space-y-3">
          <Input
            placeholder="Buscar ícone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm"
          />
          <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
            {filteredIcons.map((iconName) => {
              const Icon = getIconComponent(iconName);
              const isSelected = value === iconName;
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
                    isSelected ? "bg-primary/10 ring-2 ring-primary" : ""
                  }`}
                  title={iconName}
                >
                  <Icon 
                    className="w-4 h-4" 
                    style={{ color: isSelected ? primaryColor : "#6B7280" }} 
                  />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              Nenhum ícone encontrado
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconSelector;
