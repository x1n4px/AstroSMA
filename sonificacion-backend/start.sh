#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

PYTHON_BIN="${PYTHON:-$ROOT_DIR/.venv/bin/python}"
if [ ! -x "$PYTHON_BIN" ]; then
  if [ -x "$ROOT_DIR/.venv/bin/python" ]; then
    PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
  else
    python3 -m venv .venv
    PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
  fi
fi

if [ ! -x "$PYTHON_BIN" ]; then
  PYTHON_BIN="python3"
fi

if [ ! -f ".venv/.deps-installed" ] || [ "requirements.txt" -nt ".venv/.deps-installed" ]; then
  "$PYTHON_BIN" -m pip install -r requirements.txt
  touch .venv/.deps-installed
fi

if [ "${SONIFICATION_MODE:-prod}" = "dev" ]; then
  exec "$PYTHON_BIN" endpoint.py
fi

exec "$PYTHON_BIN" -m gunicorn \
  --bind "${HOST:-0.0.0.0}:${PORT:-5000}" \
  --workers "${GUNICORN_WORKERS:-2}" \
  --timeout "${GUNICORN_TIMEOUT:-900}" \
  --access-logfile - \
  --error-logfile - \
  endpoint:app
