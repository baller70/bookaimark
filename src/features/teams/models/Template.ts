import { z } from "zod";

export interface Template {
  id: string;
  teamId?: string | null; // null means global template
  name: string;
  description?: string | null;
  data: unknown; // JSON blob of bookmarks & metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const TemplateSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(150),
  description: z.string().max(500).optional().nullable(),
  data: z.unknown(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TemplateInput = z.input<typeof TemplateSchema>;
export type TemplateOutput = z.output<typeof TemplateSchema>;