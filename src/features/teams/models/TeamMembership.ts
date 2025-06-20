import { z } from "zod";

// --------------------------------------------------
// Domain Model
// --------------------------------------------------

/**
 * Represents a user's association with a Team plus their role & membership state.
 */
export interface TeamMembership {
  id: string; // uuid
  teamId: string; // foreign key to Team
  userId: string; // foreign key to auth.users
  role: TeamRole;
  status: MembershipStatus;
  invitedBy?: string | null; // user id of inviter
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type TeamRole = "owner" | "admin" | "editor" | "viewer";

export type MembershipStatus = "pending" | "accepted" | "rejected";

// --------------------------------------------------
// Zod Schema
// --------------------------------------------------

export const TeamMembershipSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["owner", "admin", "editor", "viewer"]),
  status: z.enum(["pending", "accepted", "rejected"]),
  invitedBy: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TeamMembershipInput = z.input<typeof TeamMembershipSchema>;
export type TeamMembershipOutput = z.output<typeof TeamMembershipSchema>;