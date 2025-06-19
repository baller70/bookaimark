'use client';

import React, { useState, useRef } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CommentList } from './CommentList';
import { CommentEditor } from './CommentEditor';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface InlineCommentMarkerProps {
  entityType: 'document' | 'task' | 'media' | 'bookmark';
  entityId: string;
  position?: {
    x: number;
    y: number;
  };
  commentCount?: number;
  hasUnread?: boolean;
  className?: string;
  variant?: 'floating' | 'inline' | 'sidebar';
  onCommentCreate?: (content: string, attachments?: File[]) => Promise<void>;
}

export function InlineCommentMarker({
  entityType,
  entityId,
  position,
  commentCount = 0,
  hasUnread = false,
  className,
  variant = 'floating',
  onCommentCreate
}: InlineCommentMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleCreateComment = async (content: string, attachments?: File[]) => {
    if (onCommentCreate) {
      await onCommentCreate(content, attachments);
      setShowNewCommentForm(false);
    }
  };

  const markerStyles = {
    floating: cn(
      'absolute z-50 shadow-lg',
      position && `left-[${position.x}px] top-[${position.y}px]`
    ),
    inline: 'relative inline-flex',
    sidebar: 'relative'
  };

  const triggerButton = (
    <Button
      ref={triggerRef}
      variant={hasUnread ? "default" : "outline"}
      size="sm"
      className={cn(
        'h-8 w-8 p-0 rounded-full transition-all duration-200 hover:scale-110',
        hasUnread && 'animate-pulse bg-orange-500 hover:bg-orange-600',
        commentCount > 0 ? 'opacity-100' : 'opacity-60 hover:opacity-100',
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      <MessageSquare className="h-4 w-4" />
      {commentCount > 0 && (
        <Badge 
          variant={hasUnread ? "secondary" : "outline"} 
          className={cn(
            'absolute -top-1 -right-1 h-5 w-5 p-0 text-xs',
            hasUnread && 'bg-orange-500 text-white'
          )}
        >
          {commentCount > 99 ? '99+' : commentCount}
        </Badge>
      )}
    </Button>
  );

  if (variant === 'sidebar') {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
            {commentCount > 0 && (
              <Badge variant="secondary">
                {commentCount}
              </Badge>
            )}
            {hasUnread && (
              <Badge variant="destructive">
                New
              </Badge>
            )}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewCommentForm(!showNewCommentForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        </div>

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

        <CommentList
          entityType={entityType}
          entityId={entityId}
          showHeader={false}
        />
      </div>
    );
  }

  return (
    <div className={markerStyles[variant]}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {triggerButton}
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-96 p-0" 
          align="start"
          side="right"
          sideOffset={8}
        >
          <Card className="border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                  {hasUnread && (
                    <Badge variant="destructive" className="text-xs">
                      New
                    </Badge>
                  )}
                </h4>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCommentForm(!showNewCommentForm)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {showNewCommentForm && (
                <div className="mb-4">
                  <CommentEditor
                    onSubmit={handleCreateComment}
                    onCancel={() => setShowNewCommentForm(false)}
                    placeholder="Add a comment..."
                    entityType={entityType}
                    entityId={entityId}
                    compact
                  />
                </div>
              )}

              <div className="max-h-96 overflow-y-auto">
                <CommentList
                  entityType={entityType}
                  entityId={entityId}
                  showHeader={false}
                  showStats={false}
                  className="border-0 shadow-none"
                />
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
} 