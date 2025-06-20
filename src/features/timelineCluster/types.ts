export interface TimelineItem {
  id: string;
  folderId: string;
  bookmarkId: string;
  position: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkNode {
  id: string;
  title: string;
  url: string;
}

export interface FolderContainer {
  id: string;
  name: string;
  items: TimelineItem[];
}