import { spawnSync } from "node:child_process";

if (process.env.NODE_ENV === "development") {
  console.warn(
    "Ignoring NODE_ENV=development for next build; Next.js sets production mode automatically.",
  );
  delete process.env.NODE_ENV;
}

const command = process.platform === "win32" ? "next.cmd" : "next";
const result = spawnSync(command, ["build"], {
  env: process.env,
  shell: false,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
