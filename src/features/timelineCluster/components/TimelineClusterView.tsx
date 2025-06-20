import React from 'react';
import { FolderContainer as FolderContainerType } from '../types';
import FolderContainer from './FolderContainer';
import TimelineAxis from './TimelineAxis';

export interface TimelineClusterViewProps {
  folder: FolderContainerType;
}

/**
 * TimelineClusterView
 * -------------------
 * Splits the viewport into a wireframe mockup and the live timeline axis.
 * This is a skeleton component – logic and styling will be implemented later.
 */
const TimelineClusterView: React.FC<TimelineClusterViewProps> = ({ folder }) => {
  return (
    <div className="flex w-full h-full gap-4">
      {/* Left Pane – Wireframe */}
      <div className="w-1/2 border-dashed border-2 border-gray-300 p-4 flex items-start justify-center">
        <FolderContainer folder={folder} isWireframe />
      </div>

      {/* Right Pane – Live Timeline */}
      <div className="w-1/2 p-4 flex flex-col gap-4">
        <FolderContainer folder={folder} />
        <TimelineAxis />
      </div>
    </div>
  );
};

export default TimelineClusterView;