import { useEffect, useRef, useState } from "react";

export interface PresenceUser {
  userId: string;
  name: string;
  avatarUrl?: string;
  cursor?: { x: number; y: number };
  lastActiveAt: number;
}

interface UseRealTimePresenceOptions {
  /** Optional WebSocket endpoint override */
  endpoint?: string;
}

/**
 * Hook that connects to the presence WebSocket channel for a given team and emits / receives cursor + presence updates.
 * NOTE: This is a placeholder implementation that falls back to mocked presence data
 * when the WebSocket endpoint is unreachable.
 */
export function useRealTimePresence(
  teamId: string,
  currentUser: PresenceUser,
  { endpoint }: UseRealTimePresenceOptions = {}
) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url =
      endpoint || process.env.NEXT_PUBLIC_PRESENCE_WS_URL || "ws://localhost:4000";
    const socket = new WebSocket(`${url}/teams/${teamId}`);
    wsRef.current = socket;

    socket.onopen = () => {
      // Announce this user
      socket.send(JSON.stringify({ type: "join", payload: currentUser }));
    };

    socket.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        if (type === "presence") {
          setUsers(payload as PresenceUser[]);
        }
      } catch (err) {
        console.error("Failed to parse presence payload", err);
      }
    };

    socket.onerror = (err) => {
      console.warn("Presence socket error", err);
    };

    socket.onclose = () => {
      // Remove current user from list
      setUsers((prev) => prev.filter((u) => u.userId !== currentUser.userId));
    };

    // Cleanup
    return () => {
      socket.close();
    };
  }, [teamId, currentUser, endpoint]);

  /**
   * Send local cursor position to server (throttled by caller).
   */
  const updateCursor = (coords: { x: number; y: number }) => {
    wsRef.current?.send(
      JSON.stringify({ type: "cursor", payload: { ...coords, userId: currentUser.userId } })
    );
  };

  return { users, updateCursor };
}