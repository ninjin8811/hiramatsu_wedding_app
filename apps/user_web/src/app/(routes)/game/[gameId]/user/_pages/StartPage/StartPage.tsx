import HomeLogo from "@/app/_images/HomeLogo.png";
import Background from "@/app/_images/Background.png";
import HomeItemBox from "@/app/_images/HomeItemBox.png";
import Image from "next/image";
import styles from "./StartPage.module.scss";
import MainCharactersBox from "@/app/_components/MainCharactersBox/MainCharactersBox";
import FumiyaImage from "@/app/_images/Fumiya.png";
import AoiImage from "@/app/_images/Aoi.png";

export default function StartPage() {
  const itemBoxComponent = (
    <Image src={HomeItemBox} alt="start" className={styles.background_item} />
  );
  return (
    <div className={styles.startPage}>
      <div className={styles.background}>
        <Image
          src={Background}
          alt="start"
          className={styles.background_main}
        />
        {itemBoxComponent}
        {itemBoxComponent}
        {itemBoxComponent}
      </div>
      <div className={styles.content}>
        <Image src={HomeLogo} alt="start" className={styles.logo} />
        <MainCharactersBox
          leftImage={<Image src={FumiyaImage} alt="start" />}
          leftName="FUMIYA"
          rightImage={<Image src={AoiImage} alt="start" />}
          rightName="AOI"
          size="small"
        />
      </div>
    </div>
  );
}
