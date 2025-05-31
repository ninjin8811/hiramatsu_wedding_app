"use client";
import React from "react";
import Image from "next/image";
import Background from "@/app/_images/Background.png";
import Confetti from "@/app/_images/Confetti.png";
import RankingResultTitleContainer from "@/app/_images/RankingResultTitleContainer.png";
import RankingItemGorgeous from "./RankingItemGorgeous";
import styles from "./FinalRankingScreen.module.scss";
import { Game } from "@/app/_types";

type Props = {
  gameId: string;
  game: Game;
};

export default function ResultPage({ game }: Props) {
  const teams = game.users;

  const ranking = teams.sort((a, b) => b.score - a.score);

  return (
    <div className={styles.container}>
      <Image
        src={Background}
        alt="Background"
        className={styles.backgroundImage}
      />
      {/* {showConfetti && ( */}
      {/* <div className={styles.confettiContainer}>
        <Image src={Confetti} alt="Confetti" className={styles.confettiImage} />
      </div> */}
      {/* )} */}
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <Image
            src={RankingResultTitleContainer} // StaticImageData オブジェクトではないため .src を使用
            alt="Title Background"
            className={styles.titleBackground}
          />
          <h1 className={styles.title}>ランキング発表</h1>
        </div>
        <div className={styles.rankingContainer}>
          {ranking.map((team, index) => (
            <div
              key={index}
              style={{
                marginTop: index === 3 ? "20px" : "0",
                width: "100%",
              }}
            >
              <RankingItemGorgeous
                rank={index + 1}
                name={team.name}
                score={team.score}
                thumbnail={team.thumbnail} // thumbnail は string URL
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
