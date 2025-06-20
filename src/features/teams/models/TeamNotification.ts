import { z } from "zod";

export type NotificationType =
  | "collection_created"
  | "collection_updated"
  | "comment_added"
  | "member_invited"
  | "member_joined"
  | "role_changed"
  | "reminder"
  | "export_completed";

export interface TeamNotification {
  id: string;
  teamId: string;
  recipientId: string; // user id who will see/receive the notification
  type: NotificationType;
  message: string;
  payload?: unknown; // JSON payload for client to interpret
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export const TeamNotificationSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  recipientId: z.string().uuid(),
  type: z.enum([
    "collection_created",
    "collection_updated",
    "comment_added",
    "member_invited",
    "member_joined",
    "role_changed",
    "reminder",
    "export_completed",
  ]),
  message: z.string().max(300),
  payload: z.unknown().optional(),
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().nullable().optional(),
});

export type TeamNotificationInput = z.input<typeof TeamNotificationSchema>;
export type TeamNotificationOutput = z.output<typeof TeamNotificationSchema>;