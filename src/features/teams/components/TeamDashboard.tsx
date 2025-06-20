import React from "react";
import { useTeamData } from "../hooks/useTeamData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamDashboardProps {
  teamId: string;
}

/**
 * High-level dashboard displaying a team overview and recent collections.
 */
export const TeamDashboard: React.FC<TeamDashboardProps> = ({ teamId }) => {
  const { team, collections, isLoading } = useTeamData(teamId);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Team not found.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
        {team.description && (
          <p className="mt-1 text-muted-foreground max-w-prose">
            {team.description}
          </p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-lg transition">
            <CardHeader>
              <h3 className="font-semibold">{collection.name}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {collection.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TeamDashboard;