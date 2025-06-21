'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send,
  Paperclip,
  AtSign,
  X
} from 'lucide-react';

interface CommentFormProps {
  placeholder?: string;
  onSubmit: (content: string, mentions: string[]) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  currentUserAvatar?: string;
  currentUserName?: string;
  availableUsers?: Array<{ id: string; name: string; avatar?: string }>;
}

export function CommentForm({
  placeholder = "Write a comment...",
  onSubmit,
  onCancel,
  autoFocus = false,
  currentUserAvatar = '/placeholder-avatar.jpg',
  currentUserName = 'John Doe',
  availableUsers = [
    { id: 'user-2', name: 'Jane Smith', avatar: '/placeholder-avatar.jpg' },
    { id: 'user-3', name: 'Mike Johnson', avatar: '/placeholder-avatar.jpg' }
  ]
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), mentions);
      setContent('');
      setMentions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setContent(newContent);
    setCursorPosition(cursorPos);
    
    // Check for @ mentions
    const beforeCursor = newContent.slice(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentionPicker(true);
    } else {
      setShowMentionPicker(false);
      setMentionQuery('');
    }
  };

  const insertMention = (user: { id: string; name: string }) => {
    const beforeCursor = content.slice(0, cursorPosition);
    const afterCursor = content.slice(cursorPosition);
    
    // Replace the @query with @username
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const beforeMention = beforeCursor.slice(0, mentionMatch.index);
      const newContent = `${beforeMention}@${user.name.replace(' ', '')} ${afterCursor}`;
      
      setContent(newContent);
      setMentions(prev => [...prev, user.id]);
      setShowMentionPicker(false);
      setMentionQuery('');
      
      // Focus back to textarea
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = beforeMention.length + user.name.length + 2;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* User Avatar and Form */}
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={currentUserAvatar} alt={currentUserName} />
          <AvatarFallback>
            {currentUserName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          {/* Text Input */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none"
              rows={3}
            />
            
            {/* Mention Picker */}
            {showMentionPicker && filteredUsers.length > 0 && (
              <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="py-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => insertMention(user)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mentions Display */}
          {mentions.length > 0 && (
            <div className="flex items-center space-x-2">
              <AtSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Mentioning: {mentions.map(id => 
                  availableUsers.find(u => u.id === id)?.name || 'Unknown'
                ).join(', ')}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-8">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <AtSign className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availableUsers.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => insertMention(user)}
                      className="flex items-center space-x-2"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center space-x-2">
              {onCancel && (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
              
              <Button 
                size="sm" 
                onClick={handleSubmit}
                disabled={!content.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                {onCancel ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="text-xs text-gray-500">
            Press Cmd+Enter to submit{onCancel && ', Escape to cancel'}
          </div>
        </div>
      </div>
    </div>
  );
} 