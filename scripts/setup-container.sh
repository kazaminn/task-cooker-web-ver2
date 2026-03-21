#!/usr/bin/env bash
set -euo pipefail

# required_keys=(
#   VITE_API_BASE_URL
# )

# echo "[setup] Checking required environment variables..."
# missing=0
# for key in "${required_keys[@]}"; do
#   if [[ -z "${!key:-}" ]]; then
#     echo "  - MISSING: $key"
#     missing=1
#   else
#     echo "  - OK: $key=${!key}"
#   fi
# done

# if [[ "$missing" -eq 1 ]]; then
#   echo ""
#   echo "[setup] Missing required env vars. Set them in the container environment panel and rerun."
#   exit 1
# fi

echo "[setup] Installing dependencies..."
npm ci

echo "[setup] Running AI checks (auto-fix + related tests)..."
npm run ai:check

echo "[setup] Done."