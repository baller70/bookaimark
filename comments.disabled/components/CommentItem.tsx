'use client';

import React, { useState } from 'react';
import { Comment } from '../types';
import { CommentEditor } from './CommentEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Reply, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Circle,
  Heart,
  ThumbsUp,
  Smile,
  Paperclip
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
  comment: Comment;
  isThreadRoot?: boolean;
  isReply?: boolean;
  isResolved?: boolean;
  parentId?: string;
  onReply?: (content: string, attachments?: File[]) => Promise<void>;
  onEdit?: (content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onResolve?: (resolved: boolean) => Promise<void>;
  onReact?: (emoji: string) => Promise<void>;
  className?: string;
}

export function CommentItem({
  comment,
  isThreadRoot = false,
  isReply = false,
  isResolved = false,
  parentId,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onReact,
  className
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleReply = async (content: string, attachments?: File[]) => {
    if (onReply) {
      await onReply(content, attachments);
      setShowReplyForm(false);
    }
  };

  const handleEdit = async (content: string) => {
    if (onEdit) {
      setIsEditing(true);
      try {
        await onEdit(content);
        setShowEditForm(false);
      } finally {
        setIsEditing(false);
      }
    }
  };

  const handleReaction = async (emoji: string) => {
    if (onReact) {
      await onReact(emoji);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const reactions = comment.reactions || {};
  const hasReactions = Object.keys(reactions).length > 0;

  return (
    <div className={cn('group', className)}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author?.avatar_url} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.author?.full_name, comment.author?.email)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">
              {comment.author?.full_name || comment.author?.email || 'Unknown User'}
            </span>
            
            {comment.is_edited && (
              <Badge variant="outline" className="text-xs">
                edited
              </Badge>
            )}
            
            {isThreadRoot && isResolved && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Resolved
              </Badge>
            )}

            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isReply && onReply && (
                  <DropdownMenuItem onClick={() => setShowReplyForm(true)}>
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                
                {onEdit && (
                  <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}

                {isThreadRoot && onResolve && (
                  <DropdownMenuItem 
                    onClick={() => onResolve(!isResolved)}
                  >
                    {isResolved ? (
                      <>
                        <Circle className="w-4 h-4 mr-2" />
                        Reopen
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve
                      </>
                    )}
                  </DropdownMenuItem>
                )}

                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {showEditForm ? (
            <CommentEditor
              initialContent={comment.content}
              onSubmit={handleEdit}
              onCancel={() => setShowEditForm(false)}
              placeholder="Edit your comment..."
              compact
              autoFocus
            />
          ) : (
            <div className="text-sm mb-3 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {comment.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="truncate max-w-[150px]">
                      {attachment.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reactions */}
          {hasReactions && (
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.entries(reactions).map(([emoji, userIds]) => (
                <Button
                  key={emoji}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleReaction(emoji)}
                >
                  <span className="mr-1">{emoji}</span>
                  {userIds.length}
                </Button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 text-xs">
            {!isReply && onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowReplyForm(true)}
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}

            {onReact && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleReaction('👍')}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleReaction('❤️')}
                >
                  <Heart className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleReaction('😄')}
                >
                  <Smile className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentEditor
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
                compact
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 