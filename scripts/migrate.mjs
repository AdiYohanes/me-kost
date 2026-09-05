import fs from "fs";
import path from "path";
import pg from "pg";

const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const match = envContent.match(/^DATABASE_URL=(.*)$/m);
if (!match) {
  console.error("DATABASE_URL not found!");
  process.exit(1);
}

const raw = match[1].trim().replace(/^['"]|['"]$/g, "");
const regex = /^postgresql:\/\/([^:]+):\[(.*)\]@(.*?)(?::(\d+))?\/(.*)$/;
const m = raw.match(regex);
const pass = m ? m[2] : "";

const client = new pg.Client({
  user: "postgres.cmivudsxdbnnspptqcfp",
  password: pass,
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log("?? Menghubungkan ke Supabase PostgreSQL via Pooler (Tokyo)...");
  await client.connect();
  console.log("? Berhasil terhubung!");

  const schemaPath = path.resolve(process.cwd(), "supabase/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  console.log("?? Mengeksekusi seluruh skema database (supabase/schema.sql)...");
  await client.query(sql);
  console.log("?? Skema database (tabel, RLS, trigger, bucket) berhasil diterapkan!");

  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );
  console.log("?? Tabel public aktif di database:", res.rows.map((r) => r.table_name).join(", "));

  await client.end();
}

run().catch(async (err) => {
  console.error("? Error migrasi:", err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
