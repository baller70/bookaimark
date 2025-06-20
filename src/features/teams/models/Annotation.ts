import { z } from "zod";

export interface Annotation {
  id: string;
  collectionId: string;
  bookmarkUrl: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  mentions?: string[]; // array of userIds
  createdAt: string;
  updatedAt: string;
}

export const AnnotationSchema = z.object({
  id: z.string().uuid(),
  collectionId: z.string().uuid(),
  bookmarkUrl: z.string().url(),
  authorId: z.string().uuid(),
  content: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
  mentions: z.array(z.string().uuid()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AnnotationInput = z.input<typeof AnnotationSchema>;
export type AnnotationOutput = z.output<typeof AnnotationSchema>;