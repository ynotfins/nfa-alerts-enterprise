import { spawn } from "node:child_process";

if (process.env.NODE_ENV === "development") {
  console.warn(
    "Overriding NODE_ENV=development for next start; production server mode is required.",
  );
}

const command = process.platform === "win32" ? "next.cmd" : "next";
const child = spawn(command, ["start"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
  },
  shell: false,
  stdio: "inherit",
});

let shuttingDown = false;

function forwardSignal(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  child.kill(signal);
}

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

process.on("exit", () => {
  if (!child.killed) {
    child.kill("SIGTERM");
  }
});

const signalExitCodes = {
  SIGINT: 130,
  SIGTERM: 143,
};

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(signalExitCodes[signal] ?? 1);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
