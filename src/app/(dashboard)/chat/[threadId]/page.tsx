import ChatThreadClient from "./chat-thread-client";

export const dynamic = 'force-dynamic';

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;

  return <ChatThreadClient threadId={threadId} />;
}
