/* What to do when a request does not go through.
 *
 * Every failure comes back as JSON with a stable `code` field. Match on the
 * code, not on the message text, which is written for people and may change or
 * arrive in another language.
 *
 * Three of them are worth handling in real code:
 *
 *   too_fast / account_quota / network_quota   wait retryAfter seconds, try again
 *   upstream_failed                            the provider blinked; nothing was
 *                                              deducted, so retrying is free
 *   not_enough_credit                          no amount of retrying will help
 *
 * The example below does the retrying. It uses plain fetch so that the error
 * body is visible; through the OpenAI client the same information arrives on the
 * thrown APIError as .status and .error.
 *
 *   node 06-handle-errors.mjs
 */

const RETRY_AFTER_CODES = new Set(['too_fast', 'account_quota', 'network_quota', 'site_busy']);
const RETRY_NOW_CODES = new Set(['upstream_failed']);

const sleep = (seconds) => new Promise((done) => setTimeout(done, seconds * 1000));

function giveUp(message) {
  console.error(message);
  process.exit(1);
}

async function ask(question, model = 'THUDM/GLM-4-9B-0414', attempts = 4) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch('https://onomeo.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ONOMEO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: question }] }),
    });

    if (response.ok) return response.json();

    const { error = {} } = await response.json().catch(() => ({}));
    const code = error.code || '';

    if (RETRY_AFTER_CODES.has(code) && attempt < attempts) {
      const wait = error.retryAfter || Number(response.headers.get('retry-after')) || 5;
      console.log(`  ${code}: waiting ${wait}s (attempt ${attempt})`);
      await sleep(wait);
      continue;
    }

    if (RETRY_NOW_CODES.has(code) && attempt < attempts) {
      console.log(`  ${code}: the provider did not answer, nothing was deducted (attempt ${attempt})`);
      await sleep(2);
      continue;
    }

    if (code === 'not_enough_credit') {
      giveUp(
        `Out of credits: ${error.balance} left, this request needs about ${error.need}. ` +
          'Check in on https://onomeo.com/dashboard to top up.',
      );
    }

    if (code === 'model_not_allowed') {
      giveUp(`${model} is not on the list. Call GET /v1/models for the current one.`);
    }

    if (code === 'bad_key' || code === 'key_expired') {
      giveUp(`${code}: create a new key on https://onomeo.com/dashboard.`);
    }

    giveUp(`${code || response.status}: ${error.message || 'request failed'}`);
  }

  giveUp('Gave up after retrying.');
}

const reply = await ask('Say hello in five words.');
console.log(reply.choices[0].message.content);
console.log(`\n${reply.usage.total_tokens} credits spent`);
