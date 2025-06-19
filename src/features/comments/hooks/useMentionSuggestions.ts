import { useState, useEffect, useCallback, useRef } from 'react';
import { MentionSuggestion } from '../types';
import { MentionsService } from '../services/MentionsService';

interface UseMentionSuggestionsOptions {
  entityType?: string;
  entityId?: string;
  debounceMs?: number;
  maxSuggestions?: number;
}

interface UseMentionSuggestionsReturn {
  suggestions: MentionSuggestion[];
  loading: boolean;
  error: string | null;
  searchSuggestions: (query: string) => void;
  clearSuggestions: () => void;
  selectSuggestion: (suggestion: MentionSuggestion) => void;
  selectedIndex: number;
  navigateUp: () => void;
  navigateDown: () => void;
}

export function useMentionSuggestions({
  entityType,
  entityId,
  debounceMs = 300,
  maxSuggestions = 10
}: UseMentionSuggestionsOptions = {}): UseMentionSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const mentionsService = useRef(MentionsService.getInstance());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentQueryRef = useRef<string>('');

  // Search for mention suggestions
  const searchSuggestions = useCallback(async (query: string) => {
    currentQueryRef.current = query;

    // Clear previous debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Don't search for empty or very short queries
    if (!query || query.length < 2) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    // Debounce the search
    debounceTimeoutRef.current = setTimeout(async () => {
      // Check if query is still current
      if (currentQueryRef.current !== query) return;

      try {
        setLoading(true);
        setError(null);

        const results = await mentionsService.current.getSuggestions(
          query,
          entityType,
          entityId,
          maxSuggestions
        );

        // Only update if this is still the current query
        if (currentQueryRef.current === query) {
          setSuggestions(results);
          setSelectedIndex(-1); // Reset selection
        }
      } catch (err) {
        if (currentQueryRef.current === query) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suggestions';
          setError(errorMessage);
          setSuggestions([]);
        }
      } finally {
        if (currentQueryRef.current === query) {
          setLoading(false);
        }
      }
    }, debounceMs);
  }, [entityType, entityId, debounceMs, maxSuggestions]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSelectedIndex(-1);
    setError(null);
    currentQueryRef.current = '';
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Select a suggestion (for callback purposes)
  const selectSuggestion = useCallback((suggestion: MentionSuggestion) => {
    // This is mainly for external components to know when a suggestion was selected
    // The actual text replacement should be handled by the parent component
    clearSuggestions();
  }, [clearSuggestions]);

  // Navigate up in suggestions
  const navigateUp = useCallback(() => {
    setSelectedIndex(prev => {
      if (suggestions.length === 0) return -1;
      return prev <= 0 ? suggestions.length - 1 : prev - 1;
    });
  }, [suggestions.length]);

  // Navigate down in suggestions
  const navigateDown = useCallback(() => {
    setSelectedIndex(prev => {
      if (suggestions.length === 0) return -1;
      return prev >= suggestions.length - 1 ? 0 : prev + 1;
    });
  }, [suggestions.length]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchSuggestions,
    clearSuggestions,
    selectSuggestion,
    selectedIndex,
    navigateUp,
    navigateDown
  };
} 