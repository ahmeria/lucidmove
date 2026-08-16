import Kart from "@/components/admin/Kart";
import KursForm from "../KursForm";

export const dynamic = "force-dynamic";

export default function YeniKurs() {
  return (
    <div>
      <Kart>
        <KursForm />
      </Kart>
    </div>
  );
}
