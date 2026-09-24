import { HeaderClient } from "@/components/header-client";

export function AtlasHeader() {
  // Store routes already enforce SHOWROOMS_ENABLED on the server. Do not read
  // its private environment variable again inside the finder client boundary.
  return <HeaderClient showStores />;
}
