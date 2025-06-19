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

  return (
    <div>
      <h1>全ユーザー画面（devices）</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {users.map((user) => (
          <div key={user.id} style={{ border: "1px solid #ccc", margin: 4 }}>
            <div style={{ textAlign: "center", fontSize: 32 }}>{user.name}</div>
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
