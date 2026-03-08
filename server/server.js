import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { generateOpenAIAnswer } from './openaiResponder.js';
import { getChatResponse, getTopKnowledgeMatches } from './search.js';

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '30kb' }));

const requestMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function getClientIp(request) {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') return forwardedFor.split(',')[0].trim();
  return request.socket.remoteAddress ?? 'unknown';
}

function rateLimit(request, response, next) {
  const ip = getClientIp(request);
  const now = Date.now();
  const previousTimestamps = requestMap.get(ip) ?? [];
  const recentTimestamps = previousTimestamps.filter((stamp) => now - stamp < WINDOW_MS);

  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    response.status(429).json({
      answer: 'Too many requests. Please wait one minute and try again.',
    });
    return;
  }

  recentTimestamps.push(now);
  requestMap.set(ip, recentTimestamps);
  next();
}

function sanitizeInput(message) {
  return String(message ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/chat', rateLimit, async (request, response) => {
  const cleanMessage = sanitizeInput(request.body?.message);
  if (!cleanMessage) {
    response.status(400).json({
      answer: 'Please send a valid message.',
    });
    return;
  }

  const localResult = getChatResponse(cleanMessage);
  const matches = getTopKnowledgeMatches(cleanMessage, 4);

  try {
    const openAIAnswer = await generateOpenAIAnswer(cleanMessage, matches);
    if (openAIAnswer) {
      response.json({
        ...localResult,
        answer: openAIAnswer,
      });
      return;
    }
  } catch {
    // If OpenAI fails, serve local knowledge answer without breaking UX.
  }

  response.json(localResult);
});

app.listen(PORT, () => {
  console.log(`TopHeights chat server listening on http://localhost:${PORT}`);
});
