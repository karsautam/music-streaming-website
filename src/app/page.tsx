import Allsongs from "@/components/Allsongs";
import FrontendLayuot from "../../layouts/FrontendLayuot";
import ClickToClose from "@/components/ClickToClose";



export default function Home() {
  return (
    <FrontendLayuot>
      <ClickToClose>
      <div className="min-h-screen">
        <Allsongs />
      </div>
      </ClickToClose>
    </FrontendLayuot>

  );
}