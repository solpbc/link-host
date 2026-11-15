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
execFileSync(
  compiler,
  [
    "targets",
    path.join(root, "i18n/catalog"),
    "--channel",
    "production",
    "--target",
    "esm",
    "--out",
    path.join(root, "i18n/generated"),
  ],
  { stdio: "inherit" },
);
writeSnapshot(root);
