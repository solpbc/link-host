// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// Structurally mirrors src/landing.ts. When that file's scaffold changes (CSS, semantic HTML, CSP-relevant inline content), audit this file for parity.

const SUB = "this link wakes up extro-mobile to sync a file you shared.";
const FOOTER = "sol pbc | open source | this page collects nothing.";

export function renderExtroSync(): string {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>open extro - link.solpbc.org</title>
	<meta name="robots" content="noindex, nofollow">
	<style>
		:root { --bg: #fbfaf6; --fg: #1a1a1a; --muted: #5a5a5a; }
		@media (prefers-color-scheme: dark) {
			:root { --bg: #1a1a1a; --fg: #fbfaf6; --muted: #a0a0a0; }
		}
		* { box-sizing: border-box; }
		html, body { margin: 0; padding: 0; }
		body {
			background: var(--bg);
			color: var(--fg);
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
			line-height: 1.45;
			-webkit-font-smoothing: antialiased;
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 2rem 1.25rem;
		}
		main { max-width: 28rem; width: 100%; text-align: center; }
		h1 { font-size: 1.5rem; line-height: 1.25; margin: 0 0 0.875rem; font-weight: 600; letter-spacing: -0.01em; }
		p.sub { color: var(--muted); margin: 0 0 2rem; font-size: 1rem; }
		footer { margin-top: 2.5rem; color: var(--muted); font-size: 0.8125rem; }
	</style>
</head>
<body>
	<main>
		<h1>open extro on your phone</h1>
		<p class="sub">${SUB}</p>
		<footer>${FOOTER}</footer>
	</main>
</body>
</html>
`;
}
