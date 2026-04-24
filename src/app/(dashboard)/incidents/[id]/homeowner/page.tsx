import HomeownerClient from "./homeowner-client";

export default async function HomeownerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <HomeownerClient incidentId={id} />;
}
