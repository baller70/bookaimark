import { useCallback, useEffect, useState } from "react";
import { Favorite } from "../components/FavoriteCard";

interface UseFavoritesReturn {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  addFavorite: (fav: Omit<Favorite, "id">) => void;
  updateFavorite: (fav: Favorite) => void;
  deleteFavorite: (id: string) => void;
  reorderFavorites: (sourceIndex: number, destinationIndex: number) => void;
}

// NOTE: This hook currently manages local state only.
// Replace with real API calls (fetch/axios) and optimistic updates later.
export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fake fetch on mount
  useEffect(() => {
    setLoading(true);
    // TODO: Replace with GET /api/dna-profile/favorites
    setTimeout(() => {
      setFavorites([
        {
          id: "1",
          url: "https://example.com",
          title: "Example Website",
          description: "An example favorite bookmark.",
          tags: ["demo", "test"],
          faviconUrl: "https://example.com/favicon.ico",
        },
        {
          id: "2",
          url: "https://github.com",
          title: "GitHub",
          tags: ["code"],
          faviconUrl: "https://github.githubassets.com/favicons/favicon.svg",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Handlers
  const addFavorite = useCallback((fav: Omit<Favorite, "id">) => {
    const newFav: Favorite = { ...fav, id: crypto.randomUUID() };
    setFavorites((prev) => [...prev, newFav]);
    // TODO: POST /api/dna-profile/favorites
  }, []);

  const updateFavorite = useCallback((fav: Favorite) => {
    setFavorites((prev) => prev.map((f) => (f.id === fav.id ? fav : f)));
    // TODO: PATCH /api/dna-profile/favorites/:id
  }, []);

  const deleteFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    // TODO: DELETE /api/dna-profile/favorites/:id
  }, []);

  const reorderFavorites = useCallback((sourceIndex: number, destinationIndex: number) => {
    setFavorites((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(destinationIndex, 0, moved);
      return updated;
    });
    // TODO: PATCH /api/dna-profile/favorites/order
  }, []);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    updateFavorite,
    deleteFavorite,
    reorderFavorites,
  };
}