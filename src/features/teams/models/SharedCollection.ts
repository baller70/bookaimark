import { z } from "zod";

export interface SharedCollection {
  id: string;
  teamId: string;
  name: string;
  description?: string | null;
  createdBy: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SharedCollectionSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  name: z.string().min(1).max(150),
  description: z.string().max(500).optional().nullable(),
  createdBy: z.string().uuid(),
  isArchived: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SharedCollectionInput = z.input<typeof SharedCollectionSchema>;
export type SharedCollectionOutput = z.output<typeof SharedCollectionSchema>;