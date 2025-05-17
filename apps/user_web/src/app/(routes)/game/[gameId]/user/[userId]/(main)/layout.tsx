import styles from "./layout.module.scss";
import Image from "next/image";
import UserMainBackground from "@/app/_images/UserMainBackground.png";

export default function UserMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.mainLayout}>
      <Image
        src={UserMainBackground}
        alt="ユーザーのメイン画面"
        className={styles.background}
      />
      {children}
    </div>
  );
}
