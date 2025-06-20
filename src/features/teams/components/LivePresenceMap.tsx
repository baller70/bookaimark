import React, { useCallback, useEffect, useRef } from "react";
import { PresenceUser } from "../hooks/useRealTimePresence";
import { useRealTimePresence } from "../hooks/useRealTimePresence";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LivePresenceMapProps {
  teamId: string;
  currentUser: PresenceUser;
  /** Width and height of the collaborative canvas */
  width?: number;
  height?: number;
}

/**
 * Displays avatars/cursors of all online team members in real-time.
 * Simplified placeholder rendering until full canvas is integrated.
 */
export const LivePresenceMap: React.FC<LivePresenceMapProps> = ({
  teamId,
  currentUser,
  width = 800,
  height = 600,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { users, updateCursor } = useRealTimePresence(teamId, currentUser);

  // Broadcast mouse movement as cursor updates
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateCursor({ x, y });
    },
    [updateCursor]
  );

  // Prevent text selection dragging
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("dragstart", (e) => e.preventDefault());
    return () => {
      el.removeEventListener("dragstart", (e) => e.preventDefault());
    };
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative border rounded-md bg-muted overflow-hidden"
        style={{ width, height }}
      >
        {/* Render cursors */}
        {users.map((user) => {
          if (!user.cursor) return null;
          return (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <div
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: user.cursor.x,
                    top: user.cursor.y,
                  }}
                >
                  <Avatar className="h-6 w-6 border-2 border-background rounded-full">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {user.name[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4} className="text-xs">
                {user.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default LivePresenceMap;