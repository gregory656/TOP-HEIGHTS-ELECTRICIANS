import type { ChatApiResponse, ChatMessage } from '../components/chatbot/types';
import { getLocalAssistantFallback } from './localKnowledgeService';

const CHAT_API_BASE = import.meta.env.VITE_CHAT_API_URL ?? 'http://localhost:3001';

function sanitizeOutgoingMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim().slice(0, 500);
}

export async function askTopHeightsAssistant(
  message: string,
  history: ChatMessage[]
): Promise<ChatApiResponse> {
  const sanitizedMessage = sanitizeOutgoingMessage(message);
  const payload = {
    message: sanitizedMessage,
    history: history.slice(-8).map((item) => ({
      role: item.role,
      text: item.text,
    })),
  };
  try {
    const response = await fetch(`${CHAT_API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return getLocalAssistantFallback(sanitizedMessage);
    }

    return response.json();
  } catch {
    return getLocalAssistantFallback(sanitizedMessage);
  }
}
