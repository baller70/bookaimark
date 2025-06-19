import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentsService } from '../services/CommentsService';
import { CreateCommentInput, UpdateCommentInput } from '../types';

// Mock fetch globally
global.fetch = vi.fn();

describe('CommentsService', () => {
  let commentsService: CommentsService;
  const mockFetch = fetch as vi.MockedFunction<typeof fetch>;

  beforeEach(() => {
    commentsService = CommentsService.getInstance();
    mockFetch.mockClear();
  });

  describe('getComments', () => {
    it('should fetch comments for an entity', async () => {
      const mockResponse = {
        comments: [],
        threads: [],
        stats: { total_comments: 0, resolved_threads: 0, unresolved_threads: 0, active_participants: 0, recent_activity: [] },
        pagination: { limit: 10, offset: 0, total: 0 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await commentsService.getComments('document', 'doc-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/comments?entity_type=document&entity_id=doc-123',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as Response);

      await expect(
        commentsService.getComments('document', 'doc-123')
      ).rejects.toThrow('Failed to fetch comments');
    });
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const mockComment = {
        id: 'comment-123',
        user_id: 'user-123',
        entity_type: 'document',
        entity_id: 'doc-123',
        content: 'Test comment',
        mentions: [],
        reactions: {},
        attachments: [],
        is_resolved: false,
        is_edited: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      } as Response);

      const input: CreateCommentInput = {
        entity_type: 'document',
        entity_id: 'doc-123',
        content: 'Test comment'
      };

      const result = await commentsService.createComment(input);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/comments',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('updateComment', () => {
    it('should update an existing comment', async () => {
      const commentId = 'comment-123';
      const mockUpdatedComment = {
        id: commentId,
        content: 'Updated comment',
        is_edited: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedComment,
      } as Response);

      const input: UpdateCommentInput = {
        content: 'Updated comment'
      };

      const result = await commentsService.updateComment(commentId, input);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/comments/${commentId}`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })
      );
      expect(result).toEqual(mockUpdatedComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const commentId = 'comment-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await commentsService.deleteComment(commentId);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/comments/${commentId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toBe(true);
    });
  });

  describe('addReaction', () => {
    it('should add a reaction to a comment', async () => {
      const commentId = 'comment-123';
      const emoji = '👍';
      const mockUpdatedComment = {
        id: commentId,
        reactions: { '👍': ['user-123'] }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedComment,
      } as Response);

      const result = await commentsService.addReaction(commentId, emoji);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/comments/${commentId}/reactions`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji })
        })
      );
      expect(result).toEqual(mockUpdatedComment);
    });
  });

  describe('getStatistics', () => {
    it('should fetch comment statistics', async () => {
      const mockStats = {
        total_comments: 10,
        resolved_threads: 3,
        unresolved_threads: 7,
        active_participants: 5,
        recent_activity: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      } as Response);

      const result = await commentsService.getStatistics('document', 'doc-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/comments/stats?entity_type=document&entity_id=doc-123',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockStats);
    });
  });
}); 