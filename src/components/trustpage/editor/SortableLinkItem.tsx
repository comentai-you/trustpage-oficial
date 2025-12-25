import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BioLink } from "@/types/landing-page";
import { GripVertical, Trash2, Star, Plus, X, Loader2 } from "lucide-react";

interface SortableLinkItemProps {
  link: BioLink;
  onUpdate: (id: string, updates: Partial<BioLink>) => void;
  onRemove: (id: string) => void;
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>, linkId: string) => void;
  uploadingThumbnail: string | null;
}

const SortableLinkItem = ({ 
  link, 
  onUpdate, 
  onRemove, 
  onThumbnailUpload, 
  uploadingThumbnail 
}: SortableLinkItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-gray-50 rounded-lg space-y-2 ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded touch-none"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-xs font-medium text-gray-700">Link</span>
        </div>
        <button onClick={() => onRemove(link.id)} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <Input 
        value={link.text} 
        onChange={(e) => onUpdate(link.id, { text: e.target.value })} 
        placeholder="Texto do botão" 
        className="text-sm" 
      />
      <Input 
        value={link.url} 
        onChange={(e) => onUpdate(link.id, { url: e.target.value })} 
        placeholder="https://..." 
        className="text-sm" 
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-xs">Destacar</span>
        </div>
        <Switch 
          checked={link.isHighlighted || false} 
          onCheckedChange={(checked) => onUpdate(link.id, { isHighlighted: checked })} 
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Miniatura</Label>
        {link.thumbnailUrl ? (
          <div className="relative w-10 h-10">
            <img src={link.thumbnailUrl} className="w-full h-full object-cover rounded" alt="Thumbnail" />
            <button 
              onClick={() => onUpdate(link.id, { thumbnailUrl: '' })} 
              className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full text-white"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <label className="w-10 h-10 border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary">
              {uploadingThumbnail === link.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3 text-gray-400" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => onThumbnailUpload(e, link.id)} 
                className="hidden" 
              />
            </label>
            <span className="text-[10px] text-primary/70 font-medium">80x80px</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableLinkItem;