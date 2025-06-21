// Comment Types
export interface Comment {
  id: string;
  user_id: string;
  entity_type: 'document' | 'task' | 'media' | 'bookmark';
  entity_id: string;
  parent_id?: string;
  content: string;
  mentions: string[];
  reactions: Record<string, string[]>; // emoji -> user_ids
  attachments: CommentAttachment[];
  is_resolved: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  
  // Populated fields
  author?: User;
  replies?: Comment[];
  mentioned_users?: User[];
  reply_count?: number;
  unread_count?: number;
}

export interface CommentReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  size: number;
}

export interface CommentThread {
  id: string;
  root_comment: Comment;
  replies: Comment[];
  participant_ids: string[];
  last_activity: Date;
  is_resolved: boolean;
  reply_count: number;
  entity_type: string;
  entity_id: string;
}

export interface CommentNotification {
  id: string;
  user_id: string;
  type: 'mention' | 'reply' | 'reaction' | 'resolution';
  title: string;
  message: string;
  data: {
    comment_id: string;
    entity_type: string;
    entity_id: string;
    mentioned_by?: string;
    reaction_emoji?: string;
  };
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Comment System State
export interface CommentState {
  comments: Comment[];
  threads: CommentThread[];
  notifications: CommentNotification[];
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// Comment Actions
export interface CreateCommentInput {
  entity_type: string;
  entity_id: string;
  parent_id?: string;
  content: string;
  mentions?: string[];
  attachments?: File[];
}

export interface UpdateCommentInput {
  content?: string;
  is_resolved?: boolean;
}

export interface CommentFilters {
  user_id?: string;
  is_resolved?: boolean;
  has_mentions?: boolean;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
}

// UI State
export interface CommentUIState {
  expandedThreads: Set<string>;
  selectedComment: string | null;
  replyingTo: string | null;
  editingComment: string | null;
  showResolved: boolean;
  sortBy: 'newest' | 'oldest' | 'mostActive';
  viewMode: 'threaded' | 'flat';
}

export interface MentionSuggestion {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  type: 'user';
}

export interface CommentStats {
  total_comments: number;
  resolved_threads: number;
  unresolved_threads: number;
  active_participants: number;
  recent_activity: Comment[];
}

// WebSocket event types
export interface CommentEvent {
  type: 'comment.created' | 'comment.updated' | 'comment.deleted' | 'comment.resolved';
  comment: Comment;
  user: User;
  timestamp: string;
}

// API Response types
export interface CommentsResponse {
  comments: Comment[];
  threads: CommentThread[];
  stats: CommentStats;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface CommentPermissions {
  can_comment: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_resolve: boolean;
  can_mention: boolean;
  can_react: boolean;
} 