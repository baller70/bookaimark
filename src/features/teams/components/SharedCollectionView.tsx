import React from "react";
import { SharedCollection } from "../models";
import { useTeamData } from "../hooks/useTeamData";
import { useRolePermissions } from "../hooks/useRolePermissions";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { MoreVertical, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SharedCollectionViewProps {
  teamId: string;
  onSelectCollection?: (collection: SharedCollection) => void;
}

/**
 * Displays a team's shared bookmark collections with basic management controls.
 */
export const SharedCollectionView: React.FC<SharedCollectionViewProps> = ({
  teamId,
  onSelectCollection,
}) => {
  const { collections, isLoading } = useTeamData(teamId);
  const { canManageCollections } = useRolePermissions(teamId);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Card key={collection.id} className="group relative">
          <CardHeader>
            <h3 className="font-semibold truncate pr-8">{collection.name}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {collection.description || "No description provided."}
            </p>
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-2">
            {onSelectCollection ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onSelectCollection(collection)}
              >
                Open
              </Button>
            ) : (
              <span />
            )}

            {/* Sharing Controls */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
              <Button size="icon" variant="ghost">
                <Share2 className="h-4 w-4" />
              </Button>
              {canManageCollections && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SharedCollectionView;