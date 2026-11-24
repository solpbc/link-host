// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

declare module "*/i18n/generated/esm/link-host/api.mjs" {
	export function render(
		locale: string,
		messageId: string,
		args?: readonly (readonly [string, unknown])[],
	): string;
}

declare module "*/i18n/generated/esm/link-host/catalogs.mjs" {
	export const CATALOGS: Record<string, string>;
}
