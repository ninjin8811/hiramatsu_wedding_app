import CurrentRanking from "./_component/CurrentRanking/CurrentRanking";
import styles from "./page.module.scss";

type Props = {
  params: {
    gameId: string;
  };
};

export default function AdminPage({ params }: Props) {
  const { gameId } = params;

  return (
    <div className={styles.container}>
      <CurrentRanking gameId={gameId} />
    </div>
  );
}
