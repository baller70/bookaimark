import { useState, useEffect, useCallback } from 'react';
import { TimelineItem } from '../types';

export interface UseTimelineItemsReturn {
  items: TimelineItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setItems: (newItems: TimelineItem[]) => void;
  updateItem: (id: string, patch: Partial<TimelineItem>) => void;
}

/**
 * useTimelineItems
 * ----------------
 * Hook for fetching and manipulating timeline items for a given folder.
 * A network-backed implementation will be added later; currently uses in-memory state.
 */
export function useTimelineItems(folderId: string): UseTimelineItemsReturn {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with API call
      const response: TimelineItem[] = [];
      setItems(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(
    (id: string, patch: Partial<TimelineItem>) => {
      setItems((prev) => prev.map((itm) => (itm.id === id ? { ...itm, ...patch } : itm)));
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh, folderId]);

  return { items, loading, error, refresh, setItems, updateItem };
}