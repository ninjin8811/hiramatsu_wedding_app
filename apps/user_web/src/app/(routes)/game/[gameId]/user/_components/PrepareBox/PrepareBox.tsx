import styles from "./PrepareBox.module.scss";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function PrepareBox(props: Props) {
  return (
    <div className={styles.prepareBox}>
      <div className={styles.prepareBox_title}>{props.title}</div>
      <div className={styles.prepareBox_content}>{props.children}</div>
    </div>
  );
}
