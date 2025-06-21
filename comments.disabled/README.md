# Comments Feature Module

A comprehensive threaded commenting system that works on any entity (bookmark, task, document, media) with @-mentions, thread resolution, and unread badges.

## Features

- **Threaded Comments**: Nested comment threads with replies
- **@-Mentions**: Tag users with autocomplete suggestions
- **Thread Resolution**: Mark comment threads as resolved
- **Unread Badges**: Track unread comments per user
- **Rich Text Editor**: Markdown support with emoji picker
- **Inline Comments**: Hoverable comment markers on content
- **Real-time Updates**: WebSocket integration for live updates
- **Permissions**: Role-based access control

## Public APIs

### Hooks

- `useComments(entityType, entityId)` - Manage comments for an entity
- `useMentionSuggestions()` - Get user suggestions for @-mentions
- `useCommentNotifications()` - Handle comment notifications

### Components

- `<CommentSection />` - Complete comment interface for any entity
- `<CommentThread />` - Renders a comment thread with replies
- `<CommentItem />` - Individual comment with actions
- `<CommentEditor />` - Rich text editor with mentions
- `<InlineCommentMarker />` - Overlay marker for inline comments

### Services

- `CommentsService` - API client for comment operations
- `MentionsService` - Handle @-mention parsing and notifications

## Environment Variables

```env
# WebSocket URL for real-time updates
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Notification settings
NEXT_PUBLIC_NOTIFICATION_TOPIC=comments
```

## Usage Example

```tsx
import { CommentSection } from '@/features/comments';

function DocumentView({ documentId }) {
  return (
    <div>
      <div>Document content...</div>
      <CommentSection 
        entityType="document" 
        entityId={documentId}
        allowInlineComments={true}
      />
    </div>
  );
}
```

## Database Schema

Comments are stored in the `user_comments` table with the following structure:

- `id` - Unique comment identifier
- `user_id` - Author of the comment
- `entity_type` - Type of entity being commented on
- `entity_id` - ID of the entity
- `parent_id` - Parent comment for threading (null for root)
- `content` - Comment content (supports markdown)
- `mentions` - Array of mentioned user IDs
- `is_resolved` - Whether the thread is resolved
- `created_at` / `updated_at` - Timestamps

## API Endpoints

- `GET /api/comments` - List comments for an entity
- `POST /api/comments` - Create new comment or reply
- `PATCH /api/comments/:id` - Edit or resolve comment
- `DELETE /api/comments/:id` - Delete comment (soft delete) 