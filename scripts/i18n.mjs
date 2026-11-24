// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeSnapshot } from "./catalog-snapshot.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const compiler = process.env.I18N_COMPILER;
if (!compiler) {
  throw new Error("Set I18N_COMPILER to the pinned i18n-catalog binary; see i18n/README.md");
}
const args = process.argv.slice(2);
let channel = "production";
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--channel" && i + 1 < args.length) {
    channel = args[i + 1];
    i += 1;
  } else {
    throw new Error(`Unknown argument: ${args[i]}`);
  }
}
if (channel !== "production" && channel !== "development") {
  throw new Error(`Unsupported channel: ${channel}`);
}
const extra = channel === "development" ? ["--fallback-stale"] : [];
execFileSync(
  compiler,
  [
    "targets",
    path.join(root, "i18n/catalog"),
    "--channel",
    channel,
    ...extra,
    "--target",
    "esm",
    "--out",
    path.join(root, "i18n/generated"),
  ],
  { stdio: "inherit" },
);
if (channel === "production") {
  writeSnapshot(root);
}
