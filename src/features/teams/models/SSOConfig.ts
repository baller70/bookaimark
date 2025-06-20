import { z } from "zod";

export type SSOProvider = "saml" | "okta" | "azure_ad" | "google_workspace";

export interface SSOConfig {
  id: string;
  teamId: string;
  provider: SSOProvider;
  metadataUrl: string;
  entityId: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SSOConfigSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  provider: z.enum(["saml", "okta", "azure_ad", "google_workspace"]),
  metadataUrl: z.string().url(),
  entityId: z.string(),
  isEnabled: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SSOConfigInput = z.input<typeof SSOConfigSchema>;
export type SSOConfigOutput = z.output<typeof SSOConfigSchema>;