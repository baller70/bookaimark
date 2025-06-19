// Components
export { CommentList } from './components/CommentList';
export { CommentItem } from './components/CommentItem';
export { CommentEditor } from './components/CommentEditor';
export { InlineCommentMarker } from './components/InlineCommentMarker';
export { CommentSection } from './components/CommentSection';
export { CommentForm } from './components/CommentForm';

// Hooks
export { useComments } from './hooks/useComments';
export { useMentionSuggestions } from './hooks/useMentionSuggestions';
export { useCommentNotifications } from './hooks/useCommentNotifications';

// Services
export { CommentsService } from './services/CommentsService';
export { MentionsService } from './services/MentionsService';

// Types
export type {
  Comment,
  CommentThread,
  CommentStats,
  CommentPermissions,
  CreateCommentInput,
  UpdateCommentInput,
  CommentFilters,
  CommentsResponse,
  MentionSuggestion,
  CommentNotification,
  CommentEvent,
  User,
  CommentAttachment
} from './types'; 