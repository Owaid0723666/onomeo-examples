"""One question, several models, answers side by side.

Asks three models the same thing and prints how long each took and what each
cost. This is the quickest way to find out which model is worth using for your
own work, rather than trusting a leaderboard.

One at a time on purpose. While a request is in flight the API holds a
conservative amount of credit against your balance and settles up afterwards, so
three requests at once need roughly 1,800 credits held even though the three
answers together cost nearer 150. Sequential keeps this runnable on a fresh
account.

    python 05_compare_models.py "your question here"
"""

import os
import sys
import time

from openai import OpenAI

MODELS = [
    "THUDM/GLM-4-9B-0414",
    "@cf/meta/llama-4-scout-17b-16e-instruct",
    "Qwen/Qwen2.5-7B-Instruct",
]

QUESTION = " ".join(sys.argv[1:]) or "In two sentences: why is the sky blue?"

client = OpenAI(
    api_key=os.environ["ONOMEO_API_KEY"],
    base_url="https://onomeo.com/v1",
)

print(f"Q: {QUESTION}\n")

total = 0
for model in MODELS:
    started = time.monotonic()
    try:
        reply = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": QUESTION}],
        )
        answer = reply.choices[0].message.content.strip()
        spent = reply.usage.total_tokens
    except Exception as failure:  # one model being down should not stop the rest
        answer, spent = f"failed: {failure}", 0

    seconds = time.monotonic() - started
    total += spent

    print("=" * 72)
    print(f"{model}   {seconds:.1f}s   {spent} credits")
    print("=" * 72)
    print(answer)
    print()

print(f"{total} credits for all {len(MODELS)}.")
