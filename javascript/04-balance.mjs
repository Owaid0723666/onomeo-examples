/* How many credits are left, and how much of the window is still free.
 *
 * This endpoint sits beside the API rather than under /v1, so it is a plain
 * fetch rather than an SDK method.
 *
 *   node 04-balance.mjs
 */

const response = await fetch('https://onomeo.com/api/me', {
  headers: { Authorization: `Bearer ${process.env.ONOMEO_API_KEY}` },
});

if (!response.ok) {
  const { error } = await response.json();
  throw new Error(`${error.code}: ${error.message}`);
}

const me = await response.json();
const hours = Math.round(me.calls.windowMinutes / 60);
const n = (value) => value.toLocaleString('en-US');

console.log(`balance        ${n(me.balance)} credits`);
console.log(`spent so far   ${n(me.spentTotal)} credits`);
console.log(
  me.checkin.claimedToday
    ? `check-in       claimed; tomorrow is worth ${n(me.checkin.nextAmount)}`
    : `check-in       ${n(me.checkin.todayAmount)} credits waiting on the dashboard`,
);
console.log(`calls left     ${me.calls.left} of ${me.calls.max} in this ${hours}-hour window`);
