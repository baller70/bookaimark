import { z } from "zod";

export type LinkStatus = "valid" | "broken" | "redirected" | "unknown";

export interface BookmarkStatus {
  id: string;
  collectionId: string;
  url: string;
  status: LinkStatus;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const BookmarkStatusSchema = z.object({
  id: z.string().uuid(),
  collectionId: z.string().uuid(),
  url: z.string().url(),
  status: z.enum(["valid", "broken", "redirected", "unknown"]),
  lastCheckedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BookmarkStatusInput = z.input<typeof BookmarkStatusSchema>;
export type BookmarkStatusOutput = z.output<typeof BookmarkStatusSchema>;