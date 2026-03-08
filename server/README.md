# TopHeights AI Assistant Server

Local knowledge-search backend for the floating chatbot widget.

## 1) Install

```bash
cd server
npm install
```

## 2) Build/refresh knowledge base

```bash
npm run generate:knowledge
```

This reads website content from:

- `src/data/services.ts`
- `src/data/products.ts`
- `src/pages/About.tsx`
- `src/components/Layout.tsx`

and writes `server/knowledge.json`.

## 3) Run the chat API

```bash
npm run dev
```

Server endpoint:

- `POST /api/chat`
- `GET /api/health`

Example request:

```json
{
  "message": "How do payments work?"
}
```

Example response:

```json
{
  "answer": "The website has cart and checkout flows where users can review cart items and proceed with orders. Pricing is shown in Kenyan Shillings (KES) on product cards.",
  "suggestions": [
    "How do payments work?",
    "What services does TopHeights offer?",
    "How can I contact TopHeights?"
  ]
}
```

## Optional OpenAI enhancement

The server works without OpenAI using local knowledge search.

To enable OpenAI:

1. Copy `server/.env.example` to `server/.env`
2. Set `OPENAI_API_KEY` in `server/.env`
3. Restart the server

If OpenAI is unavailable or errors, the server automatically falls back to local knowledge search.

## 4) Frontend connection

Set Vite env variable (optional):

```bash
VITE_CHAT_API_URL=http://localhost:3001
```

If omitted, the widget defaults to `http://localhost:3001`.
