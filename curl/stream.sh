#!/bin/sh
# The same answer as server-sent events. Each line is one `data:` chunk in the
# OpenAI format; the last one before [DONE] carries the credits spent.
#
#   sh stream.sh

curl -N -s https://onomeo.com/v1/chat/completions \
  -H "Authorization: Bearer $ONOMEO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "THUDM/GLM-4-9B-0414",
    "messages": [{"role": "user", "content": "Count from one to five."}],
    "stream": true
  }'
