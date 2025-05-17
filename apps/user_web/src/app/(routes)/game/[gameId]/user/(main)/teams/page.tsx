import Image from "next/image";
import TeamPage from "../../_pages/TeamPage/TeamPage";
import SampleTeamImage from "@/app/_images/SampleTeamImage.png";

export default function UserPage() {
  return (
    <TeamPage
      team={[
        {
          name: "テスト",
          image: <Image src={SampleTeamImage} alt="テスト" />,
        },
      ]}
    />
  );
}
