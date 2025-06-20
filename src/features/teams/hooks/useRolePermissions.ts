import { useEffect, useState } from "react";

export type TeamRole = "owner" | "admin" | "editor" | "viewer";

interface RolePermissions {
  role: TeamRole;
  canManageCollections: boolean;
  canInviteMembers: boolean;
  canManageTemplates: boolean;
}

/**
 * Temporary stub hook to return RBAC-derived permissions for the current user within a team.
 * Replace with actual auth/permissions integration later.
 */
export function useRolePermissions(teamId: string): RolePermissions {
  const [state, setState] = useState<RolePermissions>({
    role: "viewer",
    canManageCollections: false,
    canInviteMembers: false,
    canManageTemplates: false,
  });

  useEffect(() => {
    // TODO: fetch real role based on authenticated user & teamId
    // Placeholder: treat the first team as owner
    setState({
      role: "owner",
      canManageCollections: true,
      canInviteMembers: true,
      canManageTemplates: true,
    });
  }, [teamId]);

  return state;
}