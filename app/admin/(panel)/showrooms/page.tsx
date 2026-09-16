import { getStoreCatalog } from "@/lib/showrooms/server";
import { ShowroomAdmin } from "@/components/showrooms/ShowroomAdmin";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (process.env.SHOWROOM_DATA_SOURCE === "registry") return <div className="p-8"><h1>Chair stores</h1><p>The public directory uses a reviewed, version-controlled registry. Updates are published with a site release. Database editing is not enabled.</p><a href="/stores">View public directory</a></div>;
  if (process.env.SHOWROOMS_ENABLED !== "true")
    return (
      <div className="p-8">
        <h1>Showrooms</h1>
        <p>
          Showroom management is disabled. Enable only after the database
          migration has been reviewed and applied.
        </p>
      </div>
    );
  return <ShowroomAdmin catalog={await getStoreCatalog()} />;
}
