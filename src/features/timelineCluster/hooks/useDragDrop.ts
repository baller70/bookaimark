import { useRef, useCallback } from 'react';

export interface UseDragDropReturn {
  draggableProps: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent<HTMLElement>) => void;
  };
  droppableProps: {
    onDragOver: (e: React.DragEvent<HTMLElement>) => void;
    onDrop: (e: React.DragEvent<HTMLElement>) => void;
  };
}

/**
 * useDragDrop
 * -----------
 * Very light wrapper around HTML5 Drag & Drop to provide common props.
 * A more robust implementation (e.g. using dnd-kit) can replace this later.
 */
export const useDragDrop = (): UseDragDropReturn => {
  const dragDataRef = useRef<string | null>(null);

  const onDragStart = useCallback((e: React.DragEvent<HTMLElement>) => {
    const id = e.currentTarget.getAttribute('data-id');
    if (id) {
      e.dataTransfer.setData('text/plain', id);
      dragDataRef.current = id;
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault(); // Necessary to allow drop
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragDataRef.current;
    console.log('Dropped item id:', id);
    // TODO: Notify drop context / state update here
    dragDataRef.current = null;
  }, []);

  return {
    draggableProps: {
      draggable: true,
      onDragStart,
    },
    droppableProps: {
      onDragOver,
      onDrop,
    },
  };
};