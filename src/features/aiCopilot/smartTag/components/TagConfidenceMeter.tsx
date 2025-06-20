"use client";
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface TagConfidenceMeterProps {
  value: number; // 0-1
}

const TagConfidenceMeter: React.FC<TagConfidenceMeterProps> = ({ value }) => {
  const percent = Math.round(value * 100);
  const color = percent > 75 ? 'bg-green-500' : percent > 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col items-center justify-center w-20">
      <Progress
        value={percent}
        className={color + ' h-2 w-full rounded-full'}
      />
      <span className="text-xs mt-1 text-muted-foreground">{percent}%</span>
    </div>
  );
};

export default TagConfidenceMeter;