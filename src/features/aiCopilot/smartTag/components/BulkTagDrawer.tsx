"use client";
import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import TagConfidenceMeter from './TagConfidenceMeter';
import { SmartTagSuggestion } from '../models';

interface BulkTagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SmartTagSuggestion[];
  onApply: (selected: { bookmarkId: string; tags: string[] }) => void;
}

const BulkTagDrawer: React.FC<BulkTagDrawerProps> = ({ isOpen, onClose, suggestions, onApply }) => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const toggleSelect = (bookmarkId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) next.delete(bookmarkId);
      else next.add(bookmarkId);
      return next;
    });
  };

  const handleApply = () => {
    suggestions
      .filter((s) => selectedIds.has(s.bookmarkId))
      .forEach((s) => onApply({ bookmarkId: s.bookmarkId, tags: s.suggestedTags }));
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>AI Smart Tag Suggestions</DrawerTitle>
          <DrawerDescription>
            Review and apply tags suggested by AI. Select the bookmarks you want to tag.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 max-h-[60vh] overflow-y-auto space-y-4">
          {suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">No suggestions yet.</p>
          )}
          {suggestions.map((s) => (
            <div
              key={s.bookmarkId}
              className="border rounded-md p-3 flex items-center justify-between hover:bg-accent cursor-pointer"
              onClick={() => toggleSelect(s.bookmarkId)}
            >
              <div className="flex-1">
                <p className="font-medium">Bookmark: {s.bookmarkId}</p>
                <p className="text-sm text-muted-foreground">
                  Tags: {s.suggestedTags.join(', ')}
                </p>
              </div>
              <TagConfidenceMeter value={Math.max(...s.confidenceScores)} />
              <input
                type="checkbox"
                checked={selectedIds.has(s.bookmarkId)}
                onChange={() => toggleSelect(s.bookmarkId)}
                className="ml-4 form-checkbox h-4 w-4 text-primary"
              />
            </div>
          ))}
        </div>

        <DrawerFooter>
          <Button onClick={handleApply} disabled={selectedIds.size === 0}>
            Apply Tags
          </Button>
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default BulkTagDrawer;