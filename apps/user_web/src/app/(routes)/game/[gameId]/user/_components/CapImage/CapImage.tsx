import Cap01 from "./images/cap_1.png";
import Cap02 from "./images/cap_2.png";
import Cap03 from "./images/cap_3.png";
import Cap04 from "./images/cap_4.png";
import Cap05 from "./images/cap_5.png";
import Cap06 from "./images/cap_6.png";
import Cap07 from "./images/cap_7.png";
import Cap08 from "./images/cap_8.png";
import Cap09 from "./images/cap_9.png";
import Cap10 from "./images/cap_10.png";
import Cap11 from "./images/cap_11.png";
import Cap12 from "./images/cap_12.png";
import Cap13 from "./images/cap_13.png";
import Cap14 from "./images/cap_14.png";
import Cap15 from "./images/cap_15.png";
import Cap16 from "./images/cap_16.png";
import Image, { ImageProps } from "next/image";

type Props = {
  index: number;
  className?: string;
} & Omit<ImageProps, "src" | "alt">;

export default function CapImage(props: Props) {
  const image = getCapImage(props.index);
  return (
    <Image
      src={image}
      alt={"キャップ"}
      className={props.className}
      width={props.width}
      height={props.height}
    />
  );
}

function getCapImage(index: number) {
  switch (index) {
    case 0:
      return Cap01;
    case 1:
      return Cap02;
    case 2:
      return Cap03;
    case 3:
      return Cap04;
    case 4:
      return Cap05;
    case 5:
      return Cap06;
    case 6:
      return Cap07;
    case 7:
      return Cap08;
    case 8:
      return Cap09;
    case 9:
      return Cap10;
    case 10:
      return Cap11;
    case 11:
      return Cap12;
    case 12:
      return Cap13;
    case 13:
      return Cap14;
    case 14:
      return Cap15;
    case 15:
      return Cap16;
    default:
      return Cap01;
  }
}
