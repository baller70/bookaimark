import React from 'react';
import { FolderContainer as FolderContainerType } from '../types';
import BookmarkNodeComponent from './BookmarkNode';

export interface FolderContainerProps {
  folder: FolderContainerType;
  /**
   * When true, renders placeholder slots instead of live items.
   */
  isWireframe?: boolean;
}

/**
 * FolderContainer
 * ---------------
 * Displays a dotted-outline folder box with up to 10 bookmark nodes.
 */
const FolderContainer: React.FC<FolderContainerProps> = ({ folder, isWireframe = false }) => {
  const renderItems = () => {
    if (isWireframe) {
      // Render 10 placeholder slots
      return Array.from({ length: 10 }).map((_, idx) => (
        <div
          key={idx}
          className="w-20 h-12 border border-dashed border-gray-400 flex items-center justify-center text-gray-400 text-xs"
        >
          {idx + 1}
        </div>
      ));
    }

    return folder.items.map((item) => (
      <BookmarkNodeComponent key={item.id} bookmark={{ id: item.bookmarkId, title: `Bookmark ${item.order + 1}`, url: '#' }} />
    ));
  };

  return (
    <div className="w-full border-dashed border-2 border-gray-400 p-4 rounded-md">
      <h3 className="text-sm font-medium mb-2">{folder.name}</h3>
      <div className="grid grid-cols-5 gap-2">{renderItems()}</div>
    </div>
  );
};

export default FolderContainer;