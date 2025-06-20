import { z } from 'zod';

export const AddBookmarkDTO = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  url: z.string().url(),
});

export const UpdatePositionDTO = z.object({
  position: z.number().optional(),
  order: z.number().int().min(0).max(9).optional(),
});