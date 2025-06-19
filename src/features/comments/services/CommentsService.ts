import { 
  Comment, 
  CommentThread, 
  CreateCommentInput, 
  UpdateCommentInput,
  CommentFilters,
  CommentsResponse,
  CommentStats,
  CommentPermissions
} from '../types';

export class CommentsService {
  private static instance: CommentsService;
  private baseUrl = '/api/comments';

  static getInstance(): CommentsService {
    if (!CommentsService.instance) {
      CommentsService.instance = new CommentsService();
    }
    return CommentsService.instance;
  }

  // Get comments for an entity
  async getComments(
    entityType: string, 
    entityId: string, 
    filters?: CommentFilters
  ): Promise<CommentsResponse> {
    const params = new URLSearchParams();
    params.append('entity_type', entityType);
    params.append('entity_id', entityId);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    return response.json();
  }

  // Create a new comment or reply
  async createComment(data: CreateCommentInput): Promise<Comment> {
    const formData = new FormData();
    
    // Add text data
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'attachments' && value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add file attachments
    if (data.attachments?.length) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create comment: ${response.statusText}`);
    }

    return response.json();
  }

  // Update a comment
  async updateComment(commentId: string, data: UpdateCommentInput): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update comment: ${response.statusText}`);
    }

    return response.json();
  }

  // Delete a comment (soft delete)
  async deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
  }

  // Resolve/unresolve a comment thread
  async resolveThread(commentId: string, resolved: boolean): Promise<Comment> {
    return this.updateComment(commentId, { is_resolved: resolved });
  }

  // Add reaction to a comment
  async addReaction(commentId: string, emoji: string): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/${commentId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emoji }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add reaction: ${response.statusText}`);
    }

    return response.json();
  }

  // Remove reaction from a comment
  async removeReaction(commentId: string, emoji: string): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/${commentId}/reactions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emoji }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove reaction: ${response.statusText}`);
    }

    return response.json();
  }

  // Get comment statistics
  async getStats(entityType?: string, entityId?: string): Promise<CommentStats> {
    const params = new URLSearchParams();
    if (entityType) params.append('entity_type', entityType);
    if (entityId) params.append('entity_id', entityId);

    const response = await fetch(`${this.baseUrl}/stats?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comment stats: ${response.statusText}`);
    }

    return response.json();
  }

  // Get user permissions for commenting
  async getPermissions(entityType: string, entityId: string): Promise<CommentPermissions> {
    const response = await fetch(
      `${this.baseUrl}/permissions?entity_type=${entityType}&entity_id=${entityId}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch permissions: ${response.statusText}`);
    }

    return response.json();
  }

  // Mark comments as read
  async markAsRead(commentIds: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment_ids: commentIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark comments as read: ${response.statusText}`);
    }
  }

  // Search comments
  async searchComments(
    query: string, 
    filters?: CommentFilters
  ): Promise<CommentsResponse> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/search?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to search comments: ${response.statusText}`);
    }

    return response.json();
  }
} 