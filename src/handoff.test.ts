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

function copyPage(hash: string, clipboard?: { writeText(text: string): Promise<void> }) {
	const listeners = new Map<string, () => void>();
	let onCopy: (() => void) | undefined;
	const copy = {
		textContent: "label",
		hidden: false,
		getAttribute: (key: string) => (key === "data-copied" ? "done" : null),
		addEventListener: (event: string, fn: () => void) => {
			if (event === "click") onCopy = fn;
		},
	};
	const copied = {
		textContent: "",
		getAttribute: (key: string) => (key === "data-text" ? "paste" : null),
	};
	const section = () => ({ hidden: false, querySelector: () => ({ textContent: "heading" }) });
	const elements: Record<string, unknown> = {
		"copy-link": copy,
		copied,
		ready: section(),
		missing: section(),
		invalid: section(),
	};
	const location = {
		hash,
		origin: "https://go.solstone.app",
		pathname: "/j",
		search: "?utm_source=x",
	};
	const document = {
		title: "",
		body: { appendChild: () => undefined },
		getElementById: (id: string) => elements[id],
		querySelector: () => ({ getAttribute: () => "copy" }),
	};
	new Function("window", "document", "location", JOURNAL_SCRIPT)(
		{
			addEventListener: (event: string, fn: () => void) => listeners.set(event, fn),
			navigator: { clipboard },
		},
		document,
		location,
	);
	return {
		copy,
		copied,
		location,
		elements,
		click: () => onCopy?.(),
		event: (n: string) => listeners.get(n)?.(),
	};
}

describe("journal copy handoff in Claude's built-in browser", () => {
	it("copies the canonical link, without any query, and confirms", async () => {
		const written: string[] = [];
		const p = copyPage("#_tok~123456", {
			writeText: async (text) => {
				written.push(text);
			},
		});
		p.click();
		await Promise.resolve();
		await Promise.resolve();
		expect(written).toEqual(["https://go.solstone.app/j#_tok~123456"]);
		expect(p.copy.textContent).toBe("done");
		expect(p.copied.textContent).toBe("paste");
	});

	it("resets the confirmation when a reused pane receives another link", async () => {
		const written: string[] = [];
		const p = copyPage("#_first", {
			writeText: async (text) => {
				written.push(text);
			},
		});
		p.click();
		await Promise.resolve();
		await Promise.resolve();
		p.location.hash = "#_second";
		p.event("hashchange");
		expect(p.copy.textContent).toBe("label");
		expect(p.copied.textContent).toBe("");
		p.click();
		await Promise.resolve();
		expect(written).toEqual([
			"https://go.solstone.app/j#_first",
			"https://go.solstone.app/j#_second",
		]);
	});

	it("copies nothing for a malformed link", () => {
		const written: string[] = [];
		const p = copyPage("#A/B", {
			writeText: async (text) => {
				written.push(text);
			},
		});
		p.click();
		expect(written).toEqual([]);
		expect((p.elements.ready as { hidden: boolean }).hidden).toBe(true);
	});
});

interface FakeStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

function autoOpenPage(
	options: {
		hash?: string;
		target?: string;
		storage?: FakeStorage | "throw" | null;
		navType?: string;
	} = {},
) {
	const { hash = "#_valid", target = "scheme", navType = "navigate" } = options;
	const listeners = new Map<string, () => void>();
	const linkEvents = new Map<string, (event: { preventDefault(): void }) => void>();
	const attrs = new Map<string, string>();
	const assigned: string[] = [];
	const store = new Map<string, string>();
	let onToggle: (() => void) | undefined;

	const defaultStorage: FakeStorage = {
		getItem: (key) => store.get(key) ?? null,
		setItem: (key, value) => {
			store.set(key, value);
		},
		removeItem: (key) => {
			store.delete(key);
		},
	};
	const storageImpl = options.storage === undefined ? defaultStorage : options.storage;

	const link = {
		hidden: false,
		setAttribute: (key: string, value: string) => attrs.set(key, value),
		removeAttribute: (key: string) => attrs.delete(key),
		addEventListener: (event: string, fn: (event: { preventDefault(): void }) => void) =>
			linkEvents.set(event, fn),
	};
	const autoLabel = { hidden: true };
	const autoBox = {
		checked: false,
		addEventListener: (event: string, fn: () => void) => {
			if (event === "change") onToggle = fn;
		},
	};
	const section = () => ({ hidden: false, querySelector: () => ({ textContent: "heading" }) });
	const elements: Record<string, unknown> = {
		"open-app": link,
		"auto-open-label": autoLabel,
		"auto-open": autoBox,
		ready: section(),
		missing: section(),
		invalid: section(),
	};
	const location = {
		hash,
		href: `https://go.solstone.app/j${hash}`,
		assign: (url: string) => {
			assigned.push(url);
		},
	};
	const document = {
		title: "",
		getElementById: (id: string) => elements[id],
		querySelector: () => ({ getAttribute: () => target }),
	};
	const win: Record<string, unknown> = {
		addEventListener: (event: string, fn: () => void) => listeners.set(event, fn),
		performance: {
			getEntriesByType: (kind: string) => (kind === "navigation" ? [{ type: navType }] : []),
		},
	};
	if (storageImpl === "throw") {
		Object.defineProperty(win, "localStorage", {
			get() {
				throw new Error("SecurityError");
			},
		});
	} else if (storageImpl !== null) {
		win.localStorage = storageImpl;
	}

	new Function("window", "document", "location", JOURNAL_SCRIPT)(win, document, location);

	return {
		store,
		assigned,
		autoLabel,
		autoBox,
		location,
		attrs,
		toggle(checked: boolean) {
			autoBox.checked = checked;
			onToggle?.();
		},
		event(name: string) {
			listeners.get(name)?.();
		},
	};
}

describe("journal opt-in auto-open", () => {
	it("stays off by default, reveals the toggle, and only stores '1' when checked", () => {
		const p = autoOpenPage({ hash: "#_tok1~091500" });
		expect(p.autoLabel.hidden).toBe(false);
		expect(p.autoBox.checked).toBe(false);
		expect(p.assigned).toEqual([]);
		expect([...p.store.entries()]).toEqual([]);

		// Checking stores only the boolean flag and does not navigate on toggle.
		p.toggle(true);
		expect([...p.store.entries()]).toEqual([["solstone.journal.auto_open", "1"]]);
		expect(p.assigned).toEqual([]);

		// Unchecking removes the key completely.
		p.toggle(false);
		expect([...p.store.entries()]).toEqual([]);
	});

	it("auto-opens on initial load and on a new hashchange token, never on pageshow or duplicate token", () => {
		const backing = new Map<string, string>([["solstone.journal.auto_open", "1"]]);
		const storage: FakeStorage = {
			getItem: (k) => backing.get(k) ?? null,
			setItem: (k, v) => {
				backing.set(k, v);
			},
			removeItem: (k) => {
				backing.delete(k);
			},
		};
		const p = autoOpenPage({ hash: "#_first~120000", storage });
		expect(p.autoBox.checked).toBe(true);
		expect(p.assigned).toEqual(["solstone://open#_first~120000"]);

		// pageshow (bfcache / back-forward) must never re-trigger auto-open.
		p.event("pageshow");
		expect(p.assigned).toEqual(["solstone://open#_first~120000"]);

		// Same token hashchange must not double-fire.
		p.event("hashchange");
		expect(p.assigned).toEqual(["solstone://open#_first~120000"]);

		// A distinct valid token fires once.
		p.location.hash = "#_second";
		p.event("hashchange");
		expect(p.assigned).toEqual(["solstone://open#_first~120000", "solstone://open#_second"]);

		// Invalid token never fires and clears deduplication state.
		p.location.hash = "#bad/token";
		p.event("hashchange");
		expect(p.assigned).toEqual(["solstone://open#_first~120000", "solstone://open#_second"]);

		// Returning to a valid token after invalid fires again.
		p.location.hash = "#_second";
		p.event("hashchange");
		expect(p.assigned).toEqual([
			"solstone://open#_first~120000",
			"solstone://open#_second",
			"solstone://open#_second",
		]);
	});

	it("skips auto-open on back_forward navigation even without bfcache", () => {
		const backing = new Map<string, string>([["solstone.journal.auto_open", "1"]]);
		const storage: FakeStorage = {
			getItem: (k) => backing.get(k) ?? null,
			setItem: (k, v) => {
				backing.set(k, v);
			},
			removeItem: (k) => {
				backing.delete(k);
			},
		};
		const p = autoOpenPage({ hash: "#_tok1", storage, navType: "back_forward" });
		expect(p.autoBox.checked).toBe(true);
		expect(p.assigned).toEqual([]);
	});

	it("syncs opt-out changes from another tab before firing hashchange or pageshow", () => {
		const backing = new Map<string, string>([["solstone.journal.auto_open", "1"]]);
		const storage: FakeStorage = {
			getItem: (k) => backing.get(k) ?? null,
			setItem: (k, v) => {
				backing.set(k, v);
			},
			removeItem: (k) => {
				backing.delete(k);
			},
		};
		const p = autoOpenPage({ hash: "#_tok1", storage });
		expect(p.assigned).toEqual(["solstone://open#_tok1"]);

		// Another tab unchecks the preference.
		backing.delete("solstone.journal.auto_open");
		p.location.hash = "#_tok2";
		p.event("hashchange");
		expect(p.autoBox.checked).toBe(false);
		expect(p.assigned).toEqual(["solstone://open#_tok1"]);
	});

	it("stays cleanly hidden when localStorage throws or is unavailable", () => {
		const thrown = autoOpenPage({ hash: "#_tok1", storage: "throw" });
		expect(thrown.autoLabel.hidden).toBe(true);
		expect(thrown.assigned).toEqual([]);

		const absent = autoOpenPage({ hash: "#_tok1", storage: null });
		expect(absent.autoLabel.hidden).toBe(true);
		expect(absent.assigned).toEqual([]);
	});

	it("reverts the checkbox cleanly if setItem throws QuotaExceededError", () => {
		const storage: FakeStorage = {
			getItem: () => null,
			setItem: () => {
				throw new Error("QuotaExceededError");
			},
			removeItem: () => undefined,
		};
		const p = autoOpenPage({ hash: "#_tok1", storage });
		expect(p.autoLabel.hidden).toBe(false);
		p.toggle(true);
		expect(p.autoBox.checked).toBe(false);
	});
});
