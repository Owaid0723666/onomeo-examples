"""What to do when a request does not go through.

Every failure comes back as JSON with a stable `code` field. Match on the code,
not on the message text, which is written for people and may change or arrive in
another language.

Three of them are worth handling in real code:

  too_fast / account_quota / network_quota   wait retryAfter seconds, try again
  upstream_failed                            the provider blinked; nothing was
                                             deducted, so retrying is free
  not_enough_credit                          no amount of retrying will help

The example below does the retrying. It uses plain HTTP so that the error body
is visible; through the OpenAI SDK the same information arrives on
openai.APIStatusError as .status_code and .body.

    python 06_handle_errors.py
"""

import json
import os
import time
import urllib.error
import urllib.request

RETRY_AFTER_CODES = {"too_fast", "account_quota", "network_quota", "site_busy"}
RETRY_NOW_CODES = {"upstream_failed"}


def ask(question, model="THUDM/GLM-4-9B-0414", attempts=4):
    body = json.dumps({"model": model, "messages": [{"role": "user", "content": question}]})
    request = urllib.request.Request(
        "https://onomeo.com/v1/chat/completions",
        data=body.encode(),
        headers={
            "Authorization": f"Bearer {os.environ['ONOMEO_API_KEY']}",
            "Content-Type": "application/json",
            # Cloudflare rejects Python's default "Python-urllib/..." user agent.
            "User-Agent": "onomeo-examples/1.0",
        },
    )

    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(request) as response:
                return json.load(response)
        except urllib.error.HTTPError as failure:
            error = json.loads(failure.read() or b"{}").get("error", {})
            code = error.get("code", "")

            if code in RETRY_AFTER_CODES and attempt < attempts:
                wait = error.get("retryAfter") or int(failure.headers.get("Retry-After", 5))
                print(f"  {code}: waiting {wait}s (attempt {attempt})")
                time.sleep(wait)
                continue

            if code in RETRY_NOW_CODES and attempt < attempts:
                print(f"  {code}: the provider did not answer, nothing was deducted (attempt {attempt})")
                time.sleep(2)
                continue

            if code == "not_enough_credit":
                raise SystemExit(
                    f"Out of credits: {error['balance']} left, this request needs about {error['need']}. "
                    "Check in on https://onomeo.com/dashboard to top up."
                )

            if code == "model_not_allowed":
                raise SystemExit(f"{model} is not on the list. Call GET /v1/models for the current one.")

            if code in {"bad_key", "key_expired"}:
                raise SystemExit(f"{code}: create a new key on https://onomeo.com/dashboard.")

            raise SystemExit(f"{code or failure.code}: {error.get('message', 'request failed')}")

    raise SystemExit("Gave up after retrying.")


reply = ask("Say hello in five words.")
print(reply["choices"][0]["message"]["content"])
print(f"\n{reply['usage']['total_tokens']} credits spent")
