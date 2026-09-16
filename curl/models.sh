#!/bin/sh
# Every model this key may call.
#
#   sh models.sh

curl -s https://onomeo.com/v1/models \
  -H "Authorization: Bearer $ONOMEO_API_KEY"
