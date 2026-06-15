// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// `/` — bare host page. Renders when someone types one of this Worker's
// hostnames into a browser directly. Structural, not promotional. CMO-owned
// copy slots. Strict CSP; no analytics, no cookies, no third-party scripts.

const BODY =
	"this is sol pbc's universal app handoff host. it bridges native-mobile flows for solstone and other sol pbc products without ever seeing your data — every payload rides in the URL fragment, which never reaches this server. open source at github.com/solpbc/link-host.";

const REPO_URL = "https://github.com/solpbc/link-host";
const SOLPBC_URL = "https://solpbc.org";

export function renderIndex(host: string): string {
	// Linkify the github reference inline; leave the rest of the body as
	// plain text. We deliberately keep this page minimal — it exists for
	// people who type the bare hostname, not for marketing.
	const linkedBody = BODY.replace(
		"github.com/solpbc/link-host",
		`<a href="${REPO_URL}">github.com/solpbc/link-host</a>`,
	);
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${host}</title>
	<style>
		:root {
			--bg: #fbfaf6;
			--fg: #1a1a1a;
			--muted: #5a5a5a;
			--accent: #1a1a1a;
		}
		@media (prefers-color-scheme: dark) {
			:root {
				--bg: #1a1a1a;
				--fg: #fbfaf6;
				--muted: #a0a0a0;
				--accent: #fbfaf6;
			}
		}
		* { box-sizing: border-box; }
		html, body { margin: 0; padding: 0; }
		body {
			background: var(--bg);
			color: var(--fg);
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
			line-height: 1.5;
			-webkit-font-smoothing: antialiased;
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 2rem 1.25rem;
		}
		main {
			max-width: 32rem;
			width: 100%;
		}
		h1 {
			font-size: 1.5rem;
			margin: 0 0 1rem;
			font-weight: 600;
			letter-spacing: -0.01em;
		}
		p {
			color: var(--muted);
			margin: 0 0 1rem;
			font-size: 1rem;
		}
		a { color: var(--accent); text-decoration: underline; text-underline-offset: 0.2em; }
		footer {
			margin-top: 2rem;
			color: var(--muted);
			font-size: 0.8125rem;
		}
	</style>
</head>
<body>
	<main>
		<h1>${host}</h1>
		<p>${linkedBody}</p>
		<footer>operated by <a href="${SOLPBC_URL}">sol pbc</a>.</footer>
	</main>
</body>
</html>
`;
}
