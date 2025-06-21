import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./TeamsScreen.module.css";
import { GameScreen } from "../page";
import { AnimatePresence, motion } from "framer-motion";
import { Game } from "@/app/_types";
import { listenGame } from "@/app/_repositories/game_repository";
import TeamsTitleImg from "../../../../../_images/TeamsTitle.png";
import CapImage from "../../user/_components/CapImage/CapImage";
import AnimatedBackground from "./AnimatedBackground";

// チームカラーの定義
const characterColors = new Map<number, string>([
  [0, "#FB0025"],
  [1, "#DE6100"],
  [2, "#EDDD00"],
  [3, "#0CD600"],
  [4, "#00A337"],
  [5, "#00D3F4"],
  [6, "#0062D2"],
  [7, "#6F00CA"],
  [8, "#ED009B"],
  [9, "#BD8527"],
  [10, "#705126"],
  [11, "#313131"],
  [12, "#676767"],
  [13, "#CFCFCF"],
  [14, "#B779EC"],
  [15, "#FA7AE6"],
]);

interface TeamsScreenProps {
  gameId: string;
  onNavigate: (screen: GameScreen) => void;
}

const TeamsScreen: React.FC<TeamsScreenProps> = ({ gameId, onNavigate }) => {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!gameId) return;
    const unsub = listenGame(gameId, (gameData) => {
      if (gameData) {
        const sortedUsers = [...gameData.users].sort((a, b) =>
          a.id.localeCompare(b.id)
        );
        setGame({ ...gameData, users: sortedUsers });
      } else {
        setGame(null);
      }
    });
    return () => unsub && unsub();
  }, [gameId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "Enter") {
        onNavigate("quiz");
      } else if (event.key === "ArrowLeft") {
        onNavigate("waiting");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNavigate]);

  const getCapIndex = (teamId: string) => {
    const lastChar = teamId.toLowerCase().slice(-1);
    const index = lastChar.charCodeAt(0) - "a".charCodeAt(0);
    return index >= 0 ? index : 0;
  };

  const getTeamColor = (index: number) => {
    const color =
      characterColors.get(index % characterColors.size) || "#FB0025";
    return color;
  };

  const getStableTeamColor = (hexColor: string) => {
    // HEXカラーをRGBに変換
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // 彩度を少し下げて安定させる
    const factor = 0.85;
    const newR = Math.floor(r * factor + (255 - 255 * factor));
    const newG = Math.floor(g * factor + (255 - 255 * factor));
    const newB = Math.floor(b * factor + (255 - 255 * factor));

    // 透明度を追加（80%の不透明度）
    return `rgba(${newR}, ${newG}, ${newB}, 0.5)`;
  };

  const getContrastTextColor = (hexColor: string) => {
    // HEXカラーをRGBに変換
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // 相対輝度を計算（WCAG基準）
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // 輝度が0.5以上の場合は黒、それ以外は白
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
    <main className={styles.main}>
      <AnimatedBackground className={styles.background} />

      <div className={styles.container}>
        <div className={styles.header}>
          <Image
            src={TeamsTitleImg}
            alt="Teams"
            className={styles.titleImage}
          />
        </div>
        {game && (
          <div className={styles.content}>
            <div className={styles.teamsGrid}>
              {game.users.map((user, index) => (
                <AnimatePresence key={user.id}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 0 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                      delay: index * 0.1,
                    }}
                    exit={{ scale: 0, opacity: 0, y: 0 }}
                    className={styles.teamItem}
                    style={{
                      background: `linear-gradient(to bottom, ${getStableTeamColor(
                        getTeamColor(index)
                      )} 70%, ${getStableTeamColor(
                        getTeamColor(index)
                      )} 75%, rgba(255, 255, 255, 0.9) 80%, rgba(255, 255, 255, 0.9) 100%)`,
                    }}
                  >
                    <div
                      className={styles.imageContainer}
                      style={{
                        borderColor: getTeamColor(index),
                      }}
                    >
                      <Image
                        src={user.thumbnail}
                        alt={user.name}
                        width={200}
                        height={200}
                        className={styles.teamImage}
                      />
                      <motion.div
                        className={styles.capContainer}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          delay: 0.5 + index * 0.1,
                        }}
                      >
                        <CapImage
                          index={getCapIndex(user.id)}
                          className={styles.capImage}
                          width={100}
                          height={100}
                        />
                      </motion.div>
                    </div>
                    <div
                      className={styles.teamName}
                      style={{
                        color: "#333333",
                      }}
                    >
                      {user.name}
                    </div>
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default TeamsScreen;
