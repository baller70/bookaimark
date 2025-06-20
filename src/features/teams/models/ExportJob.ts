import { z } from "zod";

export type ExportFormat = "csv" | "json";
export type ExportJobStatus = "pending" | "in_progress" | "completed" | "failed";

export interface ExportJob {
  id: string;
  teamId: string;
  requestedBy: string;
  format: ExportFormat;
  status: ExportJobStatus;
  downloadUrl?: string | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export const ExportJobSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  requestedBy: z.string().uuid(),
  format: z.enum(["csv", "json"]),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  downloadUrl: z.string().url().nullable().optional(),
  error: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable().optional(),
});

export type ExportJobInput = z.input<typeof ExportJobSchema>;
export type ExportJobOutput = z.output<typeof ExportJobSchema>;