import { z } from "zod";

export const threadTypeSchema = z.enum(["direct", "chaser_to_supes"]);

export const messageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  senderId: z.string(),
  text: z.string(),
  createdAt: z.date(),
  readBy: z.array(z.string()).default([]),
  replyTo: z.string().optional(),
  voice: z.object({
    storageId: z.string(),
    duration: z.number(),
  }).optional(),
  attachment: z.object({
    storageId: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
  }).optional(),
});

export const participantDetailSchema = z.object({
  name: z.string(),
  role: z.enum(["chaser", "supe", "admin"]),
  avatarUrl: z.string().optional(),
  online: z.boolean().default(false),
  lastSeen: z.date().optional(),
});

export const threadSchema = z.object({
  id: z.string(),
  type: threadTypeSchema,
  participants: z.array(z.string()),
  participantDetails: z.record(z.string(), participantDetailSchema),
  chaserUserId: z.string().optional(),
  lastMessage: z.string().optional(),
  lastMessageAt: z.date().optional(),
  lastMessageSenderId: z.string().optional(),
  typingUsers: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const sendMessageSchema = z.object({
  threadId: z.string().optional(),
  recipientId: z.string().optional(),
  text: z.string().min(1, "Message cannot be empty"),
  replyTo: z.string().optional(),
  voice: z.object({
    storageId: z.string(),
    duration: z.number(),
  }).optional(),
  attachment: z.object({
    storageId: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
  }).optional(),
});

export const setTypingSchema = z.object({
  threadId: z.string(),
  isTyping: z.boolean(),
});

export type Thread = z.infer<typeof threadSchema>;
export type Message = z.infer<typeof messageSchema>;
export type ParticipantDetail = z.infer<typeof participantDetailSchema>;
