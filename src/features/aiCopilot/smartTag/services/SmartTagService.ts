import { AnalyzeSmartTagRequest, AnalyzeSmartTagResponse, SmartTagHistoryItem } from '../models';

export class SmartTagService {
  private static instance: SmartTagService;
  private baseUrl = '/api/ai-copilot/smart-tag';

  static getInstance(): SmartTagService {
    if (!SmartTagService.instance) {
      SmartTagService.instance = new SmartTagService();
    }
    return SmartTagService.instance;
  }

  async analyze(data: AnalyzeSmartTagRequest): Promise<AnalyzeSmartTagResponse> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze smart tags');
    }

    return response.json();
  }

  async getHistory(): Promise<SmartTagHistoryItem[]> {
    const response = await fetch(`${this.baseUrl}/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch smart tag history');
    }
    return response.json();
  }
}