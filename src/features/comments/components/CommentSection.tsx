'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageCircle,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { CommentThread } from './CommentThread';
import { CommentForm } from './CommentForm';

interface CommentSectionProps {
  entityType: 'bookmark' | 'task' | 'document' | 'media';
  entityId: string;
  title?: string;
  showHeader?: boolean;
  allowNewComments?: boolean;
}

export function CommentSection({
  entityType,
  entityId,
  title = 'Comments',
  showHeader = true,
  allowNewComments = true
}: CommentSectionProps) {
  const {
    threads,
    currentUser,
    users,
    isLoading,
    error,
    uiState,
    createComment,
    deleteComment,
    toggleResolveThread,
    addReaction,
    toggleThreadExpansion,
    setReplyingTo,
    setEditingComment,
    setShowResolved,
    setSortBy
  } = useComments(entityType, entityId);

  const [showNewCommentForm, setShowNewCommentForm] = React.useState(false);
  const totalComments = threads.reduce((sum, thread) => sum + thread.replies.length + 1, 0);
  const unresolvedCount = threads.filter(thread => !thread.isResolved).length;
  const unreadCount = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  const handleCreateComment = async (content: string, mentions: string[]) => {
    try {
      await createComment({
        content,
        entityType,
        entityId,
        mentions
      });
      setShowNewCommentForm(false);
    } catch (err) {
      console.error('Failed to create comment:', err);
    }
  };

  const handleReply = (threadId: string, content: string, mentions: string[]) => {
    createComment({
      content,
      entityType,
      entityId,
      parentId: threadId,
      mentions
    });
    setReplyingTo(null);
  };

  const handleEdit = (commentId: string) => {
    setEditingComment(commentId);
    // In a real app, you'd open an edit form
    console.log('Edit comment:', commentId);
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  const sortedThreads = React.useMemo(() => {
    const sorted = [...threads];
    
    switch (uiState.sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      case 'oldest':
        return sorted.sort((a, b) => a.rootComment.createdAt.getTime() - b.rootComment.createdAt.getTime());
      case 'mostActive':
        return sorted.sort((a, b) => b.replies.length - a.replies.length);
      default:
        return sorted;
    }
  }, [threads, uiState.sortBy]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error loading comments: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>{title}</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
                </Badge>
                
                {unresolvedCount > 0 && (
                  <Badge variant="outline">
                    {unresolvedCount} unresolved
                  </Badge>
                )}
                
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Sort Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {uiState.sortBy === 'newest' && <SortDesc className="h-4 w-4 mr-1" />}
                    {uiState.sortBy === 'oldest' && <SortAsc className="h-4 w-4 mr-1" />}
                    {uiState.sortBy === 'mostActive' && <Filter className="h-4 w-4 mr-1" />}
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Oldest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('mostActive')}>
                    <Filter className="h-4 w-4 mr-2" />
                    Most active
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Show/Hide Resolved */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResolved(!uiState.showResolved)}
              >
                {uiState.showResolved ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide resolved
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show resolved
                  </>
                )}
              </Button>

              {/* New Comment Button */}
              {allowNewComments && (
                <Button
                  size="sm"
                  onClick={() => setShowNewCommentForm(!showNewCommentForm)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Comment
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-6">
        {/* New Comment Form */}
        {showNewCommentForm && allowNewComments && (
          <div className="mb-6">
            <CommentForm
              placeholder="Start a discussion..."
              onSubmit={handleCreateComment}
              onCancel={() => setShowNewCommentForm(false)}
              currentUserAvatar={currentUser?.avatar}
              currentUserName={currentUser?.name}
              availableUsers={users.filter(u => u.id !== currentUser?.id)}
              autoFocus
            />
          </div>
        )}

        {/* Comment Threads */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading comments...</p>
          </div>
        ) : sortedThreads.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No comments yet</p>
            {allowNewComments && !showNewCommentForm && (
              <Button onClick={() => setShowNewCommentForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start the conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedThreads.map((thread) => (
              <CommentThread
                key={thread.id}
                thread={thread}
                isExpanded={uiState.expandedThreads.has(thread.id)}
                isReplying={uiState.replyingTo === thread.id}
                currentUserId={currentUser?.id || ''}
                onToggleExpansion={() => toggleThreadExpansion(thread.id)}
                onReply={() => setReplyingTo(thread.id)}
                onCancelReply={() => setReplyingTo(null)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResolve={() => toggleResolveThread(thread.id)}
                onReaction={addReaction}
                onSubmitReply={(content, mentions) => handleReply(thread.id, content, mentions)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {sortedThreads.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm">
              Load more comments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 