import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { timelineService } from './TimelineService';

// Simple broadcaster placeholder – in production this would emit via WebSocket/Socket.IO
function broadcast(event: 'timelineCluster.updated') {
  // eslint-disable-next-line no-console
  console.log(`Broadcasting WS event: ${event}`);
}

// --------------------
// Zod Schemas (DTOs)
// --------------------
export const AddBookmarkDTO = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  url: z.string().url(),
});

export const UpdatePositionDTO = z.object({
  position: z.number().optional(),
  order: z.number().int().min(0).max(9).optional(),
});

// --------------------
// Controller Handlers
// --------------------
// NOTE: These are skeleton implementations and should be mapped to Next.js "route.ts" files.
// Each handler simply validates the body and delegates to the service.

export async function GET(request: NextRequest, { params }: { params: { folderId: string } }) {
  const { folderId } = params;
  const items = await timelineService.getFolderItems(folderId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest, { params }: { params: { folderId: string } }) {
  const { folderId } = params;
  const body = await request.json();
  const parsed = AddBookmarkDTO.parse(body);
  const item = await timelineService.addBookmark(folderId, parsed);
  broadcast('timelineCluster.updated');
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: { itemId: string } }) {
  const { itemId } = params;
  const body = await request.json();
  const parsed = UpdatePositionDTO.parse(body);
  const item = await timelineService.updateItemPosition(itemId, parsed);
  broadcast('timelineCluster.updated');
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest, { params }: { params: { itemId: string } }) {
  const { itemId } = params;
  await timelineService.deleteItem(itemId);
  broadcast('timelineCluster.updated');
  return new NextResponse(null, { status: 204 });
}