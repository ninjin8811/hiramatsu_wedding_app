import styles from "./ProfileBox.module.scss";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function ProfileBox(props: Props) {
  return (
    <div className={styles.profileBox}>
      <div className={styles.profileBox_title}>{props.title}</div>
      <div className={styles.profileBox_content}>{props.children}</div>
    </div>
  );
}
