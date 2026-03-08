import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Fab,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { AnimatePresence, motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import type { ChatMessage } from './types';
import { askTopHeightsAssistant } from '../../services/chatbotService';

const STORAGE_KEY = 'topheights-chat-history-v1';
const MAX_MESSAGES = 40;

const DEFAULT_SUGGESTIONS = [
  'How do payments work?',
  'What services does TopHeights offer?',
  'How do I create an account?',
];

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'bot',
  text: 'Welcome to TopHeights AI Assistant. Ask me about our products, services, or how to get help quickly.',
  createdAt: Date.now(),
};

const getRandomDelay = () => 700 + Math.floor(Math.random() * 800);

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeParseMessages(raw: string | null): ChatMessage[] {
  if (!raw) return [GREETING];
  try {
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [GREETING];
    return parsed.slice(-MAX_MESSAGES);
  } catch {
    return [GREETING];
  }
}

function playSendSound() {
  const context = new window.AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = 740;
  gainNode.gain.value = 0.0001;
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.02, context.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.14);
  oscillator.stop(context.currentTime + 0.14);
}

export default function TopHeightsChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    safeParseMessages(localStorage.getItem(STORAGE_KEY))
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isTyping, isOpen]);

  const hasUserMessages = useMemo(
    () => messages.some((message) => message.role === 'user'),
    [messages]
  );

  const streamBotMessage = async (text: string) => {
    const id = generateId();
    const words = text.split(/\s+/).filter(Boolean);
    setIsStreaming(true);
    setMessages((previous) => [
      ...previous.slice(-MAX_MESSAGES + 1),
      { id, role: 'bot', text: '', createdAt: Date.now() },
    ]);

    for (let index = 0; index < words.length; index += 1) {
      const chunk = words.slice(0, index + 1).join(' ');
      setMessages((previous) =>
        previous.map((message) => (message.id === id ? { ...message, text: chunk } : message))
      );
      await wait(words[index].endsWith('.') ? 60 : 24);
    }
    setIsStreaming(false);
  };

  const handleSend = async (preFilledText?: string) => {
    const rawMessage = preFilledText ?? input;
    const message = rawMessage.replace(/\s+/g, ' ').trim().slice(0, 500);
    if (!message || isTyping || isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: message,
      createdAt: Date.now(),
    };

    setInput('');
    playSendSound();
    setMessages((previous) => [...previous.slice(-MAX_MESSAGES + 1), userMessage]);
    setIsTyping(true);

    try {
      const artificialDelay = wait(getRandomDelay());
      const responsePromise = askTopHeightsAssistant(message, messages);
      const [response] = await Promise.all([responsePromise, artificialDelay]);

      setIsTyping(false);
      if (response.suggestions?.length) {
        setSuggestions(response.suggestions.slice(0, 3));
      }
      await streamBotMessage(response.answer);
    } catch {
      setIsTyping(false);
      await streamBotMessage(
        "I can still help from website content. Ask about services, products, payments, contact, or account access."
      );
    }
  };

  return (
    <>
      <Fab
        color="primary"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="Open TopHeights AI Assistant"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: (theme) => theme.zIndex.snackbar + 10,
          boxShadow: '0 16px 30px rgba(2, 132, 199, 0.36)',
        }}
      >
        {isOpen ? <CloseRounded /> : <ChatBubbleOutlineRounded />}
      </Fab>

      <AnimatePresence>
        {isOpen && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22 }}
            sx={{
              position: 'fixed',
              right: { xs: 12, sm: 24 },
              bottom: { xs: 86, sm: 96 },
              width: { xs: 'calc(100vw - 24px)', sm: 350 },
              maxWidth: 350,
              height: { xs: '74vh', sm: 500 },
              maxHeight: 520,
              zIndex: (theme) => theme.zIndex.snackbar + 9,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #1f2937',
                boxShadow: '0 18px 45px rgba(2, 6, 23, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                background:
                  'linear-gradient(180deg, rgba(3,7,18,1) 0%, rgba(15,23,42,0.98) 100%)',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#0b1220',
                  color: '#f9fafb',
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <SmartToyOutlined color="primary" />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, lineHeight: 1.2, color: '#f9fafb' }}
                    >
                      TopHeights AI Assistant
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      AI Assistant
                    </Typography>
                  </Box>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  sx={{ color: '#e5e7eb' }}
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              </Box>

              <Divider />

              <Stack
                ref={scrollContainerRef}
                spacing={1}
                sx={{
                  flex: 1,
                  px: 1.2,
                  py: 1.2,
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                }}
              >
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
              </Stack>

              <Box sx={{ px: 1.2, py: 0.8, display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                {(hasUserMessages ? suggestions : DEFAULT_SUGGESTIONS).map((item) => (
                  <Chip
                    key={item}
                    size="small"
                    label={item}
                    onClick={() => handleSend(item)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#1e3a8a',
                      color: '#dbeafe',
                      '&:hover': {
                        bgcolor: '#1d4ed8',
                      },
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ px: 1.2, pb: 1.2 }}>
                <ChatInput
                  value={input}
                  disabled={isTyping || isStreaming}
                  onChange={setInput}
                  onSend={() => handleSend()}
                />
              </Box>
            </Paper>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}
