export interface SmartTagSuggestion {
  bookmarkId: string;
  suggestedTags: string[];
  confidenceScores: number[]; // 0-1 for each corresponding tag
}

export interface AnalyzeSmartTagRequest {
  bookmarkIds: string[];
}

export interface AnalyzeSmartTagResponse {
  suggestions: SmartTagSuggestion[];
}

export interface SmartTagHistoryItem extends SmartTagSuggestion {
  createdAt: string; // ISO date string
}