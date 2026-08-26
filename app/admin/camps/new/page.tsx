import Kart from "@/components/admin/Kart";
import CampForm from "../CampForm";

export const dynamic = "force-dynamic";

export default function YeniKamp() {
  return (
    <div>
      <Kart baslik="Kamp bilgileri">
        <CampForm />
      </Kart>
    </div>
  );
}
