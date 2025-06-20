import { z } from "zod";

// --------------------------------------------------
// Domain Model
// --------------------------------------------------

/**
 * Team represents an organisation or workspace within the application.
 * A Team can own multiple bookmark collections and has its own member roster.
 */
export interface Team {
  /** Primary key (uuid) */
  id: string;

  /** Read-friendly identifier (unique per team). */
  slug: string;

  /** Display name. */
  name: string;

  /** Optional long-form description or mission statement. */
  description?: string | null;

  /** Subscription plan governing feature access. */
  plan: TeamPlan;

  /** Owner user id (first creator, always retains Owner role). */
  ownerId: string;

  /** Timestamps */
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/** Subscription tiers that unlock different capabilities. */
export type TeamPlan = "free" | "pro" | "enterprise";

// --------------------------------------------------
// Zod Validation Schema
// --------------------------------------------------

export const TeamSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric with hyphens"),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  plan: z.enum(["free", "pro", "enterprise"]),
  ownerId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TeamInput = z.input<typeof TeamSchema>;  // For create/update DTOs
export type TeamOutput = z.output<typeof TeamSchema>;