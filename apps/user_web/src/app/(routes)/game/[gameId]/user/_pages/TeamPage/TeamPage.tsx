import styles from "./TeamPage.module.scss";
import Link from "next/link";
import CommonButton from "../../_components/CommonButton/CommonButton";
import StorageImage from "../../_components/StorageImage/StorageImage";
import { UserPreparePath } from "@/app/_utils/page_link";

type Props = {
  gameId: string;
  userId: string;
  teams: {
    name: string;
    imagePath: string;
  }[];
};

export default function TeamPage(props: Props) {
  return (
    <div className={styles.teamPage}>
      <div className={styles.header}>参加チーム一覧</div>
      <div className={styles.content}>
        {props.teams.map((item) => (
          <TeamItem
            key={item.name}
            name={item.name}
            imagePath={item.imagePath}
          />
        ))}
      </div>
      <Link
        href={UserPreparePath(props.gameId, props.userId)}
        className={styles.button}
      >
        <CommonButton color="red">次へ</CommonButton>
      </Link>
    </div>
  );
}

type TeamItemProps = {
  name: string;
  imagePath: string;
};

function TeamItem(props: TeamItemProps) {
  return (
    <div className={styles.teamItem}>
      <StorageImage
        className={styles.image}
        path={props.imagePath}
        fit="contain"
        alt={props.name}
        width={200}
        height={200}
      />
      <div className={styles.name}>{props.name}</div>
    </div>
  );
}
