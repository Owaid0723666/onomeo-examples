# onomeo API examples

[简体中文](README.zh-CN.md)

Runnable examples for the [onomeo](https://onomeo.com) API: one OpenAI-compatible
endpoint in front of ~37 models, paid for with credits you collect on the site
instead of a credit card.

Every file here is self-contained. Pick a language, set one environment variable,
run it.

```
python/       Python, with the official OpenAI SDK and with plain requests
javascript/   Node 18+, with the OpenAI SDK and with plain fetch
curl/         four one-liners, nothing to install
```

## 1. Get a key

Sign in at [onomeo.com](https://onomeo.com) (email code, Google or GitHub), open
the [dashboard](https://onomeo.com/dashboard) and press **New key**. Signing in
gives you a key straight away, and checking in once a day tops the balance up.
No card, no trial, no invoice.

## 2. Point the examples at it

```bash
export ONOMEO_API_KEY="sk-onomeo-..."      # Windows PowerShell: $env:ONOMEO_API_KEY="sk-onomeo-..."
```

The single-model examples also take an optional `ONOMEO_MODEL` to run against a
model of your choice instead of the cheap default.

## 3. Run one

```bash
pip install -r python/requirements.txt    # only for the SDK examples
python python/01_hello.py

cd javascript && npm install              # only for the SDK examples
node 01-hello.mjs

sh curl/hello.sh                          # nothing to install
```

## What is in here

The same seven examples in each language — `01_hello.py`, `01-hello.mjs`.

| | What it shows |
|---|---|
| **01 hello** | The smallest possible request, with the OpenAI SDK |
| **02 stream** | The same request token by token |
| **03 list models** | Every model this key may call |
| **04 balance** | Credits left, and what today's check-in is worth |
| **05 compare models** | One question, three models, side by side with time and cost |
| **06 handle errors** | Rate limits, empty balance, provider outages, and what to retry |
| **07 raw http** | The same call with no SDK and no dependencies |

Only four of the seven suit a shell one-liner, so `curl/` has those: `hello.sh`,
`stream.sh`, `models.sh`, `balance.sh`.

## The API in one screen

Base URL: `https://onomeo.com/v1`

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/chat/completions` | Chat completion, streaming or not |
| `GET` | `/v1/models` | The model IDs this key may call |
| `GET` | `/api/me` | Balance, limits, and this key's usage (outside `/v1`) |

Authentication is `Authorization: Bearer YOUR_KEY`. Request and response bodies
follow the OpenAI shape, so any OpenAI client works by changing `base_url`:

```python
from openai import OpenAI

client = OpenAI(api_key="sk-onomeo-...", base_url="https://onomeo.com/v1")
```

## Credits

Credits are counted in **meo**, and 1 meo equals 1 token. The `usage.total_tokens`
field of a reply is exactly what gets deducted.

Only visible text is charged: what you sent plus what the model wrote back.
Reasoning a model does before answering is not charged, and an empty answer costs
nothing.

You collect them by checking in — 1,200 credits on the first day, rising to 3,500
on a seven-day streak — and by watching an ad, inviting someone, or sharing a
conversation that gets read. A balance holds up to 500,000.

At the cheapest models a reply costs around 30 credits, so one check-in is worth
roughly a hundred answers.

## Limits

| Limit | Value |
|---|---|
| Requests per key | 12 per minute |
| Requests per account | 60 per 5 hours |
| Requests per network address | 120 per 5 hours |
| `max_tokens` floor | 4,096 — a smaller value is raised to it |

A request over a limit comes back as 429 with `retryAfter` (seconds) in the body
and the same number in the `Retry-After` header.
`06_handle_errors` waits that long and carries on.

## Errors

Every failure is JSON with a stable `code`. Match on the code, never on the
message text.

| Code | HTTP | Meaning |
|---|---|---|
| `bad_key` | 401 | The key is wrong or no longer exists |
| `not_enough_credit` | 402 | Balance too low; the body carries `balance` and `need` |
| `key_expired` | 401 | This key is past its expiry date |
| `key_limit_reached` | 402 | This key hit its own spending cap; the account balance is untouched |
| `model_not_allowed` | 400 | That model is not on the list; the body carries the allowed names |
| `too_fast` | 429 | Too many requests from this key this minute |
| `account_quota` | 429 | The account's window is used up |
| `network_quota` | 429 | This network address's window is used up |
| `site_busy` | 429 | The whole service is at its upstream quota right now |
| `upstream_failed` | 502 | The provider did not answer — nothing is deducted |
| `upstream_unconfigured` | 503 | The service is not wired to a provider right now |

## Choosing a model

`GET /v1/models` lists the IDs. Two are worth knowing about:

- **`auto`** picks one of the strong models for you and falls through to another
  if the first is down. Use it when you do not want to care.
- Model IDs ending in **`:free`** are models the provider currently gives away.
  They come and go; the [free model board](https://onomeo.com/free-models) tracks
  what is on and off each week.

The [models page](https://onomeo.com/models) shows what each one costs per reply,
measured over the last 30 days rather than promised.

## Links

- [Documentation](https://onomeo.com/docs)
- [Models](https://onomeo.com/models) · [Free models this week](https://onomeo.com/free-models)
- [Free credits](https://onomeo.com/free-credits)
- Questions: hello@onomeo.com

## License

MIT. Copy anything here into your own project.
