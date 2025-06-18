import CurrentRanking from "./_component/CurrentRanking/CurrentRanking";
import styles from "./page.module.scss";

type Props = {
  params: Promise<{
    gameId: string;
  }>;
};

export default async function AdminPage({ params }: Props) {
  const { gameId } = await params;

  return (
    <div className={styles.container}>
      <CurrentRanking gameId={gameId} />
    </div>
  );
}
