import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { listMigrationFiles, planMigrations } from "/dev-server/scripts/migration-plan";
import { migrationDefinerGuardSql, guardedMigration } from "/dev-server/scripts/security-definer-policy";
const DIR = "/dev-server/db";
const upto = process.argv[2]!;
const db = new PGlite({ extensions: { pgcrypto, btree_gist } });
for (const s of planMigrations(listMigrationFiles(DIR), new Set())) {
  if (s.action !== "run" || s.file > upto) continue;
  const g = guardedMigration(s.file) ? `;\n${migrationDefinerGuardSql(s.file)}` : "";
  await db.exec(`begin;\n${readFileSync(join(DIR, s.file), "utf8")}\n${g};commit;`);
}
const q = readFileSync("/tmp/neon0274/fp.sql", "utf8");
const out: Record<string, unknown> = {};
for (const part of q.split(";;").map((x) => x.trim()).filter(Boolean)) {
  const name = part.split("\n")[0]!.replace("--", "").trim();
  out[name] = (await db.query(part)).rows;
}
writeFileSync(`/tmp/neon0274/local-${upto.slice(0, 4)}.json`, JSON.stringify(out, null, 1));
console.log("ok", Object.keys(out));
