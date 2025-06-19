'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMentionSuggestions } from '../hooks/useMentionSuggestions';
import { MentionSuggestion } from '../types';
import { 
  Send, 
  Paperclip, 
  X, 
  AtSign,
  Smile,
  Bold,
  Italic,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentEditorProps {
  onSubmit: (content: string, attachments?: File[]) => Promise<void> | void;
  onCancel?: () => void;
  placeholder?: string;
  entityType?: string;
  entityId?: string;
  initialContent?: string;
  className?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

export function CommentEditor({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  entityType,
  entityId,
  initialContent = '',
  className,
  autoFocus = false,
  compact = false
}: CommentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    suggestions,
    loading: mentionsLoading,
    searchSuggestions,
    clearSuggestions,
    selectedIndex,
    navigateUp,
    navigateDown
  } = useMentionSuggestions({
    entityType,
    entityId
  });

  // Handle content changes and detect @-mentions
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    setCursorPosition(cursorPos);

    // Check for @-mention trigger
    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex >= 0) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      
      // Check if we're in a mention context (no spaces after @)
      if (!textAfterAt.includes(' ') && textAfterAt.length <= 50) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        
        if (textAfterAt.length >= 1) {
          searchSuggestions(textAfterAt);
        }
      } else {
        setShowMentions(false);
        clearSuggestions();
      }
    } else {
      setShowMentions(false);
      clearSuggestions();
    }
  }, [searchSuggestions, clearSuggestions]);

  // Handle mention selection
  const handleMentionSelect = useCallback((suggestion: MentionSuggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textBeforeCursor = content.slice(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex >= 0) {
      const beforeMention = content.slice(0, atIndex);
      const afterCursor = content.slice(cursorPosition);
      const mentionText = `@${suggestion.display_name} `;
      
      const newContent = beforeMention + mentionText + afterCursor;
      setContent(newContent);
      
      // Set cursor position after the mention
      const newCursorPos = atIndex + mentionText.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }

    setShowMentions(false);
    clearSuggestions();
  }, [content, cursorPosition, clearSuggestions]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showMentions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateDown();
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleMentionSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowMentions(false);
          clearSuggestions();
          break;
      }
      return;
    }

    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [showMentions, suggestions, selectedIndex, navigateUp, navigateDown, handleMentionSelect, clearSuggestions]);

  // Handle file attachments
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!content.trim() && attachments.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), attachments);
      setContent('');
      setAttachments([]);
      setShowMentions(false);
      clearSuggestions();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, attachments, onSubmit, clearSuggestions]);

  const canSubmit = content.trim().length > 0 || attachments.length > 0;

  return (
    <div className={cn('relative', className)}>
      <Card className="p-4">
        <div className="space-y-4">
          {/* Main textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'min-h-[80px] resize-none',
                compact && 'min-h-[60px]'
              )}
              autoFocus={autoFocus}
              disabled={isSubmitting}
            />

            {/* Mention suggestions dropdown */}
            {showMentions && suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto">
                <div className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleMentionSelect(suggestion)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 text-left rounded-md hover:bg-muted transition-colors',
                        index === selectedIndex && 'bg-muted'
                      )}
                    >
                      {suggestion.avatar_url ? (
                        <img
                          src={suggestion.avatar_url}
                          alt={suggestion.display_name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <AtSign className="w-3 h-3" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {suggestion.display_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* File attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <Badge key={index} variant="secondary" className="gap-2">
                  <Paperclip className="w-3 h-3" />
                  <span className="text-xs truncate max-w-[100px]">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                size="sm"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Hint text */}
      <div className="text-xs text-muted-foreground mt-2">
        Press @ to mention someone • Ctrl+Enter to submit
      </div>
    </div>
  );
} 