import OpenAI from 'openai';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function hasApiKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function buildKnowledgeContext(knowledgeResults) {
  if (!knowledgeResults?.length) return 'No direct context match found.';
  return knowledgeResults
    .slice(0, 4)
    .map((item, index) => `Source ${index + 1} - ${item.title}: ${item.content}`)
    .join('\n\n');
}

export async function generateOpenAIAnswer(message, knowledgeResults = []) {
  if (!hasApiKey()) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const context = buildKnowledgeContext(knowledgeResults);

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
    max_tokens: 220,
    messages: [
      {
        role: 'system',
        content:
          'You are TopHeights AI Assistant. Answer ONLY from provided website context. If context is insufficient, clearly say so and ask user to rephrase. Keep response concise (2 short paragraphs max).',
      },
      {
        role: 'user',
        content: `User question: ${message}\n\nWebsite context:\n${context}`,
      },
    ],
  });

  const answer = completion.choices?.[0]?.message?.content?.trim();
  if (!answer) return null;
  return answer;
}
