#!/usr/bin/env bash
set -euo pipefail

node22_bin="$(find /nix/store -maxdepth 1 -type d -name '*-nodejs-22*-wrapped' -print -quit)/bin"
if [[ ! -x "$node22_bin/node" ]]; then
  echo "Node.js 22 is required to run the local Cloudflare Worker preview." >&2
  exit 1
fi

export PATH="$node22_bin:$PATH"
port="${CLOUDFLARE_DEV_PORT:-8008}"
exec pnpm --filter @workspace/cloudflare-worker exec wrangler dev \
  --local \
  --ip 0.0.0.0 \
  --port "$port"
