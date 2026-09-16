/* One question, several models, answers side by side.
 *
 * Asks three models the same thing and prints how long each took and what each
 * cost. This is the quickest way to find out which model is worth using for your
 * own work, rather than trusting a leaderboard.
 *
 * One at a time on purpose. While a request is in flight the API holds a
 * conservative amount of credit against your balance and settles up afterwards,
 * so three requests at once need roughly 1,800 credits held even though the
 * three answers together cost nearer 150. Sequential keeps this runnable on a
 * fresh account.
 *
 *   node 05-compare-models.mjs "your question here"
 */

import OpenAI from 'openai';

const MODELS = [
  'THUDM/GLM-4-9B-0414',
  '@cf/meta/llama-4-scout-17b-16e-instruct',
  'Qwen/Qwen2.5-7B-Instruct',
];

const question = process.argv.slice(2).join(' ') || 'In two sentences: why is the sky blue?';

const client = new OpenAI({
  apiKey: process.env.ONOMEO_API_KEY,
  baseURL: 'https://onomeo.com/v1',
});

console.log(`Q: ${question}\n`);

let total = 0;
for (const model of MODELS) {
  const started = Date.now();
  let answer;
  let spent = 0;

  try {
    const reply = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: question }],
    });
    answer = reply.choices[0].message.content.trim();
    spent = reply.usage.total_tokens;
  } catch (failure) {
    /* one model being down should not stop the rest */
    answer = `failed: ${failure}`;
  }

  const seconds = (Date.now() - started) / 1000;
  total += spent;

  console.log('='.repeat(72));
  console.log(`${model}   ${seconds.toFixed(1)}s   ${spent} credits`);
  console.log('='.repeat(72));
  console.log(answer);
  console.log();
}

console.log(`${total} credits for all ${MODELS.length}.`);
