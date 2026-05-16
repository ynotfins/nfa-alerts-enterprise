"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PaperPlaneTiltIcon,
  MicrophoneIcon,
  XIcon,
  PlayIcon,
  PauseIcon,
  DotsThreeVerticalIcon,
  ArrowBendUpLeftIcon,
  CopyIcon,
  TrashIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import Twemoji from "react-twemoji";
import { FloatingContainer } from "@/components/layout";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { useThread } from "@/hooks/use-chat";
import { useAuthContext } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profiles";
import { uploadVoiceMessage, getFileUrl } from "@/services/storage";
import { warnUser, suspendUser, banUser } from "@/services/moderation";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WarningIcon, GavelIcon, ProhibitIcon } from "@phosphor-icons/react";

function VoicePlayer({
  storagePath,
  duration,
  isOwnMessage,
}: {
  storagePath: string;
  duration: number;
  isOwnMessage: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getFileUrl(storagePath)
      .then(setAudioUrl)
      .catch(() => {});
  }, [storagePath]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
      <motion.button
        onClick={togglePlay}
        disabled={!audioUrl}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
          isOwnMessage
            ? "bg-primary-foreground/20 hover:bg-primary-foreground/30"
            : "bg-primary/10 hover:bg-primary/20",
        )}
      >
        {playing ? (
          <PauseIcon
            className={cn(
              "h-5 w-5",
              isOwnMessage ? "text-primary-foreground" : "text-primary",
            )}
            weight="fill"
          />
        ) : (
          <PlayIcon
            className={cn(
              "h-5 w-5",
              isOwnMessage ? "text-primary-foreground" : "text-primary",
            )}
            weight="fill"
          />
        )}
      </motion.button>
      <div className="flex-1 flex flex-col gap-1">
        <div
          className={cn(
            "h-1.5 rounded-full overflow-hidden",
            isOwnMessage ? "bg-primary-foreground/30" : "bg-primary/20",
          )}
        >
          <motion.div
            className={cn(
              "h-full rounded-full",
              isOwnMessage ? "bg-primary-foreground" : "bg-primary",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span
          className={cn(
            "text-[10px] tabular-nums",
            isOwnMessage
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {playing || currentTime > 0
            ? formatTime(currentTime)
            : formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

const quickReactions = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🙏",
  "🔥",
  "✨",
  "👏",
  "🎉",
];

export default function ChatThreadClient({ threadId }: { threadId: string }) {
  const router = useRouter();
  const { profile: currentProfile } = useAuthContext();
  const {
    thread,
    messages,
    loading: threadLoading,
    sendMessage: sendMsg,
    markAsRead,
    addReaction: addReactionToMessage,
    removeReaction: removeReactionFromMessage,
  } = useThread(threadId);

  const otherParticipantId =
    thread?.type === "direct"
      ? thread.participants.find((p) => p !== currentProfile?._id)
      : thread?.type === "chaser_to_supes"
        ? thread.chaserIds?.[0] || thread.participants[0]
        : undefined;

  const { profile: otherParticipant } = useProfile(otherParticipantId);

  const getThreadTitle = () => {
    if (!thread) return "Unknown";

    if (thread.type === "chaser_to_supes") {
      if (currentProfile?.role === "chaser") {
        return "Supes";
      }
      return (
        otherParticipant?.name ||
        otherParticipant?.firstName ||
        otherParticipant?.email ||
        "Unknown Chaser"
      );
    }

    return (
      otherParticipant?.name ||
      otherParticipant?.firstName ||
      otherParticipant?.email ||
      "Unknown"
    );
  };

  const getThreadAvatar = () => {
    if (!thread) return null;

    if (
      thread.type === "chaser_to_supes" &&
      currentProfile?.role === "chaser"
    ) {
      return (
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <UsersIcon className="h-5 w-5 text-primary" />
        </div>
      );
    }

    return (
      <Avatar className="h-10 w-10">
        <AvatarImage src={otherParticipant?.avatarUrl} />
        <AvatarFallback>
          {otherParticipant?.name ? getInitials(otherParticipant.name) : "?"}
        </AvatarFallback>
      </Avatar>
    );
  };

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<
    (typeof messages)[number] | null
  >(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<
    (typeof messages)[number] | null
  >(null);
  const [showActionDrawer, setShowActionDrawer] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showModerationDrawer, setShowModerationDrawer] = useState(false);
  const [moderationAction, setModerationAction] = useState<
    "warn" | "suspend" | "ban" | null
  >(null);
  const [moderationReason, setModerationReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("7");
  const [moderationLoading, setModerationLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; messageId: string } | null>(null);

  const isLoading = threadLoading || currentProfile === null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!currentProfile) return;

    const unreadMessages = messages.filter(
      (m) =>
        m.senderId !== currentProfile._id &&
        !m.readBy.includes(currentProfile._id),
    );

    if (unreadMessages.length > 0) {
      markAsRead();
    }
  }, [messages, currentProfile, markAsRead]);

  const handleSend = async () => {
    if ((!text.trim() && !replyingTo) || sending) return;

    setSending(true);
    try {
      await sendMsg(text.trim() || "", {
        replyTo: replyingTo?._id,
      });
      setText("");
      setReplyingTo(null);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      toast.info("File upload not yet implemented");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) {
          setRecording(false);
          setRecordingTime(0);
          recordingTimeRef.current = 0;
          return;
        }

        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const duration = recordingTimeRef.current;

        setRecording(false);
        setRecordingTime(0);
        recordingTimeRef.current = 0;
        audioChunksRef.current = [];

        if (duration < 1) {
          toast.error("Recording too short");
          return;
        }

        setSending(true);
        try {
          const result = await uploadVoiceMessage(threadId, blob, duration);
          await sendMsg("", {
            voice: { storagePath: result.storagePath, duration },
          });
        } catch {
          toast.error("Failed to send voice message");
        } finally {
          setSending(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      recordingIntervalRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find((m) => m._id === messageId);
      const userReaction = message?.reactions.find(
        (r) => r.profileId === currentProfile?._id && r.emoji === emoji,
      );

      if (userReaction) {
        await removeReactionFromMessage(messageId, emoji);
      } else {
        await addReactionToMessage(messageId, emoji);
      }
    } catch {
      toast.error("Failed to add reaction");
    }
  };

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b px-4 py-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Thread not found</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLongPressStart = (message: (typeof messages)[number]) => {
    longPressTimerRef.current = setTimeout(() => {
      setSelectedMessage(message);
      setShowActionDrawer(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCopyMessage = () => {
    if (selectedMessage?.text) {
      navigator.clipboard.writeText(selectedMessage.text);
      toast.success("Message copied");
      setShowActionDrawer(false);
    }
  };

  const handleReplyToMessage = () => {
    setReplyingTo(selectedMessage);
    setShowActionDrawer(false);
  };

  const handleModeration = async () => {
    if (!moderationAction || !moderationReason.trim() || !otherParticipantId)
      return;

    setModerationLoading(true);
    try {
      if (moderationAction === "warn") {
        await warnUser(otherParticipantId, moderationReason);
        toast.success("Warning issued");
      } else if (moderationAction === "suspend") {
        await suspendUser(
          otherParticipantId,
          moderationReason,
          parseInt(suspendDuration),
        );
        toast.success(`User suspended for ${suspendDuration} days`);
      } else if (moderationAction === "ban") {
        await banUser(otherParticipantId, moderationReason);
        toast.success("User banned");
      }
      setShowModerationDrawer(false);
      setModerationAction(null);
      setModerationReason("");
    } catch {
      toast.error("Action failed");
    } finally {
      setModerationLoading(false);
    }
  };

  const handleDoubleTap = (message: (typeof messages)[number]) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (
      lastTap &&
      lastTap.messageId === message._id &&
      now - lastTap.time < 300
    ) {
      setSelectedMessage(message);
      setShowActionDrawer(true);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, messageId: message._id };
    }
  };

  return (
    <div className="flex h-full flex-col">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        disabled={uploading}
      />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card/80 backdrop-blur-xl px-4 py-3.5"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeftIcon className="h-5 w-5" weight="bold" />
        </Button>
        {getThreadAvatar()}
        <div className="flex-1">
          <h1 className="font-semibold text-base">{getThreadTitle()}</h1>
          <p className="text-xs text-muted-foreground">
            {thread?.type === "chaser_to_supes" &&
            currentProfile?.role === "chaser"
              ? "Group chat with all supes"
              : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setShowDetailsDrawer(true)}
        >
          <DotsThreeVerticalIcon className="h-5 w-5" weight="bold" />
        </Button>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isOwnMessage = message.senderId === currentProfile?._id;
            const messageDate = new Date(message.createdAt);
            const replyToMessage = message.replyTo
              ? messages.find((m) => m._id === message.replyTo)
              : null;

            const groupedReactions = (message.reactions || []).reduce(
              (acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>,
            );

            const hasVoice = !!message.voice;

            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                data-message-id={message._id}
                className={cn(
                  "flex gap-2 items-end",
                  isOwnMessage ? "justify-end" : "justify-start",
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative max-w-[75%] group",
                    isOwnMessage ? "order-1" : "order-2",
                  )}
                  onClick={() => handleDoubleTap(message)}
                  onTouchStart={() => handleLongPressStart(message)}
                  onTouchEnd={handleLongPressEnd}
                  onTouchCancel={handleLongPressEnd}
                  onMouseDown={() => handleLongPressStart(message)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                >
                  {replyToMessage && (
                    <motion.div
                      initial={{ opacity: 0, x: isOwnMessage ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "mb-2 p-2.5 rounded-xl border-l-4 text-xs",
                        isOwnMessage
                          ? "bg-primary-foreground/10 border-primary-foreground/40"
                          : "bg-muted border-primary/50",
                      )}
                    >
                      <p
                        className={cn(
                          "font-medium text-[10px] uppercase tracking-wide mb-1",
                          isOwnMessage
                            ? "text-primary-foreground/70"
                            : "text-primary",
                        )}
                      >
                        Replying to
                      </p>
                      <p
                        className={cn(
                          "truncate",
                          isOwnMessage
                            ? "text-primary-foreground/80"
                            : "text-foreground",
                        )}
                      >
                        {replyToMessage.text}
                      </p>
                    </motion.div>
                  )}

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 shadow-sm",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border text-foreground rounded-bl-md",
                    )}
                  >
                    {hasVoice && message.voice && (
                      <VoicePlayer
                        storagePath={message.voice.storagePath}
                        duration={message.voice.duration}
                        isOwnMessage={isOwnMessage}
                      />
                    )}

                    {message.text && !hasVoice && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    )}

                    <div className="flex items-center gap-1 mt-1">
                      <p
                        className={cn(
                          "text-[10px]",
                          isOwnMessage
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatMessageTime(messageDate)}
                      </p>
                    </div>
                  </div>

                  {Object.keys(groupedReactions).length > 0 && (
                    <Twemoji options={{ className: "twemoji" }}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "flex flex-wrap gap-1.5 mt-1.5",
                          isOwnMessage ? "justify-end" : "justify-start",
                        )}
                      >
                        {Object.entries(groupedReactions).map(
                          ([emoji, count], idx) => (
                            <motion.button
                              key={emoji}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: idx * 0.05,
                                type: "spring",
                                stiffness: 500,
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleReaction(message._id, emoji)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border shadow-sm text-xs"
                            >
                              <span>{emoji}</span>
                              <span className="font-medium text-muted-foreground">
                                {count}
                              </span>
                            </motion.button>
                          ),
                        )}
                      </motion.div>
                    </Twemoji>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <FloatingContainer>
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="border-b px-4 py-4"
            >
              <Twemoji options={{ className: "twemoji" }}>
                <div className="grid grid-cols-5 gap-2">
                  {quickReactions.map((emoji, index) => (
                    <motion.button
                      key={emoji}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: index * 0.03,
                        type: "spring",
                        stiffness: 400,
                      }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl p-3 rounded-xl hover:bg-muted flex items-center justify-center"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </Twemoji>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="flex items-center gap-2 mx-4 mt-3 p-2.5 rounded-xl bg-muted border-l-4 border-primary"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">
                  Replying to
                </p>
                <p className="text-sm text-foreground truncate">
                  {replyingTo.text}
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => setReplyingTo(null)}
                >
                  <XIcon className="h-4 w-4" weight="bold" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {recording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-4 py-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 shadow-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="h-3 w-3 bg-destructive rounded-full"
                />
                <div className="flex-1 flex items-center gap-2.5">
                  <span className="text-sm font-medium tabular-nums text-destructive">
                    {formatDuration(recordingTime)}
                  </span>
                  <div className="flex-1 h-1.5 bg-destructive/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-destructive rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${Math.min((recordingTime / 60) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelRecording}
                    className="h-9 rounded-full"
                  >
                    <XIcon className="h-4 w-4 mr-1.5" weight="bold" />
                    Cancel
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    onClick={stopRecording}
                    className="h-9 rounded-full"
                  >
                    <PaperPlaneTiltIcon
                      className="h-4 w-4 mr-1.5"
                      weight="fill"
                    />
                    Send
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center gap-2 px-4 py-2"
            >
              <div className="flex-1 min-w-0 flex items-center bg-muted rounded-full px-4 py-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message here..."
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                  disabled={sending || uploading}
                />
              </div>

              <Button
                onClick={text.trim() ? handleSend : startRecording}
                disabled={sending || uploading}
                variant={text.trim() ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "h-8 w-8 shrink-0 rounded-full",
                  !text.trim() && "text-muted-foreground",
                )}
              >
                {text.trim() ? (
                  <PaperPlaneTiltIcon className="h-4 w-4" weight="fill" />
                ) : (
                  <MicrophoneIcon className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingContainer>

      <AnimatePresence>
        {showActionDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowActionDrawer(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card backdrop-blur-xl rounded-t-3xl border-t shadow-2xl z-50"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-6" />

              <div className="px-6 pb-6">
                <Twemoji options={{ className: "twemoji" }}>
                  <div className="grid grid-cols-5 gap-3 mb-6 p-4 rounded-2xl bg-muted/50">
                    {quickReactions.map((emoji, index) => (
                      <motion.button
                        key={emoji}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: index * 0.03,
                          type: "spring",
                          stiffness: 400,
                        }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          handleReaction(selectedMessage?._id || "", emoji);
                          setShowActionDrawer(false);
                        }}
                        className="text-3xl p-3 rounded-2xl hover:bg-card flex items-center justify-center"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </Twemoji>

                <div className="space-y-2">
                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReplyToMessage}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-muted transition-colors text-left group"
                  >
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <ArrowBendUpLeftIcon
                        className="h-5 w-5 text-primary"
                        weight="bold"
                      />
                    </div>
                    <span className="font-medium text-base">Reply</span>
                  </motion.button>

                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyMessage}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-muted transition-colors text-left group"
                  >
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <CopyIcon
                        className="h-5 w-5 text-primary"
                        weight="bold"
                      />
                    </div>
                    <span className="font-medium text-base">Copy</span>
                  </motion.button>

                  {selectedMessage?.senderId === currentProfile?._id && (
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowActionDrawer(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-destructive/10 transition-colors text-left group"
                    >
                      <div className="p-3 rounded-xl bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                        <TrashIcon
                          className="h-5 w-5 text-destructive"
                          weight="bold"
                        />
                      </div>
                      <span className="font-medium text-base text-destructive">
                        Delete
                      </span>
                    </motion.button>
                  )}
                </div>

                <div className="pb-4" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Drawer open={showDetailsDrawer} onOpenChange={setShowDetailsDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {thread?.type === "chaser_to_supes" &&
              currentProfile?.role === "chaser"
                ? "Supes"
                : "Details"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {thread?.type === "chaser_to_supes" &&
            currentProfile?.role === "chaser" ? (
              <div className="text-center text-muted-foreground py-8">
                <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">This is a group chat with all supes</p>
              </div>
            ) : (
              otherParticipant && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={otherParticipant.avatarUrl} />
                      <AvatarFallback className="text-2xl">
                        {otherParticipant.name
                          ? getInitials(otherParticipant.name)
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">
                        {otherParticipant.name || "Unknown"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 justify-center">
                        {otherParticipant.role && (
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {otherParticipant.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {otherParticipant.stats && (
                    <div className="grid grid-cols-2 gap-3">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">
                            Alerts Responded
                          </p>
                          <p className="text-2xl font-bold">
                            {otherParticipant.stats.alertsResponded || 0}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">
                            Days Active
                          </p>
                          <p className="text-2xl font-bold">
                            {otherParticipant.stats.daysActive || 0}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
          <DrawerFooter>
            {(currentProfile?.role === "supe" ||
              currentProfile?.role === "admin") &&
            otherParticipant?.role === "chaser" &&
            otherParticipant?._id ? (
              <>
                <Button
                  onClick={() => {
                    setShowDetailsDrawer(false);
                    router.push(`/chasers/${otherParticipant._id}`);
                  }}
                >
                  View Full Profile
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setModerationAction("warn");
                      setShowDetailsDrawer(false);
                      setShowModerationDrawer(true);
                    }}
                  >
                    <WarningIcon className="h-4 w-4 mr-1" />
                    Warn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setModerationAction("suspend");
                      setShowDetailsDrawer(false);
                      setShowModerationDrawer(true);
                    }}
                  >
                    <GavelIcon className="h-4 w-4 mr-1" />
                    Suspend
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setModerationAction("ban");
                      setShowDetailsDrawer(false);
                      setShowModerationDrawer(true);
                    }}
                  >
                    <ProhibitIcon className="h-4 w-4 mr-1" />
                    Ban
                  </Button>
                </div>
              </>
            ) : null}
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={showModerationDrawer}
        onOpenChange={setShowModerationDrawer}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {moderationAction === "warn" && "Issue Warning"}
              {moderationAction === "suspend" && "Suspend User"}
              {moderationAction === "ban" && "Ban User"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="text-center py-2">
              <Avatar className="h-16 w-16 mx-auto mb-2">
                <AvatarImage src={otherParticipant?.avatarUrl} />
                <AvatarFallback>
                  {otherParticipant?.name
                    ? getInitials(otherParticipant.name)
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium">
                {otherParticipant?.name || "Unknown"}
              </p>
            </div>

            {moderationAction === "suspend" && (
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={suspendDuration}
                  onValueChange={setSuspendDuration}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Explain the reason for this action..."
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                rows={3}
              />
            </div>

            {moderationAction === "ban" && (
              <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                <p className="font-medium mb-1">This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Permanently block this user</li>
                  <li>Block their device from creating new accounts</li>
                  <li>Log the ban reason for records</li>
                </ul>
              </div>
            )}
          </div>
          <DrawerFooter>
            <Button
              onClick={handleModeration}
              disabled={!moderationReason.trim() || moderationLoading}
              variant={moderationAction === "ban" ? "destructive" : "default"}
            >
              {moderationLoading
                ? "Processing..."
                : `Confirm ${moderationAction === "warn" ? "Warning" : moderationAction === "suspend" ? "Suspension" : "Ban"}`}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
