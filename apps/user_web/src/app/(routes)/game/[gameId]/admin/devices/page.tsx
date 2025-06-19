"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listenGame } from "@/app/_repositories/game_repository";
import { Game } from "@/app/_types";

export default function DevicesPage() {
  const params = useParams();
  const gameId = params?.gameId as string;
  const [users, setUsers] = useState<Game["users"]>([]);

  useEffect(() => {
    if (!gameId) return;
    const unsub = listenGame(gameId, (game) => {
      if (game?.users) setUsers(game.users);
    });
    return () => unsub && unsub();
  }, [gameId]);

  // teamA~順番にソート
  const sortedUsers = users.sort((a, b) => {
    const teamA = a.id.toLowerCase();
    const teamB = b.id.toLowerCase();
    return teamA.localeCompare(teamB);
  });

  return (
    <div>
      <h1>全ユーザー画面（devices）</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {sortedUsers.map((user) => (
          <div key={user.id} style={{ border: "1px solid #ccc", margin: 4 }}>
            <div style={{ textAlign: "center", fontSize: 32 }}>{user.name}</div>
            <div
              style={{
                textAlign: "center",
                fontSize: 16,
                color: "#666",
                marginBottom: 8,
              }}
            >
              {user.id}
            </div>
            <iframe
              src={`/game/${gameId}/user/${user.id}/`}
              width={480}
              height={900}
              style={{ border: "none" }}
              title={user.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
