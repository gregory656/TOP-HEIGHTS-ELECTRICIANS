export type ChatRole = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
}

export interface ChatApiResponse {
  answer: string;
  suggestions?: string[];
  sourceTitle?: string;
}
