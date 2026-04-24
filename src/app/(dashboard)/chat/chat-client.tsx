"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UsersIcon, MessageSquareIcon } from "lucide-react";
import { Timestamp } from "@/components/timestamp";
import { ChaserSearchDrawer } from "@/components/chat/chaser-search-drawer";
import { useThreads, ThreadWithParticipant } from "@/hooks/use-chat";
import { getOrCreateSupesThread, ThreadWithId } from "@/services/chat";
import {
  Header,
  HeaderSkeleton,
  PageContent,
  ContentSkeleton,
  PageTabs,
  PageTab,
} from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/contexts/auth-context";

function ThreadItem({ thread }: { thread: ThreadWithParticipant }) {
  const name = thread.otherParticipant?.displayName || "Unknown";
  const initial = name.charAt(0).toUpperCase();
  const avatarUrl = thread.otherParticipant?.avatarUrl;
  const hasUnread = (thread.unreadCount ?? 0) > 0;

  return (
    <Link
      href={`/chat/${thread._id}`}
      className="flex items-center gap-3 px-4 py-3 border-b transition-colors hover:bg-accent/50 active:bg-accent"
    >
      <div className="relative">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {initial}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground rounded-full flex items-center justify-center">
            <span className="text-[10px] font-medium px-1">
              {(thread.unreadCount ?? 0) > 99
                ? "99+"
                : (thread.unreadCount ?? 0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={`text-sm ${hasUnread ? "font-semibold" : "font-medium"}`}
          >
            {name}
          </p>
          {thread.lastMessageAt && (
            <Timestamp
              date={new Date(thread.lastMessageAt)}
              format="relative"
              className={`text-xs ${hasUnread ? "text-primary font-medium" : "text-muted-foreground"}`}
            />
          )}
        </div>
        {thread.lastMessage && (
          <p
            className={`text-sm truncate ${hasUnread ? "text-foreground" : "text-muted-foreground"}`}
          >
            {thread.lastMessage}
          </p>
        )}
      </div>
      {hasUnread && (
        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
      )}
    </Link>
  );
}

function ChatContent() {
  const { profile } = useAuthContext();
  const { threads, loading } = useThreads();
  const [activeTab, setActiveTab] = useState<"chasers" | "supes">("chasers");

  const isSupe = profile?.role === "supe" || profile?.role === "admin";
  const isChaser = profile?.role === "chaser";

  const directThreads = threads.filter((t) => t.type === "direct");
  const chaserToSupeThreads = threads.filter(
    (t) => t.type === "chaser_to_supes",
  );

  // For chasers, find their supes thread from the threads list or create one
  const existingSupeThread = isChaser ? chaserToSupeThreads[0] : null;
  const [createdSupeThread, setCreatedSupeThread] =
    useState<ThreadWithId | null>(null);
  const [fetchState, setFetchState] = useState<"idle" | "fetching" | "error">("idle");

  useEffect(() => {
    if (
      isChaser &&
      activeTab === "supes" &&
      !existingSupeThread &&
      !createdSupeThread &&
      !loading &&
      fetchState === "idle"
    ) {
      // Use Promise.resolve to move setState into .then() callback
      Promise.resolve()
        .then(() => {
          setFetchState("fetching");
          return getOrCreateSupesThread();
        })
        .then((thread) => {
          setCreatedSupeThread(thread);
          setFetchState("idle");
        })
        .catch((err) => {
          console.error("Failed to create supes thread:", err);
          setFetchState("error");
          toast.error("Failed to connect to supes");
        });
    }
  }, [
    isChaser,
    activeTab,
    existingSupeThread,
    createdSupeThread,
    loading,
    fetchState,
  ]);

  const creatingSupeThread = fetchState === "fetching";
  const supeThreadError = fetchState === "error";

  const supeThread = existingSupeThread || createdSupeThread;
  const supeThreadLoading = (isChaser && loading) || creatingSupeThread;

  if (isSupe) {
    return (
      <div className="flex h-full flex-col">
        {loading ? (
          <HeaderSkeleton hasActions />
        ) : (
          <Header title="Contacts" actions={<ChaserSearchDrawer />} />
        )}
        {loading ? (
          <ContentSkeleton className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b"
              >
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </ContentSkeleton>
        ) : (
          <>
            <PageContent>
              {chaserToSupeThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="rounded-full bg-muted p-4 mb-4 shadow-inner">
                    <UsersIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    No chaser messages
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Chasers will appear here when they message supes
                  </p>
                </div>
              ) : (
                <div>
                  {chaserToSupeThreads.map((thread) => (
                    <ThreadItem key={thread._id} thread={thread} />
                  ))}
                </div>
              )}
            </PageContent>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {loading ? (
        <HeaderSkeleton hasActions={isChaser} />
      ) : (
        <Header
          title="Contacts"
          actions={isChaser ? <ChaserSearchDrawer /> : undefined}
        />
      )}

      {loading ? (
        <ContentSkeleton className="space-y-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </ContentSkeleton>
      ) : (
        <>
          <PageContent className="pb-36">
            {activeTab === "chasers" ? (
              directThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="rounded-full bg-muted p-4 mb-4 shadow-inner">
                    <MessageSquareIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No chaser conversations
                  </p>
                </div>
              ) : (
                <div>
                  {directThreads.map((thread) => (
                    <ThreadItem key={thread._id} thread={thread} />
                  ))}
                </div>
              )
            ) : supeThreadLoading ? (
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ) : supeThread ? (
              <Link
                href={`/chat/${supeThread._id}`}
                className="flex items-center gap-3 px-4 py-3 border-b transition-colors hover:bg-accent/50 active:bg-accent"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <UsersIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Supes</p>
                    {supeThread.lastMessageAt && (
                      <Timestamp
                        date={new Date(supeThread.lastMessageAt)}
                        format="relative"
                        className="text-xs text-muted-foreground"
                      />
                    )}
                  </div>
                  {supeThread.lastMessage ? (
                    <p className="text-sm truncate text-muted-foreground">
                      {supeThread.lastMessage}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Tap to message supes
                    </p>
                  )}
                </div>
              </Link>
            ) : supeThreadError ? (
              <div className="flex flex-col items-center justify-center h-full py-16 px-4">
                <div className="rounded-full bg-destructive/10 p-4 mb-4 shadow-inner">
                  <UsersIcon className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-muted-foreground text-center mb-4">
                  Unable to connect to supes
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFetchState("idle")}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 px-4">
                <div className="rounded-full bg-muted p-4 mb-4 shadow-inner">
                  <UsersIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  Loading supe chat...
                </p>
              </div>
            )}
          </PageContent>
          <PageTabs>
            <PageTab
              active={activeTab === "chasers"}
              onClick={() => setActiveTab("chasers")}
            >
              Chasers
            </PageTab>
            <PageTab
              active={activeTab === "supes"}
              onClick={() => setActiveTab("supes")}
            >
              Supes
            </PageTab>
          </PageTabs>
        </>
      )}
    </div>
  );
}

export default function ChatClient() {
  return <ChatContent />;
}
