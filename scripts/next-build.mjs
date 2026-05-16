import { spawnSync } from "node:child_process";

if (process.env.NODE_ENV === "development") {
  console.warn(
    "Overriding NODE_ENV=development for next build; production builds must run in production mode.",
  );
}

process.env.NODE_ENV = "production";

const command = process.platform === "win32" ? "next.cmd" : "next";
const result = spawnSync(command, ["build"], {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
