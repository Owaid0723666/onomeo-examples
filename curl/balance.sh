#!/bin/sh
# Credits left, check-in waiting, calls left in the window.
# This endpoint sits beside the API rather than under /v1.
#
#   sh balance.sh

curl -s https://onomeo.com/api/me \
  -H "Authorization: Bearer $ONOMEO_API_KEY"
