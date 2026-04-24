import { headers } from "next/headers";
import AdminUsersClient from "./admin-users-client";

export default async function AdminUsersPage() {
  await headers();

  return <AdminUsersClient />;
}
