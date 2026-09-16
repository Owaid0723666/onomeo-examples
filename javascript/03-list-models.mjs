/* Every model this key is allowed to call.
 *
 * The list changes: providers add models, retire them, and put some of them on a
 * free tier for a while. Read it at startup rather than hard-coding a name.
 *
 *   node 03-list-models.mjs
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.ONOMEO_API_KEY,
  baseURL: 'https://onomeo.com/v1',
});

const { data } = await client.models.list();

console.log(`${data.length} models available\n`);
for (const { id } of data) {
  let tag = '';
  if (id === 'auto') tag = '  (picks a strong model for you, and falls through if it is down)';
  else if (id.endsWith(':free')) tag = '  (free tier at the provider this week)';
  console.log(`  ${id}${tag}`);
}
