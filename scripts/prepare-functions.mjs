import { mkdirSync, copyFileSync } from "node:fs";
const target = "supabase/functions/_shared/domain";
mkdirSync(target, { recursive: true });
for (const file of ["operations.ts", "session-booking.ts"])
  copyFileSync(`packages/domain/src/${file}`, `${target}/${file}`);
console.log(
  "Prepared function-local copies of the canonical shared rules. Never edit generated copies.",
);
