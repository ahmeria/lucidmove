import Kart from "@/components/admin/Kart";
import OzelDersForm from "../OzelDersForm";

export const dynamic = "force-dynamic";

export default function YeniOzelDers() {
  return (
    <div>
      <Kart baslik="Özel ders bilgileri">
        <OzelDersForm />
      </Kart>
    </div>
  );
}
