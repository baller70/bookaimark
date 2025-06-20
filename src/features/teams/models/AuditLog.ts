import { z } from "zod";

export interface AuditLog {
  id: string;
  teamId: string;
  actorId: string;
  action: string; // e.g. "update_collection"
  resourceType: string; // e.g. "collection", "bookmark"
  resourceId: string;
  diff?: unknown; // JSON diff of changes
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  actorId: z.string().uuid(),
  action: z.string().min(1),
  resourceType: z.string().min(1),
  resourceId: z.string().uuid(),
  diff: z.unknown().optional(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  createdAt: z.string().datetime(),
});

export type AuditLogInput = z.input<typeof AuditLogSchema>;
export type AuditLogOutput = z.output<typeof AuditLogSchema>;