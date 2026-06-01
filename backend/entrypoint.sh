#!/usr/bin/env bash
# Container entrypoint: bring the schema up to date, then serve.
#
# Running migrations here (rather than baking them into the image) means a fresh
# database is provisioned automatically on first boot, and any later migration is
# applied on the next deploy — the same command works locally and on Render.
set -euo pipefail

# The DB may still be starting (especially on first `compose up`). Retry the
# migration a few times before giving up so we don't crash-loop on a cold start.
attempt=1
max_attempts=10
until alembic upgrade head; do
  if [ "${attempt}" -ge "${max_attempts}" ]; then
    echo "Migrations failed after ${max_attempts} attempts; exiting." >&2
    exit 1
  fi
  echo "Database not ready (attempt ${attempt}/${max_attempts}); retrying in 3s..."
  attempt=$((attempt + 1))
  sleep 3
done

echo "Migrations applied. Starting API on port ${PORT}."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
