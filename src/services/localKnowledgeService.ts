import { products } from '../data/products';
import { services } from '../data/services';
import type { ChatApiResponse } from '../components/chatbot/types';

interface LocalEntry {
  title: string;
  content: string;
  keywords: string[];
}

const aboutEntries: LocalEntry[] = [
  {
    title: 'About Top Heights',
    content:
      'Top Heights Electricians delivers electrical solutions across residential, commercial, and industrial sectors in Kenya, focused on safety, efficiency, and innovation.',
    keywords: ['about', 'company', 'top heights', 'kenya'],
  },
  {
    title: 'Contact',
    content:
      'You can contact Top Heights by phone at +254 711 343 412. The website also provides WhatsApp links for quotes and support.',
    keywords: ['contact', 'phone', 'whatsapp', 'call'],
  },
  {
    title: 'Payments',
    content:
      'Payments happen through the website cart and checkout flow. Product prices are displayed in Kenyan Shillings (KES).',
    keywords: ['payment', 'pay', 'checkout', 'cart', 'kes', 'price'],
  },
  {
    title: 'Account Access',
    content:
      'Use the Sign In button in the top navigation to access your account and profile features.',
    keywords: ['account', 'login', 'sign in', 'profile'],
  },
];

const entries: LocalEntry[] = [
  ...services.map((service) => ({
    title: service.title,
    content: `${service.shortDescription} ${service.fullDescription} Key benefits: ${service.keyBenefits.join('; ')}.`,
    keywords: [service.id, 'service', ...service.keyBenefits],
  })),
  ...products.map((product) => ({
    title: product.name,
    content: `${product.name} costs KES ${product.price}. Category: ${product.category}. ${
      product.description ?? ''
    }`,
    keywords: ['product', product.category, 'price', product.name],
  })),
  ...aboutEntries,
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreEntry(query: string, entry: LocalEntry) {
  const normalizedQuery = normalize(query);
  const terms = normalizedQuery.split(' ').filter((term) => term.length > 1);
  const haystack = normalize(`${entry.title} ${entry.content} ${entry.keywords.join(' ')}`);

  let score = 0;
  for (const term of terms) {
    if (entry.title.toLowerCase().includes(term)) score += 3;
    if (entry.keywords.some((keyword) => keyword.toLowerCase().includes(term))) score += 2;
    if (haystack.includes(term)) score += 1;
  }
  return score;
}

function summarize(content: string, maxLength = 420) {
  const compact = content.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength)}...`;
}

export function getLocalAssistantFallback(message: string): ChatApiResponse {
  const scored = entries
    .map((entry) => ({ entry, score: scoreEntry(message, entry) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 2) {
    return {
      answer:
        "I couldn't find that exact information yet. Try asking about services, products, contact, payments, or account access.",
      suggestions: [
        'What services does TopHeights offer?',
        'How do payments work?',
        'How can I contact TopHeights?',
      ],
    };
  }

  return {
    answer: summarize(best.entry.content),
    sourceTitle: best.entry.title,
    suggestions: scored.slice(1, 4).map((item) => item.entry.title),
  };
}
