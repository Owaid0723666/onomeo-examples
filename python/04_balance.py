"""How many credits are left, and how much of the window is still free.

This endpoint sits beside the API rather than under /v1, so it is a plain HTTP
call rather than an SDK method.

    python 04_balance.py
"""

import json
import os
import urllib.request

# Naming your client in the user agent is good manners and makes your own
# requests easy to spot in a log.
request = urllib.request.Request(
    "https://onomeo.com/api/me",
    headers={
        "Authorization": f"Bearer {os.environ['ONOMEO_API_KEY']}",
        "User-Agent": "onomeo-examples/1.0",
    },
)

with urllib.request.urlopen(request) as response:
    me = json.load(response)

checkin = me["checkin"]
calls = me["calls"]
hours = round(calls["windowMinutes"] / 60)

print(f"balance        {me['balance']:,} credits")
print(f"spent so far   {me['spentTotal']:,} credits")

if checkin["claimedToday"]:
    print(f"check-in       claimed; tomorrow is worth {checkin['nextAmount']:,}")
else:
    print(f"check-in       {checkin['todayAmount']:,} credits waiting on the dashboard")

print(f"calls left     {calls['left']} of {calls['max']} in this {hours}-hour window")
