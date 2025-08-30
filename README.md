# React Voice & Files Chat UI

## Quick start

```bash
npm create vite@latest
# (skip) — or just clone/extract this folder

# Inside this project:
npm install
npm run dev
```

Open http://localhost:5173

> Voice recognition works best in Chrome on desktop. Some browsers don’t support it.

## Hooking up your own AI

Open `src/lib/aiAdapter.js` and set `USE_MOCK = false`. Replace the example with a `fetch` call to your backend (or OpenAI proxy). You’ll receive the full `history` and `attachments` metadata.

```js
export async function chat(history, attachments){
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ history, attachments })
  })
  const data = await res.json()
  return data.reply
}
```

## Build

```bash
npm run build
npm run preview
```
