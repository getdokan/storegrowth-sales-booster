#!/usr/bin/env bash
#
# Provision a Docker stack for the Playwright suite:
#   - boots WordPress + MariaDB (docker compose)
#   - installs WP core + WooCommerce, activates StoreGrowth
#   - runs bin/provision-site.php (permalinks, modules, products, classic checkout)
#   - writes the env file the suite reads (never overwrites an existing one)
#
# Default stack (unchanged): http://localhost:8888, containers sg-test-automation(-db).
#
#   bash bin/setup-docker.sh
#
# Parallel stacks, one per port / project (separate volumes, containers, env file):
#
#   E2E_PORT=8890 E2E_PROJECT=sg-e2e-b2 bash bin/setup-docker.sh
#   E2E_ENV_FILE=.env.sg-e2e-b2 npm test
#
# Lite by default: StoreGrowth Pro is NOT mounted and is deactivated, so
# has_pro() is honestly false. Pro variant (opt-in) needs both:
#
#   PRO_DIR=../../../storegrowth-sales-booster-pro LICENSE_KEY=… bash bin/setup-docker.sh
#
# Idempotent: safe to re-run. Wipe a stack with
#   docker compose -p <project> down -v
set -euo pipefail

cd "$(dirname "$0")/.."   # -> tests/e2e

# --- Stack identity --------------------------------------------------------
# A COMPOSE_PROJECT_NAME already in the shell names the default stack (it wins
# over the file's `name:` anyway), so an existing stack keeps its volumes.
E2E_PORT="${E2E_PORT:-8888}"
if [ -n "${E2E_PROJECT:-}" ]; then
  E2E_CONTAINER="${E2E_CONTAINER:-$E2E_PROJECT}"
  DEFAULT_STACK=0
else
  E2E_PROJECT="${COMPOSE_PROJECT_NAME:-sg-test-automation}"
  E2E_CONTAINER="${E2E_CONTAINER:-sg-test-automation}"
  DEFAULT_STACK=1
fi
export E2E_PORT E2E_PROJECT E2E_CONTAINER

# A parallel stack needs BOTH a port and a project; one without the other would
# re-point the default stack (or collide with it on :8888).
if { [ "$DEFAULT_STACK" = "1" ] && [ "$E2E_PORT" != "8888" ]; } || \
   { [ "$DEFAULT_STACK" = "0" ] && [ "$E2E_PORT" = "8888" ]; }; then
  echo "Set both E2E_PORT (not 8888) and E2E_PROJECT for a parallel stack, or neither for the default one." >&2
  exit 1
fi

# The default stack writes .env; a parallel stack writes .env.<project>.
if [ "$DEFAULT_STACK" = "1" ]; then ENV_FILE="${E2E_ENV_FILE:-.env}"; else ENV_FILE="${E2E_ENV_FILE:-.env.$E2E_PROJECT}"; fi

BASE_URL="http://localhost:$E2E_PORT"
ADMIN_USER="admin"
ADMIN_PASS="password"
ADMIN_EMAIL="admin@example.com"

# --- Lite or Pro -------------------------------------------------------------
# Pro only when the caller passes BOTH a Pro folder and a license key. The key
# is read from the environment only (not from an old .env), so a plain re-run
# always gives the lite stack.
LICENSE_KEY="${LICENSE_KEY:-}"
PRO_DIR="${PRO_DIR:-}"
COMPOSE_FILES=(-f docker-compose.yml)
if [ -n "$PRO_DIR" ] && [ -n "$LICENSE_KEY" ]; then
  [ -d "$PRO_DIR" ] || { echo "PRO_DIR '$PRO_DIR' is not a directory" >&2; exit 1; }
  export PRO_DIR
  COMPOSE_FILES+=(-f docker-compose.pro.yml)
  VARIANT="pro"
else
  LICENSE_KEY=""
  VARIANT="lite"
fi

dc() { docker compose -p "$E2E_PROJECT" "${COMPOSE_FILES[@]}" "$@"; }
# Run a WP-CLI command inside the one-off cli container.
wp() { dc run --rm -T cli wp "$@"; }
# Same, with the license key exposed (provision-site.php activates Pro from it).
wp_provision() { dc run --rm -T -e LICENSE_KEY="$LICENSE_KEY" cli wp "$@"; }

# The debug log directory must exist before Docker mounts it.
mkdir -p bin/logs

echo "==> Stack: project=$E2E_PROJECT containers=$E2E_CONTAINER(-db) port=$E2E_PORT variant=$VARIANT"
echo "==> Booting containers (db + wordpress)…"
dc up -d db wordpress

echo "==> Waiting for WordPress (apache) to serve…"
for i in $(seq 1 60); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/wp-login.php" || true)"
  # Pre-install WP 302-redirects to install.php; any 2xx/3xx means apache is up.
  case "$code" in 2??|3??) echo "    up (HTTP $code)"; break ;; esac
  sleep 2
  [ "$i" = "60" ] && { echo "WordPress did not come up in time" >&2; exit 1; }
done

echo "==> Waiting for wp-config + DB to be reachable from CLI…"
for i in $(seq 1 30); do
  if wp db check >/dev/null 2>&1; then echo "    db reachable"; break; fi
  sleep 2
  [ "$i" = "30" ] && { echo "DB not reachable from CLI" >&2; exit 1; }
done

if wp core is-installed >/dev/null 2>&1; then
  echo "==> WordPress already installed — skipping core install."
else
  echo "==> Installing WordPress core…"
  wp core install \
    --url="$BASE_URL" \
    --title="StoreGrowth E2E" \
    --admin_user="$ADMIN_USER" \
    --admin_password="$ADMIN_PASS" \
    --admin_email="$ADMIN_EMAIL" \
    --skip-email
fi

# WP_ENVIRONMENT_TYPE=local (App Passwords over plain HTTP) comes from
# WORDPRESS_CONFIG_EXTRA in docker-compose.yml. Older runs also wrote it into
# wp-config.php, which makes PHP warn "already defined" on every request.
if wp config has WP_ENVIRONMENT_TYPE --type=constant >/dev/null 2>&1; then
  echo "==> Removing the duplicate WP_ENVIRONMENT_TYPE from wp-config.php…"
  wp config delete WP_ENVIRONMENT_TYPE --type=constant >/dev/null 2>&1 || true
fi

echo "==> Installing + activating WooCommerce…"
wp plugin is-installed woocommerce >/dev/null 2>&1 || wp plugin install woocommerce --force >/dev/null
wp plugin activate woocommerce >/dev/null

echo "==> Installing + activating the Storefront theme (official WooCommerce theme)…"
wp theme is-installed storefront >/dev/null 2>&1 || wp theme install storefront >/dev/null
wp theme activate storefront >/dev/null

echo "==> Activating StoreGrowth (Sales Booster)…"
wp plugin activate storegrowth-sales-booster >/dev/null

echo "==> Installing + activating WP-API Basic-Auth (plain Basic auth for REST)…"
# Lets the api project authenticate with the admin user/password directly.
wp plugin is-active basic-auth >/dev/null 2>&1 || wp plugin is-active Basic-Auth >/dev/null 2>&1 || \
  wp plugin install "https://github.com/WP-API/Basic-Auth/archive/refs/heads/master.zip" --activate >/dev/null

# Pro variant: activate Pro in its own step so it is loaded when provisioning
# runs its Appsero license activation. On lite, provision-site.php deactivates
# a Pro left active in the volume by an earlier run.
if [ "$VARIANT" = "pro" ]; then
  echo "==> Activating StoreGrowth Pro…"
  wp plugin activate storegrowth-sales-booster-pro >/dev/null
fi
echo "==> Provisioning the site ($VARIANT: modules, products, classic checkout)…"
wp_provision eval-file /var/www/html/wp-content/plugins/storegrowth-sales-booster/tests/e2e/bin/provision-site.php

if [ -f "$ENV_FILE" ]; then
  echo "==> $ENV_FILE exists — left untouched (BASE_URL there should be $BASE_URL)."
else
  echo "==> Writing tests/e2e/${ENV_FILE}…"
  # With Basic-Auth active, the REST API accepts the admin user/password directly,
  # so no Application Password is needed (env.ts falls back to WP_ADMIN_PASSWORD).
  cat > "$ENV_FILE" <<EOF
# Generated by bin/setup-docker.sh for the $E2E_PROJECT Docker stack ($VARIANT).
BASE_URL=$BASE_URL

WP_ADMIN_USER=$ADMIN_USER
WP_ADMIN_PASSWORD=$ADMIN_PASS

# REST auth: WP-API Basic-Auth accepts the admin credentials directly.
WP_API_USER=$ADMIN_USER

# Raw WP-CLI access for the few specs that need it (helpers/wp-cli.ts). The
# stack's port/container go along: without them compose recreates the db
# container under the default name.
E2E_WP_CLI=E2E_PORT=$E2E_PORT E2E_CONTAINER=$E2E_CONTAINER docker compose -p $E2E_PROJECT run --rm -T cli wp
EOF
fi

if [ "$ENV_FILE" = ".env" ]; then RUN_PREFIX=""; else RUN_PREFIX="E2E_ENV_FILE=$ENV_FILE "; fi

echo ""
echo "============================================================"
echo " $E2E_PROJECT is ready ($VARIANT)."
echo "   Site:   $BASE_URL"
echo "   Admin:  $ADMIN_USER / $ADMIN_PASS  ($BASE_URL/wp-admin)"
echo "   Log:    tests/e2e/bin/logs/$E2E_CONTAINER.log"
echo ""
echo " Next:"
echo "   ${RUN_PREFIX}npm test            # full suite (setup -> ui -> api)"
echo "   ${RUN_PREFIX}npm run test:ui     # UI only"
echo "   docker compose -p $E2E_PROJECT down -v   # tear down + wipe data"
echo "============================================================"
