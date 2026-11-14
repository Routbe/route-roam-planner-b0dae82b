// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ENCLAVE_MERGE_TABLES } from "./account-merge-rules";
import { accountPurgeStatements, ANON_BOOKING_PURGE_PROBE } from "./account-purge";

const SQL = readFileSync(join(__dirname, "..", "..", "db-pending", "0273_anonymous_booking_engine.sql"), "utf8");
const tables = [...SQL.matchAll(/create table vault_enclave\.(anon_\w+)/g)].map((m) => m[1]!).sort();

describe("anonymous booking tables in account merge and purge (db-pending/0273)", () => {
  it("every anon table of 0273 has a reviewed merge strategy, and only the chain row names a member", () => {
    expect(Object.keys(ENCLAVE_MERGE_TABLES).sort()).toEqual(tables);
    expect(tables).toHaveLength(9);
    const withMember = tables.filter((t) => new RegExp(`create table vault_enclave\\.${t} \\([^;]*references public\\.users`, "s").test(SQL));
    expect(withMember).toEqual(["anon_host_keys"]);
    expect(ENCLAVE_MERGE_TABLES.anon_host_keys).toBe("close_and_reassign");
  });

  it("no anon foreign key cascades: a forgotten table blocks merge and purge instead of dropping rows", () => {
    expect(SQL).not.toMatch(/on delete cascade/i);
    expect(SQL).not.toMatch(/on delete set null/i);
    expect(SQL.match(/on delete restrict/gi)?.length).toBeGreaterThanOrEqual(9);
  });

  it("the purge calls the anonymous step only when 0273 is present, after the auth rows and before the user row", () => {
    const u = "11111111-1111-4111-8111-111111111111";
    expect(accountPurgeStatements(u, u).some((s) => s.query.includes("rout_anon_booking_purge"))).toBe(false);
    const q = accountPurgeStatements(u, u, { anonBooking: true }).map((s) => s.query);
    const at = q.findIndex((x) => x.includes("rout_anon_booking_purge"));
    expect(at).toBeGreaterThan(q.findIndex((x) => x.includes("rout.purge_user_id")));
    expect(q[at + 1]).toBe("delete from public.users where id = $1");
    expect(ANON_BOOKING_PURGE_PROBE).toContain("rout_anon_booking_purge(uuid)");
  });
});
