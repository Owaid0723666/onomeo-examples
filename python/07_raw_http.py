"""The same call with nothing installed: standard library only.

Useful when you are adding a request to a codebase that should not grow a
dependency, or when you are porting this to a language with no OpenAI client.

    python 07_raw_http.py
"""

import json
import os
import urllib.request

payload = json.dumps(
    {
        "model": os.environ.get("ONOMEO_MODEL", "THUDM/GLM-4-9B-0414"),
        "messages": [{"role": "user", "content": "Say hello in five words."}],
        "temperature": 0.0,
    }
)

request = urllib.request.Request(
    "https://onomeo.com/v1/chat/completions",
    data=payload.encode(),
    headers={
        "Authorization": f"Bearer {os.environ['ONOMEO_API_KEY']}",
        "Content-Type": "application/json",
        # naming your client is good manners, and makes your own requests
        # easy to spot in a log
        "User-Agent": "onomeo-examples/1.0",
    },
)

with urllib.request.urlopen(request) as response:
    reply = json.load(response)

print(reply["choices"][0]["message"]["content"])
print(f"\n{reply['usage']['total_tokens']} credits spent")
