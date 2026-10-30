#!/usr/bin/env bash
# Daily encrypted PostgreSQL backup → Cloudflare R2.
# Intended for GitHub Actions (environment production-backups) only.
# Never prints connection strings, keys, or object payloads.
set -euo pipefail
# Refuse xtrace so secrets in env cannot leak via bash -x.
set +x

BUCKET="soma-db-backups"
PG_DUMP="/usr/lib/postgresql/17/bin/pg_dump"
WORKDIR=""
PLAIN=""
CIPHER=""

log() {
  printf '%s\n' "$*"
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing command: $1"
}

cleanup() {
  local status=$?
  set +e
  if [[ -n "${PLAIN}" && -e "${PLAIN}" ]]; then
    rm -f -- "${PLAIN}"
  fi
  if [[ -n "${CIPHER}" && -e "${CIPHER}" ]]; then
    rm -f -- "${CIPHER}"
  fi
  if [[ -n "${WORKDIR}" && -d "${WORKDIR}" ]]; then
    rm -rf -- "${WORKDIR}"
  fi
  exit "${status}"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

[[ -n "${SUPABASE_BACKUP_DATABASE_URL:-}" ]] || die "SUPABASE_BACKUP_DATABASE_URL is not set"
[[ -n "${AGE_PUBLIC_KEY:-}" ]] || die "AGE_PUBLIC_KEY is not set"
[[ -n "${R2_ACCOUNT_ID:-}" ]] || die "R2_ACCOUNT_ID is not set"
[[ -n "${R2_ACCESS_KEY_ID:-}" ]] || die "R2_ACCESS_KEY_ID is not set"
[[ -n "${R2_SECRET_ACCESS_KEY:-}" ]] || die "R2_SECRET_ACCESS_KEY is not set"

[[ "${AGE_PUBLIC_KEY}" == age1* ]] || die "AGE_PUBLIC_KEY does not look like an age recipient"

[[ -x "${PG_DUMP}" ]] || die "PostgreSQL 17 client not found at ${PG_DUMP}"
require_cmd age
require_cmd aws
require_cmd mktemp
require_cmd stat
require_cmd date

WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/soma-backup.XXXXXX")"
PLAIN="${WORKDIR}/soma.dump"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OBJECT_NAME="soma-${STAMP}.dump.age"
CIPHER="${WORKDIR}/${OBJECT_NAME}"

log "Starting encrypted backup ${STAMP}"
log "pg_dump: $("${PG_DUMP}" --version | head -n 1)"
log "age: $(age --version 2>&1 | head -n 1)"

# Prefer TLS when the URI does not already set sslmode. Do not echo the URL.
export PGSSLMODE="${PGSSLMODE:-require}"
export PGCONNECT_TIMEOUT="${PGCONNECT_TIMEOUT:-15}"

set +e
"${PG_DUMP}" \
  --format=custom \
  --file="${PLAIN}" \
  --no-password \
  "${SUPABASE_BACKUP_DATABASE_URL}"
DUMP_STATUS=$?
set -e

[[ "${DUMP_STATUS}" -eq 0 ]] || die "pg_dump exited with status ${DUMP_STATUS}"
[[ -f "${PLAIN}" ]] || die "pg_dump did not create an output file"
[[ -s "${PLAIN}" ]] || die "pg_dump produced an empty file"

DUMP_BYTES="$(stat -c '%s' "${PLAIN}" 2>/dev/null || stat -f '%z' "${PLAIN}")"
[[ "${DUMP_BYTES}" -gt 0 ]] || die "pg_dump output size is zero"
log "Dump size (bytes, plaintext): ${DUMP_BYTES}"

age -r "${AGE_PUBLIC_KEY}" -o "${CIPHER}" "${PLAIN}"
rm -f -- "${PLAIN}"
PLAIN=""

[[ -s "${CIPHER}" ]] || die "age produced an empty ciphertext"
CIPHER_BYTES="$(stat -c '%s' "${CIPHER}" 2>/dev/null || stat -f '%z' "${CIPHER}")"
log "Ciphertext size (bytes): ${CIPHER_BYTES}"

export AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-auto}"
export AWS_REQUEST_CHECKSUM_CALCULATION="${AWS_REQUEST_CHECKSUM_CALCULATION:-when_required}"
export AWS_RESPONSE_CHECKSUM_VALIDATION="${AWS_RESPONSE_CHECKSUM_VALIDATION:-when_required}"
ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

upload_and_verify() {
  local prefix="$1"
  local key="${prefix}/${OBJECT_NAME}"
  log "Uploading object prefix=${prefix}"
  aws s3 cp "${CIPHER}" "s3://${BUCKET}/${key}" --endpoint-url "${ENDPOINT}" --only-show-errors
  local remote_size
  remote_size="$(
    aws s3api head-object \
      --bucket "${BUCKET}" \
      --key "${key}" \
      --endpoint-url "${ENDPOINT}" \
      --query 'ContentLength' \
      --output text
  )"
  [[ "${remote_size}" == "${CIPHER_BYTES}" ]] || die "R2 object size mismatch for prefix=${prefix}"
  log "Upload verified prefix=${prefix} bytes=${remote_size}"
}

upload_and_verify "daily"

# Independent weekly copy of the same ciphertext (no second dump). Sunday UTC.
if [[ "$(date -u +%u)" == "7" ]]; then
  upload_and_verify "weekly"
else
  log "Skipping weekly copy (not Sunday UTC)"
fi

log "Backup finished"
