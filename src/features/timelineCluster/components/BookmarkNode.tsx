import React from 'react';
import { BookmarkNode as BookmarkNodeType } from '../types';

export interface BookmarkNodeProps {
  bookmark: BookmarkNodeType;
}

/**
 * BookmarkNode
 * ------------
 * Represents a draggable bookmark card. Drag logic will be added later.
 */
const BookmarkNode: React.FC<BookmarkNodeProps> = ({ bookmark }) => {
  return (
    <div
      className="w-20 h-12 bg-white border border-gray-300 rounded-md flex items-center justify-center text-xs cursor-move"
      data-id={bookmark.id}
    >
      {bookmark.title}
    </div>
  );
};

export default BookmarkNode;