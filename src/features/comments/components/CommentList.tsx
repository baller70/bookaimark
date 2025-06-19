'use client';

import React, { useState } from 'react';
import { Comment, CommentThread } from '../types';
import { useComments } from '../hooks/useComments';
import { CommentItem } from './CommentItem';
import { CommentEditor } from './CommentEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, CheckCircle, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentListProps {
  entityType: 'document' | 'task' | 'media' | 'bookmark';
  entityId: string;
  className?: string;
  showHeader?: boolean;
  showStats?: boolean;
  defaultTab?: 'all' | 'unresolved' | 'resolved';
}

export function CommentList({
  entityType,
  entityId,
  className,
  showHeader = true,
  showStats = true,
  defaultTab = 'all'
}: CommentListProps) {
  const {
    comments,
    threads,
    loading,
    error,
    stats,
    permissions,
    createComment,
    refresh,
    getUnreadCount
  } = useComments({ entityType, entityId });

  const [activeTab, setActiveTab] = useState<'all' | 'unresolved' | 'resolved'>(defaultTab);
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);

  // Filter threads based on active tab
  const filteredThreads = threads.filter(thread => {
    switch (activeTab) {
      case 'resolved':
        return thread.is_resolved;
      case 'unresolved':
        return !thread.is_resolved;
      default:
        return true;
    }
  });

  const handleCreateComment = async (content: string, attachments?: File[]) => {
    const success = await createComment({
      entity_type: entityType,
      entity_id: entityId,
      content,
      attachments
    });

    if (success) {
      setShowNewCommentForm(false);
    }
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = getUnreadCount();

  return (
    <Card className={cn('w-full', className)}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <Button
              onClick={() => setShowNewCommentForm(!showNewCommentForm)}
              disabled={!permissions?.can_comment}
              size="sm"
            >
              Add Comment
            </Button>
          </div>

          {showStats && stats && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                {stats.total_comments} comments
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                {stats.resolved_threads} resolved
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {stats.active_participants} participants
              </div>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-6">
        {showNewCommentForm && (
          <div className="mb-6">
            <CommentEditor
              onSubmit={handleCreateComment}
              onCancel={() => setShowNewCommentForm(false)}
              placeholder="Add a comment..."
              entityType={entityType}
              entityId={entityId}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unresolved' | 'resolved')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="ml-1">
                {threads.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unresolved" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Open
              <Badge variant="secondary" className="ml-1">
                {threads.filter(t => !t.is_resolved).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved
              <Badge variant="secondary" className="ml-1">
                {threads.filter(t => t.is_resolved).length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {activeTab === 'all' && 'No comments yet. Start the conversation!'}
                {activeTab === 'unresolved' && 'No open comments.'}
                {activeTab === 'resolved' && 'No resolved comments.'}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredThreads.map((thread) => (
                  <div key={thread.id} className="space-y-4">
                    <CommentItem
                      comment={thread.root_comment}
                      isThreadRoot
                      isResolved={thread.is_resolved}
                    />
                    
                    {thread.replies && thread.replies.length > 0 && (
                      <div className="ml-8 space-y-4 border-l-2 border-muted pl-4">
                        {thread.replies.map((reply) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            isReply
                            parentId={thread.root_comment.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 