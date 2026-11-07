#!/usr/bin/env bash
# Run on a trusted machine using PGHOST/PGPORT/PGUSER/PGDATABASE/PGPASSWORD.
set -euo pipefail
: "${BACKUP_PASSPHRASE:?Set an encryption passphrase privately}"
: "${PGHOST:?Set the intended database host}"
: "${PGDATABASE:?Set the intended database name}"
export PGSSLMODE="${PGSSLMODE:-require}"
mkdir -p backups
backup_path="backups/ttclubs-$(date -u +%Y%m%dT%H%M%SZ).sql.enc"
umask 077
pg_dump --no-owner --no-acl | openssl enc -aes-256-cbc -salt -pbkdf2 -pass env:BACKUP_PASSPHRASE -out "$backup_path"
printf 'Encrypted database backup: %s\nCopy to your approved private off-site location; retain the passphrase separately. Storage files need a separate backup.\n' "$backup_path"
