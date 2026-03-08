import Fuse from 'fuse.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.join(__dirname, 'knowledge.json');

function loadKnowledge() {
  const file = fs.readFileSync(knowledgePath, 'utf-8');
  const parsed = JSON.parse(file);
  return Array.isArray(parsed) ? parsed : [];
}

const knowledge = loadKnowledge();

const fuse = new Fuse(knowledge, {
  includeScore: true,
  threshold: 0.38,
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.5 },
    { name: 'keywords', weight: 0.1 },
  ],
});

const CLARIFYING_SUGGESTIONS = [
  'How do payments work?',
  'What services does TopHeights offer?',
  'How can I contact TopHeights?',
];

function isVagueQuery(message) {
  const trimmed = message.trim().toLowerCase();
  if (!trimmed) return true;
  const words = trimmed.split(/\s+/);
  if (words.length <= 2) return true;
  return ['help', 'info', 'information', 'details', 'tell me more'].includes(trimmed);
}

function truncateToShortParagraphs(content, maxChars = 520) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  const sentenceChunks = normalized.match(/[^.!?]+[.!?]*/g) ?? [normalized];
  let output = '';
  for (const sentence of sentenceChunks) {
    if ((output + sentence).length > maxChars) break;
    output += sentence;
    if (output.split('\n').length >= 3) break;
  }
  return output.trim() || normalized.slice(0, maxChars);
}

function buildServiceSummary() {
  const services = knowledge.filter((entry) => entry.type === 'service').slice(0, 6);
  if (!services.length) return null;
  const names = services.map((service) => service.title).join(', ');
  return `TopHeights offers services such as ${names}. Tell me which service you want details about and I can narrow it down.`;
}

function getEntryByType(type) {
  return knowledge.find((entry) => entry.type === type);
}

export function getChatResponse(message) {
  if (/\b(payment|payments|pay|checkout|cart|order)\b/i.test(message)) {
    const paymentEntry = getEntryByType('payment');
    if (paymentEntry) {
      return {
        answer: truncateToShortParagraphs(paymentEntry.content),
        sourceTitle: paymentEntry.title,
        suggestions: [
          'How can I contact TopHeights?',
          'What services does TopHeights offer?',
          'How do I access my account?',
        ],
      };
    }
  }

  if (/\b(contact|phone|whatsapp|call)\b/i.test(message)) {
    const contactEntry = getEntryByType('contact');
    if (contactEntry) {
      return {
        answer: truncateToShortParagraphs(contactEntry.content),
        sourceTitle: contactEntry.title,
        suggestions: [
          'What services does TopHeights offer?',
          'How do payments work?',
          'Do you offer emergency repairs?',
        ],
      };
    }
  }

  if (/\b(account|login|sign in|profile)\b/i.test(message)) {
    const accountEntry = getEntryByType('account');
    if (accountEntry) {
      return {
        answer: truncateToShortParagraphs(accountEntry.content),
        sourceTitle: accountEntry.title,
        suggestions: [
          'How do payments work?',
          'How can I contact TopHeights?',
          'What services does TopHeights offer?',
        ],
      };
    }
  }

  if (isVagueQuery(message)) {
    return {
      answer: 'Do you mean payments, services, products, or account access? Choose a topic and I will help quickly.',
      suggestions: CLARIFYING_SUGGESTIONS,
    };
  }

  if (/services?\b/i.test(message)) {
    const serviceSummary = buildServiceSummary();
    if (serviceSummary) {
      return {
        answer: serviceSummary,
        suggestions: [
          'Tell me about solar energy solutions',
          'Do you offer emergency electrical repairs?',
          'What is home automation service?',
        ],
      };
    }
  }

  const matches = fuse.search(message, { limit: 3 });
  const best = matches[0];

  if (!best || typeof best.score !== 'number' || best.score > 0.47) {
    return {
      answer:
        "I couldn't find that information on the website. Please rephrase your question and include a specific topic.",
      suggestions: CLARIFYING_SUGGESTIONS,
    };
  }

  const responseText = truncateToShortParagraphs(best.item.content);
  return {
    answer: responseText,
    sourceTitle: best.item.title,
    suggestions: matches.slice(1).map((item) => item.item.title).slice(0, 3),
  };
}

export function getTopKnowledgeMatches(message, limit = 4) {
  return fuse.search(message, { limit }).map((result) => result.item);
}
