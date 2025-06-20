import React from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import FavoriteCard, { Favorite } from "./FavoriteCard";
import { useFavorites } from "../hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function FavoritesBoard() {
  const {
    favorites,
    loading,
    addFavorite,
    deleteFavorite,
    updateFavorite,
    reorderFavorites,
  } = useFavorites();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = favorites.findIndex((f) => f.id === active.id);
    const newIndex = favorites.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderFavorites(oldIndex, newIndex);
    }
  };

  const handleAdd = () => {
    // For demo: add dummy favorite
    addFavorite({
      url: "https://newsite.com",
      title: "New Favorite",
      tags: ["new"],
    });
  };

  if (loading) {
    return <p className="p-4 text-muted-foreground">Loading favorites…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Favorite
        </Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={favorites.map((f) => f.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favorites.map((fav) => (
              <FavoriteCard
                key={fav.id}
                favorite={fav}
                onDelete={deleteFavorite}
                onEdit={updateFavorite}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}