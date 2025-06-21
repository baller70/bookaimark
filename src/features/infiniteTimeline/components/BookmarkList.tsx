// Bookmark List - Scrollable list of bookmarks within a board
'use client';

import React, { useCallback } from 'react';
import { BookmarkData } from '../models/timeline.models';
import { BookmarkListItem } from './BookmarkListItem';

interface BookmarkListProps {
  boardId: string;
  bookmarks: BookmarkData[];
  isConnectorMode: boolean;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
  boardId,
  bookmarks,
  isConnectorMode
}) => {
  // Handle bookmark reordering within the same board
  const handleBookmarkReorder = useCallback((draggedId: string, targetId: string, position: 'before' | 'after') => {
    // This will be handled by the parent component or a drag-and-drop library
    console.log('Reorder bookmark:', { draggedId, targetId, position, boardId });
  }, [boardId]);

  if (bookmarks.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        <div className="text-center">
          <p>No bookmarks yet</p>
          <p className="text-xs mt-1">Click "Add Bookmark" to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 space-y-2">
        {bookmarks.map((bookmark, index) => (
          <BookmarkListItem
            key={bookmark.id}
            bookmark={bookmark}
            isConnectorMode={isConnectorMode}
            onReorder={handleBookmarkReorder}
          />
        ))}
      </div>
    </div>
  );
}; 