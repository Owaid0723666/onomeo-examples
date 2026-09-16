"""The same question, printed as it arrives.

Streaming uses server-sent events in the OpenAI format, so the SDK handles it
with no extra work. The final chunk carries the usage count, and that count is
what gets deducted.

    python 02_stream.py
"""

import os

from openai import OpenAI

client = OpenAI(
    api_key=os.environ["ONOMEO_API_KEY"],
    base_url="https://onomeo.com/v1",
)

stream = client.chat.completions.create(
    model=os.environ.get("ONOMEO_MODEL", "THUDM/GLM-4-9B-0414"),
    messages=[{"role": "user", "content": "Count from one to ten, one line each."}],
    stream=True,
)

spent = 0
for chunk in stream:
    if chunk.usage:
        spent = chunk.usage.total_tokens
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)

print(f"\n\n{spent} credits spent")
