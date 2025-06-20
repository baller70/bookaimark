# AI Copilot – Smart Tag

This feature allows users to bulk-tag bookmarks using AI-generated suggestions.

## Components

- **BulkTagDrawer**: UI drawer that lists suggestions and lets you apply them in bulk.
- **TagConfidenceMeter**: Visual representation of confidence score.

## Hooks

- **useSmartTag**: Fetches suggestions and exposes history & apply helpers.

## Services

- **SmartTagService**: Low-level wrapper around `/api/ai-copilot/smart-tag` endpoints.

## Environment Variables

```
OPENAI_API_KEY=<your-key>
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Example

```tsx
const { analyzeTags, suggestions } = useSmartTag();

await analyzeTags(["bookmark-1", "bookmark-2"]);
```