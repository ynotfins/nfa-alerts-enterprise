import { spawnSync } from "node:child_process";

if (process.env.NODE_ENV === "development") {
  console.warn(
    "Overriding NODE_ENV=development for next start; production server mode is required.",
  );
}

const command = process.platform === "win32" ? "next.cmd" : "next";
const result = spawnSync(command, ["start"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
  },
  shell: false,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
