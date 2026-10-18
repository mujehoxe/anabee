#!/usr/bin/env bash
# Set up free ImprovMX email forwarding for anabee.org + GoDaddy MX/SPF DNS.
#
# One-time manual steps (browser):
#   1. Create a free account at https://improvmx.com
#   2. Account → API → create key  → export IMPROVMX_API_KEY=...
#   3. GoDaddy API keys: https://developer.godaddy.com/keys
#        export GODADDY_API_KEY=...
#        export GODADDY_API_SECRET=...
#
# Usage:
#   export IMPROVMX_API_KEY=...
#   export GODADDY_API_KEY=...
#   export GODADDY_API_SECRET=...
#   export FORWARD_TO='you@gmail.com'                      # one destination
#   # or multiple destinations (comma-separated, max 5 on free):
#   export FORWARD_TO='ali@gmail.com,partner@outlook.com'
#   ./scripts/setup-improvmx-email.sh
#
# Optional:
#   DOMAIN=anabee.org
#   ALIASES=dr.ali,contact,info,*             # * = catch-all (counts as 1 alias)
#   Default alias is dr.ali → creates dr.ali@anabee.org

set -euo pipefail

DOMAIN="${DOMAIN:-anabee.org}"
FORWARD_TO="${FORWARD_TO:-}"
ALIASES="${ALIASES:-dr.ali}"

# Prefer system Python — brew python3 may be a broken symlink on PATH
if [[ -x /usr/bin/python3 ]]; then
  PYTHON=/usr/bin/python3
elif [[ -x /bin/python3 ]]; then
  PYTHON=/bin/python3
else
  echo "Need /usr/bin/python3" >&2
  exit 1
fi

if [[ -z "${IMPROVMX_API_KEY:-}" ]]; then
  echo "Set IMPROVMX_API_KEY (from https://improvmx.com → Account → API)" >&2
  exit 1
fi
if [[ -z "${GODADDY_API_KEY:-}" || -z "${GODADDY_API_SECRET:-}" ]]; then
  echo "Set GODADDY_API_KEY and GODADDY_API_SECRET (developer.godaddy.com/keys)" >&2
  exit 1
fi
if [[ -z "$FORWARD_TO" ]]; then
  echo "Set FORWARD_TO to one or more inboxes (comma-separated), e.g." >&2
  echo "  export FORWARD_TO='you@gmail.com,other@outlook.com'" >&2
  exit 1
fi

mx_api() {
  local method="$1" path="$2"
  shift 2
  curl -sS -X "$method" \
    -u "api:${IMPROVMX_API_KEY}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    "https://api.improvmx.com/v3${path}" "$@"
}

gd_api() {
  local method="$1" path="$2"
  shift 2
  curl -sS -X "$method" \
    -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    "https://api.godaddy.com/v1${path}" "$@"
}

echo "==> ImprovMX: ensure domain ${DOMAIN}"
add_out="$(mx_api POST /domains -d "{\"domain\":\"${DOMAIN}\"}" || true)"
if echo "$add_out" | grep -q '"success":true'; then
  echo "Domain added."
elif echo "$add_out" | grep -qi 'already registered'; then
  echo "Domain already on this ImprovMX account (ok)."
else
  echo "$add_out" | head -c 400
  echo
fi
echo

echo "==> ImprovMX: upsert aliases → ${FORWARD_TO}"
IFS=',' read -ra ALIAS_ARR <<< "$ALIASES"
for alias in "${ALIAS_ARR[@]}"; do
  alias="$(echo "$alias" | xargs)"
  [[ -z "$alias" ]] && continue
  echo "  - ${alias}@${DOMAIN}"
  resp="$(mx_api POST "/domains/${DOMAIN}/aliases" \
    -d "{\"alias\":\"${alias}\",\"forward\":\"${FORWARD_TO}\"}" || true)"
  if echo "$resp" | grep -q '"success":true'; then
    echo "    created"
  else
    put="$(mx_api PUT "/domains/${DOMAIN}/aliases/${alias}" \
      -d "{\"forward\":\"${FORWARD_TO}\"}" || true)"
    if echo "$put" | grep -q '"success":true'; then
      echo "    updated"
    else
      echo "    POST: $resp"
      echo "    PUT:  $put"
    fi
  fi
done
echo

echo "==> ImprovMX: current aliases"
mx_api GET "/domains/${DOMAIN}/aliases?limit=100" | "$PYTHON" -m json.tool
echo

echo "==> GoDaddy: set MX records for ${DOMAIN}"
mx_resp="$(gd_api PUT "/domains/${DOMAIN}/records/MX/@" -d '[
  {"data":"mx1.improvmx.com","priority":10,"ttl":3600},
  {"data":"mx2.improvmx.com","priority":20,"ttl":3600}
]')"
if [[ -n "$mx_resp" && "$mx_resp" != *"Error"* ]]; then
  echo "$mx_resp"
fi
echo "MX request sent. Public DNS:"
dig +short MX "$DOMAIN" || true
echo

echo "==> GoDaddy: set/merge SPF TXT on @"
existing="$(gd_api GET "/domains/${DOMAIN}/records/TXT/@" || echo '[]')"
if echo "$existing" | grep -qi '<html'; then
  echo "GoDaddy TXT GET failed (transient). Retrying in 3s…"
  sleep 3
  existing="$(gd_api GET "/domains/${DOMAIN}/records/TXT/@" || echo '[]')"
fi
"$PYTHON" -c '
import json, sys
raw = sys.stdin.read()
try:
    records = json.loads(raw) if raw.strip() else []
except json.JSONDecodeError:
    records = []
spf_needed = "v=spf1 include:spf.improvmx.com ~all"
out, found = [], False
for r in records:
    data = (r.get("data") or "").strip().strip("\"")
    if data.lower().startswith("v=spf1"):
        found = True
        if "include:spf.improvmx.com" not in data:
            parts = data.split()
            if parts and parts[-1] in ("~all", "-all", "?all", "+all"):
                parts.insert(-1, "include:spf.improvmx.com")
            else:
                parts.extend(["include:spf.improvmx.com", "~all"])
            data = " ".join(parts)
        out.append({"data": data, "ttl": int(r.get("ttl") or 3600)})
    else:
        out.append({"data": data, "ttl": int(r.get("ttl") or 3600)})
if not found:
    out.append({"data": spf_needed, "ttl": 3600})
json.dump(out, sys.stdout)
' <<<"$existing" > /tmp/anabee-spf-records.json

txt_resp="$(gd_api PUT "/domains/${DOMAIN}/records/TXT/@" -d @"/tmp/anabee-spf-records.json")"
if echo "$txt_resp" | grep -qi '<html\|error'; then
  echo "SPF PUT response: $txt_resp"
  echo "Retrying SPF in 5s…"
  sleep 5
  gd_api PUT "/domains/${DOMAIN}/records/TXT/@" -d @"/tmp/anabee-spf-records.json" || true
fi
echo "SPF payload: $(cat /tmp/anabee-spf-records.json)"
echo

echo "==> ImprovMX: DNS check"
mx_api GET "/domains/${DOMAIN}/check" | "$PYTHON" -m json.tool
echo

echo "==> Public DNS"
echo "MX:  $(dig +short MX "$DOMAIN" | tr '\n' ' ')"
echo "TXT: $(dig +short TXT "$DOMAIN" | tr '\n' ' ')"
echo
echo "Done. Send a test to ${ALIASES%%,*}@${DOMAIN} and check ${FORWARD_TO}."
echo "Optional Gmail Send-as: Settings → Accounts → Add ${ALIASES%%,*}@${DOMAIN}"
