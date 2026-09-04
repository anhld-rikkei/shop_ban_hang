#!/bin/sh
# Prepare the data directory, print startup hints, then hand over to the Next.js server.
# The application itself creates/migrates the SQLite database and imports the seed on first start.
set -e
DB_PATH="${LIEN_DB_PATH:-/app/data/lienstore.db}"
DB_DIR="$(dirname "$DB_PATH")"
mkdir -p "$DB_DIR" 2>/dev/null || true
if [ ! -w "$DB_DIR" ]; then
  echo "[entrypoint] ERROR: $DB_DIR is not writable by uid $(id -u). On the host run: chown -R 1000:1000 <mounted folder>" >&2
  exit 1
fi
if [ -f "$DB_PATH" ]; then
  echo "[entrypoint] using existing database $DB_PATH"
else
  echo "[entrypoint] no database yet — it will be created at $DB_PATH and seeded from ${LIEN_SEED_PATH:-/app/seed/seed.json}"
fi
if [ -z "$ADMIN_PASSWORD" ]; then
  echo "[entrypoint] WARNING: ADMIN_PASSWORD is not set — admin uses the default password (admin / admin123)."
fi
if [ -z "$ADMIN_SESSION_SECRET" ]; then
  echo "[entrypoint] WARNING: ADMIN_SESSION_SECRET is not set — admin sessions reset on every restart."
fi
exec "$@"
