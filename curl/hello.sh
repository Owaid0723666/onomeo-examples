#!/bin/sh
# One question, one answer.
#
#   export ONOMEO_API_KEY="ac-..."
#   sh hello.sh

curl -s https://onomeo.com/v1/chat/completions \
  -H "Authorization: Bearer $ONOMEO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "THUDM/GLM-4-9B-0414",
    "messages": [{"role": "user", "content": "Say hello in five words."}]
  }'
