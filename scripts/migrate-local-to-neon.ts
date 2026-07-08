/**
 * Migrate from local PostgreSQL to Neon.
 *
 * Two modes:
 *
 *   npm run db:migrate-to-neon:full
 *     Full schema + data dump. Use when Neon is empty or you want to replace everything.
 *     Skips Prisma migrations — dumps exactly what your local DB has.
 *
 *   npm run db:migrate-to-neon
 *     Data-only dump. Use when Neon schema already matches local (after `npx prisma db push`).
 *
 * Setup:
 *   Add LOCAL_DATABASE_URL to .env (see .env.example), then:
 *   npm run db:migrate-to-neon:full
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

/** Load .env from project root so LOCAL_DATABASE_URL and DATABASE_URL are available. */
function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const PG_BIN_CANDIDATES = [
  "C:\\Program Files\\PostgreSQL\\18\\bin",
  "C:\\Program Files\\PostgreSQL\\17\\bin",
  "C:\\Program Files\\PostgreSQL\\16\\bin",
];

const fullDump = process.argv.includes("--full");

function resolvePgBin(): string {
  for (const dir of PG_BIN_CANDIDATES) {
    if (existsSync(path.join(dir, "pg_dump.exe"))) return dir;
  }
  try {
    const fromPath = execSync("where pg_dump", { encoding: "utf8" }).trim().split("\n")[0];
    if (fromPath) return path.dirname(fromPath);
  } catch {
    // not on PATH
  }
  throw new Error(
    "pg_dump not found. Install PostgreSQL client tools (you have PostgreSQL 18 at C:\\Program Files\\PostgreSQL\\18\\bin).",
  );
}

function run(cmd: string) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

function stripChannelBinding(url: string): string {
  return url
    .replace(/[?&]channel_binding=[^&]*/g, "")
    .replace(/\?&/, "?")
    .replace(/\?$/, "");
}

/** pg_dump/psql do not accept Prisma-only params like schema=public. */
function toPgCliUrl(url: string): string {
  try {
    const parsed = new URL(stripChannelBinding(url));
    parsed.searchParams.delete("schema");
    // localhost → ::1 on Windows uses scram auth; 127.0.0.1 may be trust in pg_hba.conf
    if (parsed.hostname === "localhost") {
      parsed.hostname = "127.0.0.1";
    }
    const search = parsed.searchParams.toString();
    const auth =
      parsed.password || parsed.username
        ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@`
        : "";
    return `${parsed.protocol}//${auth}${parsed.host}${parsed.pathname}${search ? `?${search}` : ""}`;
  } catch {
    return stripChannelBinding(url)
      .replace(/[?&]schema=[^&]*/g, "")
      .replace(/localhost/g, "127.0.0.1")
      .replace(/\?&/, "?")
      .replace(/\?$/, "");
  }
}

const localUrlRaw = process.env.LOCAL_DATABASE_URL?.trim() ?? "";
const neonUrlRaw = process.env.DATABASE_URL?.trim() ?? "";
const localUrl = localUrlRaw ? toPgCliUrl(localUrlRaw) : "";
const neonUrl = neonUrlRaw ? toPgCliUrl(neonUrlRaw) : "";

if (!localUrlRaw) {
  console.error(
    "❌ LOCAL_DATABASE_URL is not set.\n\n" +
      "Add it to your .env file:\n" +
      '   LOCAL_DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/digital_genius_mart?schema=public"\n\n' +
      "Or set it for this session:\n" +
      '   $env:LOCAL_DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/digital_genius_mart?schema=public"\n',
  );
  process.exit(1);
}

if (!neonUrlRaw) {
  console.error("❌ DATABASE_URL must point to your Neon database (set in .env).");
  process.exit(1);
}

const pgBin = resolvePgBin();
const pgDump = path.join(pgBin, "pg_dump.exe");
const psql = path.join(pgBin, "psql.exe");
const tmpDir = path.join(process.cwd(), ".tmp");
const dumpFile = path.join(tmpDir, fullDump ? "local-full.sql" : "local-data.sql");

mkdirSync(tmpDir, { recursive: true });

console.log(fullDump ? "Mode: FULL (schema + data)" : "Mode: DATA ONLY");

try {
  console.log("━━━ Step 1/4 — Verify local connection ━━━");
  run(`"${psql}" "${localUrl}" -c "SELECT current_database() AS db, (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public') AS tables;"`);

  console.log("━━━ Step 2/4 — Dump from local PostgreSQL ━━━");
  if (fullDump) {
    run(
      `"${pgDump}" "${localUrl}" --clean --if-exists --no-owner --no-privileges -f "${dumpFile}"`,
    );
  } else {
    run(
      `"${pgDump}" "${localUrl}" --data-only --no-owner --no-privileges --disable-triggers -f "${dumpFile}"`,
    );
  }

  if (fullDump) {
    console.log("━━━ Step 3/4 — Restore full dump to Neon (replaces schema + data) ━━━");
    run(`"${psql}" "${neonUrl}" -v ON_ERROR_STOP=1 -f "${dumpFile}"`);
  } else {
    console.log("━━━ Step 3/4 — Truncate Neon tables before data import ━━━");
    run(
      `"${psql}" "${neonUrl}" -c "DO $$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END $$;"`,
    );
    console.log("━━━ Step 4/4 — Import data into Neon ━━━");
    run(`"${psql}" "${neonUrl}" -v ON_ERROR_STOP=1 -f "${dumpFile}"`);
  }

  console.log("\n✅ Done! Verify:");
  console.log("   npx prisma migrate resolve --applied 20250606150000_meeting_provider_agnostic  (if needed)");
  console.log("   npx prisma studio");
} catch (error) {
  console.error("\n❌ Migration failed.");
  if (String(error).includes("password authentication failed")) {
    console.error(
      "\nLocal PostgreSQL rejected the password. Update LOCAL_DATABASE_URL with your actual postgres password.\n" +
        "Test with: psql \"postgresql://postgres:PASSWORD@localhost:5432/digital_genius_mart\" -c \"\\dt\"",
    );
  }
  process.exit(1);
} finally {
  if (existsSync(dumpFile)) rmSync(dumpFile, { force: true });
}
