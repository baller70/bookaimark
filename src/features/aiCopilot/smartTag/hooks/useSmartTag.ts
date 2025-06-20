"use client";
import { useCallback, useState } from 'react';
import {
  AnalyzeSmartTagRequest,
  AnalyzeSmartTagResponse,
  SmartTagHistoryItem,
  SmartTagSuggestion,
} from '../models';
import { SmartTagService } from '../services/SmartTagService';

interface UseSmartTagReturn {
  suggestions: SmartTagSuggestion[];
  history: SmartTagHistoryItem[];
  loading: boolean;
  error: string | null;
  analyzeTags: (bookmarkIds: string[]) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export function useSmartTag(): UseSmartTagReturn {
  const [suggestions, setSuggestions] = useState<SmartTagSuggestion[]>([]);
  const [history, setHistory] = useState<SmartTagHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = SmartTagService.getInstance();

  const analyzeTags = useCallback(async (bookmarkIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      setSuggestions([]);

      const payload: AnalyzeSmartTagRequest = { bookmarkIds };
      const { suggestions } = await service.analyze(payload);
      setSuggestions(suggestions);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze tags';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const refreshHistory = useCallback(async () => {
    try {
      const list = await service.getHistory();
      setHistory(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load history';
      setError(msg);
    }
  }, [service]);

  return {
    suggestions,
    history,
    loading,
    error,
    analyzeTags,
    refreshHistory,
  };
}