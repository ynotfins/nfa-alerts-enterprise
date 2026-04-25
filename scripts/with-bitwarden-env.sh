#!/usr/bin/env bash
set -euo pipefail

if ! command -v bws >/dev/null 2>&1; then
  echo "Bitwarden Secrets Manager CLI is not installed. Install bws before using this wrapper." >&2
  exit 127
fi

if [[ -z "${BWS_ACCESS_TOKEN:-}" ]]; then
  echo "BWS_ACCESS_TOKEN is required and must be provided by Cursor secrets." >&2
  exit 2
fi

if [[ -z "${BWS_PROJECT_ID:-}" ]]; then
  echo "BWS_PROJECT_ID is required and must identify the Bitwarden project for this repo." >&2
  exit 2
fi

if [[ "$#" -eq 0 ]]; then
  echo "Usage: scripts/with-bitwarden-env.sh <command> [args...]" >&2
  exit 2
fi

exec bws run --project-id "$BWS_PROJECT_ID" -- "$@"
