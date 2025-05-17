import styles from "./CommonButton.module.scss";

type Props = {
  children: React.ReactNode;
  color: "blue" | "red";
};

export default function CommonButton(props: Props) {
  return (
    <div className={`${styles.commonButton} ${styles[props.color]}`}>
      {props.children}
    </div>
  );
}
