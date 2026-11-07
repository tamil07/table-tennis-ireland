#!/usr/bin/env bash
set -euo pipefail
if [[ "$(node -p 'Number(process.versions.node.split(".")[0])')" -lt 22 ]]; then echo 'Install Node 22 first.'; exit 1; fi
printf 'This helper logs in and reviews migrations. It does not apply them or enable live mode.\n'
npx supabase login
npx supabase link --project-ref mkxqrkqwpvjtkjfjjckm
npx supabase db push --remote --dry-run
printf '\nReview the output. Follow docs/PERSONAL_LAPTOP_LAUNCH.md for apply, owner bootstrap, secrets, deployment and smoke checks.\n'
