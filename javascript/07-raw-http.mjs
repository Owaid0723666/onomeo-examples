/* The same call with nothing installed: built-in fetch only.
 *
 * Useful when you are adding a request to a codebase that should not grow a
 * dependency, or when you are porting this to a language with no OpenAI client.
 *
 *   node 07-raw-http.mjs
 */

const response = await fetch('https://onomeo.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.ONOMEO_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: process.env.ONOMEO_MODEL || 'THUDM/GLM-4-9B-0414',
    messages: [{ role: 'user', content: 'Say hello in five words.' }],
    temperature: 0,
  }),
});

if (!response.ok) {
  const { error } = await response.json();
  throw new Error(`${error.code}: ${error.message}`);
}

const reply = await response.json();
console.log(reply.choices[0].message.content);
console.log(`\n${reply.usage.total_tokens} credits spent`);
