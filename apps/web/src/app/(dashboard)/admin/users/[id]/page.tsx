import { headers } from "next/headers";
import AdminUserEditClient from "./admin-user-edit-client";

export default async function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await headers();
  const { id } = await params;

  return <AdminUserEditClient userId={id} />;
}
