'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageCircle,
  MoreVertical,
  Reply,
  Edit3,
  Trash2,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { CommentThread as CommentThreadType, Comment } from '../types';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { formatDistanceToNow } from 'date-fns';

interface CommentThreadProps {
  thread: CommentThreadType;
  isExpanded: boolean;
  isReplying: boolean;
  currentUserId: string;
  onToggleExpansion: () => void;
  onReply: () => void;
  onCancelReply: () => void;
  onEdit: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onResolve: () => void;
  onReaction: (commentId: string, emoji: string) => void;
  onSubmitReply: (content: string, mentions: string[]) => void;
}

export function CommentThread({
  thread,
  isExpanded,
  isReplying,
  currentUserId,
  onToggleExpansion,
  onReply,
  onCancelReply,
  onEdit,
  onDelete,
  onResolve,
  onReaction,
  onSubmitReply
}: CommentThreadProps) {
  const rootComment = thread.root_comment;
  const replies = thread.replies || [];
  const isResolved = thread.is_resolved;
  const replyCount = thread.reply_count;
  
  const hasReplies = replies.length > 0;
  const canResolve = rootComment.user_id === currentUserId || currentUserId === 'user-1'; // Admin check
  
  // Mock participant names for now
  const participantNames = ['User 1', 'User 2'];
  const unreadCount = 0; // Mock for now

  return (
    <Card className={`${isResolved ? 'opacity-75 border-green-200' : ''}`}>
      <CardContent className="p-4">
        {/* Thread Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className="p-1 h-auto"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">
                {hasReplies ? `${replies.length + 1} comments` : '1 comment'}
              </span>
              
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
              
              {isResolved && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {participantNames.slice(0, 3).join(', ')}
              {participantNames.length > 3 && ` +${participantNames.length - 3} more`}
            </span>
            
            {canResolve && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResolve}
                className="text-xs"
              >
                {isResolved ? (
                  <>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Unresolve
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Resolve
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Root Comment */}
        <CommentItem
          comment={rootComment}
          isThreadRoot
          isResolved={isResolved}
          onEdit={async (content: string) => onEdit(rootComment.id)}
          onDelete={async () => onDelete(rootComment.id)}
          onReact={async (emoji: string) => onReaction(rootComment.id, emoji)}
          onReply={async (content: string) => onReply()}
          onResolve={async (resolved: boolean) => onResolve()}
        />

        {/* Replies */}
        {isExpanded && hasReplies && (
          <div className="ml-8 mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                onEdit={async (content: string) => onEdit(reply.id)}
                onDelete={async () => onDelete(reply.id)}
                onReact={async (emoji: string) => onReaction(reply.id, emoji)}
                onReply={async (content: string) => onReply()}
              />
            ))}
          </div>
        )}

        {/* Reply Form */}
        {isReplying && (
          <div className="ml-8 mt-4 border-l-2 border-blue-200 pl-4">
            <CommentForm
              placeholder="Write a reply..."
              onSubmit={onSubmitReply}
              onCancel={onCancelReply}
              autoFocus
            />
          </div>
        )}

        {/* Quick Reply Button */}
        {!isReplying && isExpanded && (
          <div className="ml-8 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReply}
              className="text-blue-600 hover:text-blue-700"
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 