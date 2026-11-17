import { env } from './server'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
/**
 * Asks a small, fast model for a short chat title, like "Managing Tension
 * Headaches". Falls back to the chat model, and returns null if both fail
 * so the placeholder title stays.
 */
export async function writeTitle(apiKey: string, question: string, answer: string, chatModel: string): Promise<string | null> {
  const prompt = [
    {
      role: 'system',
      content:
        'You name chat conversations. Reply with only a title of 2 to 6 words in Title Case that captures the topic, ' +
        'like "Managing Tension Headaches" or "Ibuprofen and Alcohol Safety". No quotes, no ending punctuation, no emoji.',
    },
    { role: 'user', content: `Question: ${question.slice(0, 1000)}\n\nAnswer: ${answer.slice(0, 1500)}` },
  ]
  const models = [env('GROQ_TITLE_MODEL') ?? 'llama-3.1-8b-instant', chatModel]

  for (const model of models) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: prompt, temperature: 0.3, max_completion_tokens: 20 }),
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) continue
      const data = await res.json() as { choices?: { message?: { content?: string } }[] }
      const title = cleanTitle(data.choices?.[0]?.message?.content ?? '')
      if (title) return title
    } catch { /* try the next model */ }
  }
  return null
}

export function cleanTitle(raw: string): string | null {
  const title = raw
    .split('\n')[0]
    .replace(/^\s*(title\s*:\s*)/i, '')
    .replace(/^["'`*#\s]+|["'`*.!?:\s]+$/g, '')
    .trim()
  if (!title || title.length > 60) return title ? `${title.slice(0, 57)}...` : null
  return title
}
