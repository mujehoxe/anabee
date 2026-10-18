#!/usr/bin/env bash
# Deploy anabee.org static site to the VPS.
#
#   ./scripts/deploy-vps.sh
#   HOST=root@31.97.188.191 REMOTE_DIR=/var/www/anabee.org ./scripts/deploy-vps.sh

set -euo pipefail

HOST="${HOST:-root@31.97.188.191}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/anabee.org}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Sync site/ → ${HOST}:${REMOTE_DIR}"
ssh "$HOST" "mkdir -p '${REMOTE_DIR}'"
rsync -avz --delete \
  --exclude '.DS_Store' \
  --exclude '*.map' \
  "${ROOT}/site/" "${HOST}:${REMOTE_DIR}/"

echo "==> Pledge upload service"
ssh "$HOST" "mkdir -p /opt/anabee /var/lib/anabee/pledges && chown -R www-data:www-data /var/lib/anabee"
scp "${ROOT}/scripts/anabee-pledge.py" "${HOST}:/opt/anabee/anabee-pledge.py"
scp "${ROOT}/scripts/anabee-pledge.service" "${HOST}:/etc/systemd/system/anabee-pledge.service"
ssh "$HOST" "systemctl daemon-reload && systemctl enable --now anabee-pledge.service && systemctl restart anabee-pledge.service"

echo "==> Reload nginx (if config present)"
ssh "$HOST" "nginx -t && systemctl reload nginx" || true

echo "Done. https://anabee.org (after DNS/TLS)"
