/// <reference types="jest" />
import { HttpTimelineService } from '../services/TimelineService';
import { BookmarkNode, TimelineItem } from '../types';

// Mock global fetch
const fetchMock = jest.fn();
// @ts-ignore
global.fetch = fetchMock;

const BASE_URL = '/api';

const service = new HttpTimelineService(BASE_URL);

describe('HttpTimelineService', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('fetches folder items', async () => {
    const mockItems: TimelineItem[] = [
      {
        id: '1',
        folderId: 'f1',
        bookmarkId: 'b1',
        position: 0,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockItems) });

    const result = await service.getFolderItems('f1');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/timeline/f1`);
    expect(result).toEqual(mockItems);
  });

  it('adds bookmark', async () => {
    const bookmark: BookmarkNode = { id: 'b2', title: 'Title', url: 'https://example.com' };
    const created: TimelineItem = {
      id: '2',
      folderId: 'f1',
      bookmarkId: bookmark.id,
      position: 1,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(created) });

    const result = await service.addBookmark('f1', bookmark);

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/timeline/f1/items`, expect.any(Object));
    expect(result).toEqual(created);
  });

  it('updates item position', async () => {
    const updated: TimelineItem = {
      id: '1',
      folderId: 'f1',
      bookmarkId: 'b1',
      position: 2,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(updated) });

    const result = await service.updateItemPosition('1', { position: 2 });

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/timeline/items/1/position`, expect.any(Object));
    expect(result.position).toBe(2);
  });

  it('deletes item', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });

    await service.deleteItem('1');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/timeline/items/1`, { method: 'DELETE' });
  });
});