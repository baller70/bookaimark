import React from 'react';

export interface TimelineAxisProps {
  /**
   * Optional number of slots shown along the axis. Default is 10.
   */
  slots?: number;
}

/**
 * TimelineAxis
 * ------------
 * Renders a horizontal timeline axis with evenly spaced tick marks.
 */
const TimelineAxis: React.FC<TimelineAxisProps> = ({ slots = 10 }) => {
  return (
    <div className="w-full h-20 relative border-t border-gray-300">
      {Array.from({ length: slots + 1 }).map((_, idx) => (
        <div
          key={idx}
          className="absolute top-0 h-full border-l border-gray-300"
          style={{ left: `${(idx / slots) * 100}%` }}
        >
          <span className="absolute -top-5 text-xs text-gray-500">{idx}</span>
        </div>
      ))}
    </div>
  );
};

export default TimelineAxis;