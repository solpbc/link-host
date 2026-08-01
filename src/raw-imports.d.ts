// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

declare module "*.toml?raw" {
	const source: string;
	export default source;
}
