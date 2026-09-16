/* The smallest request: one question, one answer.
 *
 *   npm install
 *   export ONOMEO_API_KEY="ac-..."
 *   node 01-hello.mjs
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.ONOMEO_API_KEY,
  baseURL: 'https://onomeo.com/v1',
});

const reply = await client.chat.completions.create({
  model: process.env.ONOMEO_MODEL || 'THUDM/GLM-4-9B-0414',
  messages: [{ role: 'user', content: 'Say hello in five words.' }],
});

console.log(reply.choices[0].message.content);
console.log(`\n${reply.usage.total_tokens} credits spent`);
