import { ReactNode } from "react";
import styles from "./TeamPage.module.scss";
import SampleTeamImage from "@/app/_images/SampleTeamImage.png";
import Link from "next/link";
import CommonButton from "../../_components/CommonButton/CommonButton";

type Props = {
  team: {
    name: string;
    image: ReactNode;
  }[];
};

export default function TeamPage(props: Props) {
  return (
    <div className={styles.teamPage}>
      <div className={styles.header}>参加チーム</div>
      <div className={styles.content}>
        {props.team.map((item) => (
          <TeamItem key={item.name} name={item.name} image={item.image} />
        ))}
      </div>
      <Link href="/game/1/user/teams/create" className={styles.button}>
        <CommonButton color="red">次へ</CommonButton>
      </Link>
    </div>
  );
}

type TeamItemProps = {
  name: string;
  image: ReactNode;
};

function TeamItem(props: TeamItemProps) {
  return (
    <div className={styles.teamItem}>
      <div className={styles.image}>{props.image}</div>
      <div className={styles.name}>{props.name}</div>
    </div>
  );
}
