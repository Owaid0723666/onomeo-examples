"""Every model this key is allowed to call.

The list changes: providers add models, retire them, and put some of them on a
free tier for a while. Read it at startup rather than hard-coding a name.

    python 03_list_models.py
"""

import os

from openai import OpenAI

client = OpenAI(
    api_key=os.environ["ONOMEO_API_KEY"],
    base_url="https://onomeo.com/v1",
)

models = [model.id for model in client.models.list().data]

print(f"{len(models)} models available\n")
for model_id in models:
    tag = ""
    if model_id == "auto":
        tag = "  (picks a strong model for you, and falls through if it is down)"
    elif model_id.endswith(":free"):
        tag = "  (free tier at the provider this week)"
    print(f"  {model_id}{tag}")
