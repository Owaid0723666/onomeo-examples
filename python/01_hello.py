"""The smallest request: one question, one answer.

    pip install openai
    export ONOMEO_API_KEY="ac-..."
    python 01_hello.py
"""

import os

from openai import OpenAI

client = OpenAI(
    api_key=os.environ["ONOMEO_API_KEY"],
    base_url="https://onomeo.com/v1",
)

reply = client.chat.completions.create(
    model=os.environ.get("ONOMEO_MODEL", "THUDM/GLM-4-9B-0414"),
    messages=[{"role": "user", "content": "Say hello in five words."}],
)

print(reply.choices[0].message.content)
print(f"\n{reply.usage.total_tokens} credits spent")
