/* The same question, printed as it arrives.
 *
 * Streaming uses server-sent events in the OpenAI format, so the client handles
 * it with no extra work. The final chunk carries the usage count, and that count
 * is what gets deducted.
 *
 *   node 02-stream.mjs
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.ONOMEO_API_KEY,
  baseURL: 'https://onomeo.com/v1',
});

const stream = await client.chat.completions.create({
  model: process.env.ONOMEO_MODEL || 'THUDM/GLM-4-9B-0414',
  messages: [{ role: 'user', content: 'Count from one to ten, one line each.' }],
  stream: true,
});

let spent = 0;
for await (const chunk of stream) {
  if (chunk.usage) spent = chunk.usage.total_tokens;
  const piece = chunk.choices?.[0]?.delta?.content;
  if (piece) process.stdout.write(piece);
}

console.log(`\n\n${spent} credits spent`);
