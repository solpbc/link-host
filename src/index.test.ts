// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

import { describe, expect, it } from "vitest";
import { EXTRO_AASA, SOLSTONE_AASA } from "./aasa";
import worker from "./index";

const HTML_CSP =
	"default-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

const get = (url: string, init?: RequestInit) => worker.fetch(new Request(url, init));

describe("link-host Worker", () => {
	it("serves the solstone AASA only on go.solstone.app", async () => {
		const res = await get("https://go.solstone.app/.well-known/apple-app-site-association");
		const body = (await res.json()) as {
			applinks: { details: { appIDs: string[]; components: { "/": string }[] }[] };
			webcredentials?: { apps: string[] };
		};
		const solstoneAppId = SOLSTONE_AASA.applinks.details[0].appIDs[0];
		const extroAppId = EXTRO_AASA.applinks.details[0].appIDs[0];

		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("application/json");
		expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
		expect(body.applinks.details[0].appIDs).toEqual([solstoneAppId]);
		expect(body.applinks.details[0].components).toEqual([{ "/": "/p" }, { "/": "/p2" }]);
		expect(body.webcredentials?.apps).toEqual([solstoneAppId]);
		expect(JSON.stringify(body)).not.toContain(extroAppId);
	});

	it("serves the extro AASA only on link.solpbc.org", async () => {
		const res = await get("https://link.solpbc.org/.well-known/apple-app-site-association");
		const body = (await res.json()) as {
			applinks: { details: { appIDs: string[]; components: { "/": string }[] }[] };
			webcredentials?: { apps: string[] };
		};
		const solstoneAppId = SOLSTONE_AASA.applinks.details[0].appIDs[0];
		const extroAppId = EXTRO_AASA.applinks.details[0].appIDs[0];

		expect(res.status).toBe(200);
		expect(body.applinks.details[0].appIDs).toEqual([extroAppId]);
		expect(body.applinks.details[0].components).toEqual([{ "/": "/x/sync" }]);
		expect(body).not.toHaveProperty("webcredentials");
		expect(JSON.stringify(body)).not.toContain(solstoneAppId);
	});

	it("serves the solstone landing page on go.solstone.app", async () => {
		const res = await get("https://go.solstone.app/p");

		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
		expect(res.headers.get("Content-Security-Policy")).toBe(HTML_CSP);
	});

	it("serves solstone assetlinks only on go.solstone.app", async () => {
		const res = await get("https://go.solstone.app/.well-known/assetlinks.json");
		const body = await res.text();

		expect(res.status).toBe(200);
		expect(body).toContain("app.solstone.android");
	});

	it("does not serve the solstone landing page on link.solpbc.org", async () => {
		const res = await get("https://link.solpbc.org/p");

		expect(res.status).toBe(404);
	});

	it("serves the extro sync landing page on link.solpbc.org", async () => {
		const res = await get("https://link.solpbc.org/x/sync");

		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
	});

	it("does not serve host-specific verification or fallback routes on the wrong host", async () => {
		const linkAssetlinks = await get("https://link.solpbc.org/.well-known/assetlinks.json");
		const goExtroSync = await get("https://go.solstone.app/x/sync");

		expect(linkAssetlinks.status).toBe(404);
		expect(goExtroSync.status).toBe(404);
	});

	it("renders the bare host page from the requested hostname", async () => {
		const goRes = await get("https://go.solstone.app/");
		const goBody = await goRes.text();
		const linkRes = await get("https://link.solpbc.org/");
		const linkBody = await linkRes.text();

		expect(goRes.status).toBe(200);
		expect(goBody).toContain("<h1>go.solstone.app</h1>");
		expect(goBody).toContain("<title>go.solstone.app</title>");
		expect(linkRes.status).toBe(200);
		expect(linkBody).toContain("link.solpbc.org");
	});

	it("serves shared robots.txt", async () => {
		const res = await get("https://go.solstone.app/robots.txt");
		const body = await res.text();

		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toContain("text/plain");
		expect(body).toContain("Disallow: /p");
	});

	it("rejects non-GET methods with Allow", async () => {
		const res = await get("https://go.solstone.app/p", { method: "POST" });

		expect(res.status).toBe(405);
		expect(res.headers.get("Allow")).toBe("GET, HEAD");
	});

	it("returns 404 for unknown routes", async () => {
		const res = await get("https://go.solstone.app/nope");

		expect(res.status).toBe(404);
	});
});
