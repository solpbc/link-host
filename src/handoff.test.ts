// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

import { describe, expect, it } from "vitest";
import { JOURNAL_SCRIPT } from "./journal";
import { DESKTOP_SCRIPT } from "./landing";

function page(script: string, target = "scheme", hash = "") {
	const listeners = new Map<string, () => void>();
	const events = new Map<string, (event: { preventDefault(): void }) => void>();
	const attrs = new Map<string, string>();
	const link = {
		hidden: false,
		setAttribute: (key: string, value: string) => attrs.set(key, value),
		removeAttribute: (key: string) => attrs.delete(key),
		addEventListener: (event: string, fn: (event: { preventDefault(): void }) => void) =>
			events.set(event, fn),
	};
	const section = () => ({ hidden: false, querySelector: () => ({ textContent: "heading" }) });
	const elements: Record<string, unknown> = {
		"open-app": link,
		"open-app-block": section(),
		ready: section(),
		missing: section(),
		invalid: section(),
	};
	const location = { hash };
	const document = {
		title: "",
		getElementById: (id: string) => elements[id],
		querySelector: () => ({ getAttribute: () => target }),
	};
	new Function("window", "document", "location", script)(
		{ addEventListener: (event: string, fn: () => void) => listeners.set(event, fn) },
		document,
		location,
	);
	return {
		location,
		attrs,
		link,
		event(name: string) {
			const fn = listeners.get(name);
			expect(fn).toBeDefined();
			fn?.();
		},
		activate(name = "click") {
			let prevented = false;
			events.get(name)?.({
				preventDefault: () => {
					prevented = true;
				},
			});
			return prevented;
		},
	};
}

describe.each([
	["pair", DESKTOP_SCRIPT, "solstone://pair"],
	["journal", JOURNAL_SCRIPT, "solstone://open"],
])("%s handoff", (_name, script, prefix) => {
	it("refreshes a reused pane at every lifecycle event and at activation", () => {
		const p = page(script, "scheme", "#_first");
		expect(p.attrs.get("href")).toBe(`${prefix}#_first`);
		for (const event of ["hashchange", "pageshow"]) {
			p.location.hash = `#_${event}`;
			p.event(event);
			expect(p.attrs.get("href")).toBe(`${prefix}#_${event}`);
		}
		for (const event of ["click", "auxclick", "contextmenu"]) {
			p.location.hash = `#_${event}`;
			p.activate(event);
			expect(p.attrs.get("href")).toBe(`${prefix}#_${event}`);
		}
	});

	it("can acquire and lose a fragment without keeping the previous destination", () => {
		const p = page(script);
		expect(p.attrs.has("href")).toBe(false);
		p.location.hash = "#_next";
		p.event("hashchange");
		expect(p.attrs.get("href")).toBe(`${prefix}#_next`);
		p.location.hash = "";
		expect(p.activate()).toBe(true);
		expect(p.attrs.has("href")).toBe(false);
	});
});

describe("journal token boundary", () => {
	it.each([
		"#",
		"#A%2FB",
		"#A~12345",
		"#A~1234567",
		"#A~12x456",
		"#A/B",
		"#A#B",
		`#${"A".repeat(513)}`,
	])("removes the destination for malformed input %s", (hash) => {
		const p = page(JOURNAL_SCRIPT, "scheme", "#_valid");
		p.location.hash = hash;
		p.event("pageshow");
		expect(p.attrs.has("href")).toBe(false);
		expect(p.link.hidden).toBe(true);
	});
	it("preserves the complete maximum-length token and moment in the Android intent", () => {
		const token = `${"_Ab-09".repeat(85)}AZ~235959`;
		const p = page(JOURNAL_SCRIPT, "android", `#${token}`);
		expect(p.attrs.get("href")).toBe(
			`intent://go.solstone.app/j#${token}#Intent;scheme=https;package=app.solstone.observer.phone;end`,
		);
	});
	it("offers no app destination on an unsupported platform", () => {
		expect(page(JOURNAL_SCRIPT, "", "#_valid").attrs.has("href")).toBe(false);
	});
});
