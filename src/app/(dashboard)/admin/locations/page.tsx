import { headers } from "next/headers";
import AdminLocationsClient from "./admin-locations-client";

export default async function AdminLocationsPage() {
  await headers();

  return <AdminLocationsClient />;
}
