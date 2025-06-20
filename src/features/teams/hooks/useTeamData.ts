import { useEffect, useState } from "react";
import {
  Team,
  SharedCollection,
  TeamInput,
} from "../models";

interface UseTeamDataReturn {
  team: Team | null;
  collections: SharedCollection[];
  isLoading: boolean;
}

/**
 * Temporary stub hook to fetch team details & collections.
 * Replace with real data fetching (TanStack Query / SWR / tRPC) later.
 */
export function useTeamData(teamId: string): UseTeamDataReturn {
  const [state, setState] = useState<UseTeamDataReturn>({
    team: null,
    collections: [],
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchMock() {
      // Simulate async call
      await new Promise((r) => setTimeout(r, 500));
      if (!isMounted) return;

      const mockTeam: Team = {
        id: teamId,
        slug: "demo-team",
        name: "Demo Team",
        description: "This is a placeholder team used for UI scaffolding.",
        plan: "pro",
        ownerId: "00000000-0000-0000-0000-000000000000",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as TeamInput as Team;

      const mockCollections: SharedCollection[] = [
        {
          id: "11111111-1111-1111-1111-111111111111",
          teamId: teamId,
          name: "Onboarding Links",
          description: "Resources for new team members.",
          createdBy: mockTeam.ownerId,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          teamId: teamId,
          name: "Engineering Handbook",
          description: "Technical guidelines and best practices.",
          createdBy: mockTeam.ownerId,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setState({ team: mockTeam, collections: mockCollections, isLoading: false });
    }

    fetchMock();

    return () => {
      isMounted = false;
    };
  }, [teamId]);

  return state;
}