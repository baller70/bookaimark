import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Comment,
  CommentThread,
  CommentNotification,
  User,
  CreateCommentData,
  UpdateCommentData,
  CommentFilters,
  CommentUIState,
  CommentReaction,
  CreateCommentInput,
  UpdateCommentInput,
  CommentsResponse,
  CommentStats,
  CommentPermissions,
  CommentEvent
} from '../types';
import { CommentsService } from '../services/CommentsService';
import { MentionsService } from '../services/MentionsService';
import { toast } from 'sonner';

// Mock data
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/placeholder-avatar.jpg',
    isOnline: true,
    lastSeen: new Date()
  },
  {
    id: 'user-2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: '/placeholder-avatar.jpg',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: '/placeholder-avatar.jpg',
    isOnline: true,
    lastSeen: new Date()
  }
];

const mockComments: Comment[] = [
  {
    id: 'comment-1',
    content: 'This is a great document! @jane would love to see this.',
    authorId: 'user-1',
    authorName: 'John Doe',
    authorAvatar: '/placeholder-avatar.jpg',
    entityType: 'document',
    entityId: 'doc-1',
    mentions: ['user-2'],
    isResolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isEdited: false,
    reactions: [
      {
        id: 'reaction-1',
        emoji: '👍',
        userId: 'user-2',
        userName: 'Jane Smith',
        createdAt: new Date(Date.now() - 1000 * 60 * 60)
      }
    ],
    attachments: []
  },
  {
    id: 'comment-2',
    content: 'Thanks for sharing! I have some thoughts on this approach.',
    authorId: 'user-2',
    authorName: 'Jane Smith',
    authorAvatar: '/placeholder-avatar.jpg',
    parentId: 'comment-1',
    entityType: 'document',
    entityId: 'doc-1',
    mentions: [],
    isResolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    isEdited: false,
    reactions: [],
    attachments: []
  },
  {
    id: 'comment-3',
    content: 'We need to address the performance issues mentioned in the task.',
    authorId: 'user-3',
    authorName: 'Mike Johnson',
    authorAvatar: '/placeholder-avatar.jpg',
    entityType: 'task',
    entityId: 'task-1',
    mentions: [],
    isResolved: true,
    resolvedBy: 'user-1',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    isEdited: false,
    reactions: [],
    attachments: []
  }
];

interface UseCommentsOptions {
  entityType: string;
  entityId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableWebSocket?: boolean;
}

interface UseCommentsReturn {
  // State
  comments: Comment[];
  threads: CommentThread[];
  loading: boolean;
  error: string | null;
  stats: CommentStats | null;
  permissions: CommentPermissions | null;
  
  // Actions
  createComment: (data: CreateCommentInput) => Promise<Comment | null>;
  updateComment: (id: string, data: UpdateCommentInput) => Promise<Comment | null>;
  deleteComment: (id: string) => Promise<boolean>;
  resolveThread: (id: string, resolved: boolean) => Promise<boolean>;
  addReaction: (id: string, emoji: string) => Promise<boolean>;
  removeReaction: (id: string, emoji: string) => Promise<boolean>;
  markAsRead: (commentIds: string[]) => Promise<boolean>;
  
  // Utilities
  refresh: () => Promise<void>;
  getUnreadCount: () => number;
  getThreadById: (id: string) => CommentThread | null;
  getCommentById: (id: string) => Comment | null;
}

export function useComments({
  entityType,
  entityId,
  autoRefresh = false,
  refreshInterval = 30000,
  enableWebSocket = true
}: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [permissions, setPermissions] = useState<CommentPermissions | null>(null);

  const commentsService = useRef(CommentsService.getInstance());
  const mentionsService = useRef(MentionsService.getInstance());
  const wsRef = useRef<WebSocket | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load comments and related data
  const loadComments = useCallback(async (filters?: CommentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const [commentsResponse, permissionsData] = await Promise.all([
        commentsService.current.getComments(entityType, entityId, filters),
        commentsService.current.getPermissions(entityType, entityId)
      ]);

      setComments(commentsResponse.comments);
      setThreads(commentsResponse.threads);
      setStats(commentsResponse.stats);
      setPermissions(permissionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  // Create a new comment
  const createComment = useCallback(async (data: CreateCommentInput): Promise<Comment | null> => {
    try {
      // Extract mentions from content
      const mentions = mentionsService.current.extractMentionIds(data.content);
      const commentData = { ...data, mentions };

      const newComment = await commentsService.current.createComment(commentData);
      
      // Update local state
      setComments(prev => [newComment, ...prev]);
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_comments: prev.total_comments + 1,
          recent_activity: [newComment, ...prev.recent_activity.slice(0, 4)]
        } : null);
      }

      // Notify mentioned users
      if (mentions.length > 0) {
        await mentionsService.current.notifyMentionedUsers(
          newComment.id,
          mentions,
          entityType,
          entityId
        );
      }

      toast.success('Comment added successfully');
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create comment';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [entityType, entityId, stats]);

  // Update a comment
  const updateComment = useCallback(async (id: string, data: UpdateCommentInput): Promise<Comment | null> => {
    try {
      const updatedComment = await commentsService.current.updateComment(id, data);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === id ? updatedComment : comment
      ));

      toast.success('Comment updated successfully');
      return updatedComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update comment';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Delete a comment
  const deleteComment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await commentsService.current.deleteComment(id);
      
      // Update local state
      setComments(prev => prev.filter(comment => comment.id !== id));
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_comments: Math.max(0, prev.total_comments - 1)
        } : null);
      }

      toast.success('Comment deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [stats]);

  // Resolve/unresolve a thread
  const resolveThread = useCallback(async (id: string, resolved: boolean): Promise<boolean> => {
    try {
      await commentsService.current.resolveThread(id, resolved);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === id ? { ...comment, is_resolved: resolved } : comment
      ));
      
      setThreads(prev => prev.map(thread => 
        thread.id === id ? { ...thread, is_resolved: resolved } : thread
      ));

      toast.success(resolved ? 'Thread resolved' : 'Thread reopened');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update thread';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Add reaction to comment
  const addReaction = useCallback(async (id: string, emoji: string): Promise<boolean> => {
    try {
      const updatedComment = await commentsService.current.addReaction(id, emoji);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === id ? updatedComment : comment
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add reaction';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Remove reaction from comment
  const removeReaction = useCallback(async (id: string, emoji: string): Promise<boolean> => {
    try {
      const updatedComment = await commentsService.current.removeReaction(id, emoji);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === id ? updatedComment : comment
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove reaction';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Mark comments as read
  const markAsRead = useCallback(async (commentIds: string[]): Promise<boolean> => {
    try {
      await commentsService.current.markAsRead(commentIds);
      
      // Update local state to remove unread indicators
      setComments(prev => prev.map(comment => 
        commentIds.includes(comment.id) 
          ? { ...comment, unread_count: 0 }
          : comment
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Utility functions
  const refresh = useCallback(() => loadComments(), [loadComments]);
  
  const getUnreadCount = useCallback(() => {
    return comments.reduce((count, comment) => count + (comment.unread_count || 0), 0);
  }, [comments]);

  const getThreadById = useCallback((id: string) => {
    return threads.find(thread => thread.id === id) || null;
  }, [threads]);

  const getCommentById = useCallback((id: string) => {
    return comments.find(comment => comment.id === id) || null;
  }, [comments]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!enableWebSocket) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}/comments`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Subscribe to updates for this entity
      ws.send(JSON.stringify({
        type: 'subscribe',
        entity_type: entityType,
        entity_id: entityId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data: CommentEvent = JSON.parse(event.data);
        
        if (data.entity_type === entityType && data.entity_id === entityId) {
          switch (data.type) {
            case 'comment.created':
              setComments(prev => [data.comment, ...prev]);
              break;
            case 'comment.updated':
              setComments(prev => prev.map(comment => 
                comment.id === data.comment.id ? data.comment : comment
              ));
              break;
            case 'comment.deleted':
              setComments(prev => prev.filter(comment => comment.id !== data.comment.id));
              break;
          }
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [entityType, entityId, enableWebSocket]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const startAutoRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        loadComments();
        startAutoRefresh();
      }, refreshInterval);
    };

    startAutoRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadComments]);

  // Initial load
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    comments,
    threads,
    loading,
    error,
    stats,
    permissions,
    
    // Actions
    createComment,
    updateComment,
    deleteComment,
    resolveThread,
    addReaction,
    removeReaction,
    markAsRead,
    
    // Utilities
    refresh,
    getUnreadCount,
    getThreadById,
    getCommentById
  };
} 