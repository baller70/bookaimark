import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GripVertical, MoreHorizontal, Pencil, Trash } from "lucide-react";

export interface Favorite {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  faviconUrl?: string;
}

interface FavoriteCardProps {
  favorite: Favorite;
  onEdit?: (favorite: Favorite) => void;
  onDelete?: (favoriteId: string) => void;
}

export default function FavoriteCard({ favorite, onEdit, onDelete }: FavoriteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: favorite.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: "grab",
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(favorite);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(favorite.id);
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative group min-w-[200px] max-w-sm">
      <CardContent
        className="flex flex-col gap-2 p-4"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start gap-3">
          <img
            src={favorite.faviconUrl ?? `/api/og?url=${encodeURIComponent(favorite.url)}`}
            alt="favicon"
            className="h-6 w-6 rounded"
          />
          <div className="flex-1">
            <h3 className="font-medium leading-snug line-clamp-2 text-sm">
              {favorite.title || favorite.url}
            </h3>
            {favorite.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {favorite.description}
              </p>
            )}
          </div>
          {/* Drag handle visible on hover */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <GripVertical className="h-4 w-4 text-muted-foreground md:opacity-0 md:group-hover:opacity-100" />
              </TooltipTrigger>
              <TooltipContent side="left">Drag to reorder</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {favorite.tags && favorite.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {favorite.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      {/* Inline actions (edit/delete) top-right */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  );
}