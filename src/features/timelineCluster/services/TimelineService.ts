import { TimelineItem, BookmarkNode } from '../types';

/**
 * TimelineService
 * ---------------
 * Thin wrapper around the REST API for timeline-cluster operations.
 * NOTE: This is a placeholder implementation to ensure type-checking passes.
 */
export interface ITimelineService {
  /** Returns all timeline items for the given folder */
  getFolderItems(folderId: string): Promise<TimelineItem[]>;
  /** Adds a new bookmark to the folder and returns the created TimelineItem */
  addBookmark(folderId: string, bookmark: BookmarkNode): Promise<TimelineItem>;
  /** Updates an item's position/order on the axis */
  updateItemPosition(
    itemId: string,
    params: { position?: number; order?: number }
  ): Promise<TimelineItem>;
  /** Removes an item from the timeline */
  deleteItem(itemId: string): Promise<void>;
}

/**
 * Basic fetch-based implementation. Swap out or extend as needed.
 */
export class HttpTimelineService implements ITimelineService {
  constructor(private readonly baseUrl = '/api') {}

  // --- Event Handling ---
  private listeners: Map<keyof EventMap, Set<Listener>> = new Map();

  subscribe(event: keyof EventMap, listener: Listener): () => void {
    const set = this.listeners.get(event) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(event, set);
    return () => {
      set.delete(listener);
    };
  }

  private emit(event: keyof EventMap) {
    this.listeners.get(event)?.forEach((fn) => fn());
  }

  async getFolderItems(folderId: string): Promise<TimelineItem[]> {
    const res = await fetch(`${this.baseUrl}/timeline/${folderId}`);
    if (!res.ok) throw new Error('Failed to fetch timeline items');
    return (await res.json()) as TimelineItem[];
  }

  async addBookmark(folderId: string, bookmark: BookmarkNode): Promise<TimelineItem> {
    const res = await fetch(`${this.baseUrl}/timeline/${folderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookmark),
    });
    if (!res.ok) throw new Error('Failed to add bookmark');
    const created = (await res.json()) as TimelineItem;
    this.emit('timelineCluster.updated');
    return created;
  }

  async updateItemPosition(
    itemId: string,
    params: { position?: number; order?: number }
  ): Promise<TimelineItem> {
    const res = await fetch(`${this.baseUrl}/timeline/items/${itemId}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to update item position');
    const item = (await res.json()) as TimelineItem;
    this.emit('timelineCluster.updated');
    return item;
  }

  async deleteItem(itemId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/timeline/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete item');
    this.emit('timelineCluster.updated');
  }
}

type Listener = () => void;
type EventMap = {
  'timelineCluster.updated': Listener;
};

export const timelineService = new HttpTimelineService();