import { HeaderClient } from "@/components/header-client"
import { showroomsEnabled } from "@/lib/navigation/showrooms"

export function Header() {
  return <HeaderClient showStores={showroomsEnabled()} />
}
