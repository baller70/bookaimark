# Timeline Bookmark Cluster Feature

This feature provides an interactive timeline view where a **folder container** can hold up to **10 draggable bookmark nodes** that users drag onto a horizontal timeline axis.

## Folder Structure

```text
src/features/timelineCluster/
├─ components/           # React UI pieces
├─ hooks/                # Reusable hooks
├─ services/             # Client + server logic
├─ models/               # Prisma models
├─ tests/                # Jest / RTL / Supertest specs
├─ types.ts              # Shared interfaces
└─ README.md             # (this file)
```

## Quick Start

1. Install additional dev dependencies:

```bash
npm install --save-dev jest ts-jest @types/jest \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event supertest
```

2. Run the unit tests:

```bash
npm test
```

3. Run the app in dev mode:

```bash
npm run dev
```

## Environment Variables

Add these entries to your `.env.local`:

```env
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

## Component Usage

```tsx
import TimelineClusterView from '@/features/timelineCluster/components/TimelineClusterView';
import { FolderContainer } from '@/features/timelineCluster/types';

const folder: FolderContainer = {
  id: 'folder1',
  name: 'My Folder',
  items: [],
};

export default function ExamplePage() {
  return <TimelineClusterView folder={folder} />;
}
```

## WebSocket Events

The server emits `timelineCluster.updated` whenever a bookmark is added, moved, or removed. Clients can subscribe via:

```ts
import { timelineService } from '@/features/timelineCluster/services/TimelineService';

timelineService.subscribe('timelineCluster.updated', () => {
  // refetch or update state
});
```

## Testing

* **Unit tests**: `TimelineService.test.ts`  
* **Integration tests**: `api.test.ts` (controllers + Zod validation)  
* **Component tests**: `components.test.tsx` (rendering & placeholders)

Run them with `npm test`. All tests use Jest + React Testing Library (JS DOM environment).