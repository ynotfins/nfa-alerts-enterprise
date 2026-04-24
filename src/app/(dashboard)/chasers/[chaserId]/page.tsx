import { headers } from "next/headers";
import ChaserDetailClient from "./chaser-detail-client";

export const dynamic = 'force-dynamic';

export default async function ChaserDetailPage({
  params,
}: {
  params: Promise<{ chaserId: string }>;
}) {
  await headers();

  const { chaserId } = await params;

  return <ChaserDetailClient chaserId={chaserId} />;
}
