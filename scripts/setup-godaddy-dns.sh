#!/usr/bin/env bash
# Point anabee.org DNS at Netlify (GoDaddy REST API).
# Requires API keys from https://developer.godaddy.com/keys
#
#   export GODADDY_API_KEY="..."
#   export GODADDY_API_SECRET="..."
#   ./scripts/setup-godaddy-dns.sh

set -euo pipefail

DOMAIN="${DOMAIN:-anabee.org}"
NETLIFY_SITE="${NETLIFY_SITE:-anabee-org.netlify.app}"
NETLIFY_APEX_IP="${NETLIFY_APEX_IP:-75.2.60.5}"

if [[ -z "${GODADDY_API_KEY:-}" || -z "${GODADDY_API_SECRET:-}" ]]; then
  echo "Set GODADDY_API_KEY and GODADDY_API_SECRET (from developer.godaddy.com/keys)" >&2
  exit 1
fi

api() {
  local method="$1" path="$2"
  shift 2
  curl -sS -X "$method" \
    -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}" \
    -H "Content-Type: application/json" \
    "https://api.godaddy.com/v1${path}" "$@"
}

echo "Updating DNS for ${DOMAIN} → Netlify (${NETLIFY_SITE})"

# Apex A record
api PUT "/domains/${DOMAIN}/records/A/@" \
  -d "[{\"data\":\"${NETLIFY_APEX_IP}\",\"ttl\":600}]"

# www CNAME
api PUT "/domains/${DOMAIN}/records/CNAME/www" \
  -d "[{\"data\":\"${NETLIFY_SITE}\",\"ttl\":600}]"

echo "Done. DNS may take up to 48h to propagate (usually minutes)."
echo "Verify: dig +short ${DOMAIN} A"
echo "        dig +short www.${DOMAIN} CNAME"
