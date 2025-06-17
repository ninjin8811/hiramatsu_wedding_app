"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Background from "@/app/_images/Background.png";
import RankingResultTitleContainer from "@/app/_images/RankingResultTitleContainer.png";
import RankingItemGorgeous from "./RankingItemGorgeous";
import styles from "./ResultPage.module.scss";
import { Game } from "@/app/_types";
import { motion } from "framer-motion";
import { listenGame } from "@/app/_repositories/game_repository";

type Props = {
  gameId: string;
  game: Game;
};

export default function ResultPage(props: Props) {
  const teams = props.game.users;
  const [game, setGame] = useState(props.game);

  useEffect(() => {
    const unsubscribe = listenGame(props.gameId, (g) => setGame(g as Game));
    return unsubscribe;
  }, [props.gameId]);

  const ranking = teams.sort((a, b) => b.score - a.score);

  return (
    <div className={styles.container}>
      <Image
        src={Background}
        alt="Background"
        className={styles.backgroundImage}
      />
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <Image
            src={RankingResultTitleContainer}
            alt="Title Background"
            className={styles.titleBackground}
          />
          <h1 className={styles.title}>ランキング発表</h1>
        </div>
        {game.finalRankingStatus !== "announcing_winner" ? (
          <div className={styles.announcingWinnerContainer}>
            <h1 className={styles.announcingWinnerContainer_title}>
              ランキング発表中...
            </h1>
          </div>
        ) : (
          <div className={styles.rankingContainer}>
            {ranking.map((team, index) => (
              <div
                key={index}
                style={{
                  marginTop: index === 3 ? "20px" : "0",
                  width: "100%",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <RankingItemGorgeous
                    rank={index + 1}
                    name={team.name}
                    score={team.score}
                    thumbnail={team.thumbnail} // thumbnail は string URL
                  />
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
