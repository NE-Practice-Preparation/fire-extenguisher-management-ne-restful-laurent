import { spawnSync } from "node:child_process"

// prisma generate validates env("DATABASE_URL") but does not connect.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/postgres"
}

const result = spawnSync("prisma", ["generate"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
})

process.exit(result.status ?? 1)
