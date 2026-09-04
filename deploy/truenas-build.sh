#!/bin/sh
# Build the LienStore image directly on TrueNAS SCALE (run over SSH as an admin user).
#   sh deploy/truenas-build.sh [SOURCE_DIR] [IMAGE_TAG]
#   defaults: SOURCE_DIR=/mnt/tank/apps/lienstore/src   IMAGE_TAG=lienstore:local
# TrueNAS 24.10+ ships the docker CLI; you may need `sudo` depending on the user.
set -eu
SRC="${1:-/mnt/tank/apps/lienstore/src}"
TAG="${2:-lienstore:local}"
DOCKER="docker"
if ! $DOCKER info >/dev/null 2>&1; then DOCKER="sudo docker"; fi

[ -f "$SRC/Dockerfile" ] || { echo "Dockerfile not found in $SRC"; exit 1; }
[ -f "$SRC/data/seed.json" ] || { echo "data/seed.json missing in $SRC (needed to seed the database)"; exit 1; }

echo "== building $TAG from $SRC"
cd "$SRC"
VERSION="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' package.json | head -1)"
$DOCKER build -t "$TAG" -t "lienstore:${VERSION:-dev}" .
$DOCKER image ls --filter reference='lienstore' --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}'

echo
echo "== smoke test (temporary container on port 30081)"
$DOCKER rm -f lienstore-smoke >/dev/null 2>&1 || true
$DOCKER run -d --rm --name lienstore-smoke -p 30081:3000 -e ADMIN_PASSWORD=smoke -e ADMIN_SESSION_SECRET=smoke "$TAG" >/dev/null
i=0
while [ $i -lt 30 ]; do
  if curl -fsS http://127.0.0.1:30081/api/health/ >/dev/null 2>&1; then
    echo "healthy: $(curl -fsS http://127.0.0.1:30081/api/health/)"
    $DOCKER stop lienstore-smoke >/dev/null
    echo
    echo "Image ready. Now install deploy/truenas-app.local.yaml via Apps → Discover Apps → ⋮ → Install via YAML."
    exit 0
  fi
  i=$((i+1)); sleep 2
done
echo "container did not become healthy — logs:"; $DOCKER logs lienstore-smoke; $DOCKER stop lienstore-smoke >/dev/null; exit 1
