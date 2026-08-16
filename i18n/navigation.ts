import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// (site) altındaki TÜM next/link ve next/navigation kullanımları bunlardan
// import edilmeli — href'ler otomatik doğru locale önekini alır, elle string
// birleştirme (`/${locale}/...`) gerekmez.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
