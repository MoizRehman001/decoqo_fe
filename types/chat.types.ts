/**
 * Chat domain types — milestone-scoped real-time messaging.
 * Sprint 7 — Chat + Dispute + Timeline
 */

export type ChatSenderRole = 'CUSTOMER' | 'VENDOR';

export interface ChatMessage {
  id: string;
  milestoneId: string;
  projectId: string;
  senderId: string;
  senderRole: ChatSenderRole;
  senderName: string;
  content: string;
  /** True if contact info was detected and masked */
  flagged: boolean;
  masked: boolean;
  createdAt: string;
}

export interface ChatThread {
  milestoneId: string;
  projectId: string;
  messages: ChatMessage[];
}
