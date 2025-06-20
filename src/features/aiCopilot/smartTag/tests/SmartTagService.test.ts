import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SmartTagService } from '../services/SmartTagService';

// Mock fetch globally
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = vi.fn();

describe('SmartTagService', () => {
  const mockFetch = fetch as unknown as vi.MockedFunction<typeof fetch>;
  let service: SmartTagService;

  beforeEach(() => {
    service = SmartTagService.getInstance();
    mockFetch.mockClear();
  });

  it('analyze should call POST /analyze and return suggestions', async () => {
    const mockResponse = {
      suggestions: [
        {
          bookmarkId: 'b1',
          suggestedTags: ['tag1'],
          confidenceScores: [0.9],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await service.analyze({ bookmarkIds: ['b1'] });
    expect(mockFetch).toHaveBeenCalledWith('/api/ai-copilot/smart-tag/analyze', expect.any(Object));
    expect(result).toEqual(mockResponse);
  });
});