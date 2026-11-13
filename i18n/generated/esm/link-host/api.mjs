// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

import { FluentBundle, FluentResource } from "../vendor/fluent-bundle/index.js";
import { CATALOGS } from "./catalogs.mjs";

export function cardinal(val) { return { type: "cardinal", value: val }; }
export function integer(val) { return { type: "integer", value: val }; }

const LOCALES = {
  "en-US": { bundleLocale: "en-US", cardinal: "en" },
};

const CATEGORIES = {
  "en": (n) => (n == 1) ? "one" : "other",
};

const MESSAGES = {
  "link.extro.openextrolinksolpbcorg": {
    resourceKey: "m6c696e6b2e657874726f2e6f70656e657874726f6c696e6b736f6c7062636f7267",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.extro.openextroonyourphone": {
    resourceKey: "m6c696e6b2e657874726f2e6f70656e657874726f6f6e796f757270686f6e65",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.extro.solpbcopensourcethispagecollectsnothing": {
    resourceKey: "m6c696e6b2e657874726f2e736f6c7062636f70656e736f757263657468697370616765636f6c6c656374736e6f7468696e67",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.extro.thislinkwakesupextromobiletosync": {
    resourceKey: "m6c696e6b2e657874726f2e746869736c696e6b77616b65737570657874726f6d6f62696c65746f73796e63",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.host.operatedbysolpbc": {
    resourceKey: "m6c696e6b2e686f73742e6f706572617465646279736f6c706263",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.host.thisissolpbcsuniversalapphandoff": {
    resourceKey: "m6c696e6b2e686f73742e746869736973736f6c70626373756e6976657273616c61707068616e646f6666",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.http.methodnotallowed": {
    resourceKey: "m6c696e6b2e687474702e6d6574686f646e6f74616c6c6f776564",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.http.notfound": {
    resourceKey: "m6c696e6b2e687474702e6e6f74666f756e64",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.applebadge": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e6170706c656261646765",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.attribution": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e6174747269627574696f6e",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.body": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e626f6479",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.copyagain": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e636f7079616761696e",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.fallbackbody": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e66616c6c6261636b626f6479",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.fallbacktitle": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e66616c6c6261636b7469746c65",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.footer": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e666f6f746572",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.googlebadge": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e676f6f676c656261646765",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.installbody": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e696e7374616c6c626f6479",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.installdesktop": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e696e7374616c6c6465736b746f70",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.installtitle": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e696e7374616c6c7469746c65",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.invalid": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e696e76616c6964",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.missing": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e6d697373696e67",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.open": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e6f70656e",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.journal.title": {
    resourceKey: "m6c696e6b2e6a6f75726e616c2e7469746c65",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.donthavethesolstoneapponthis": {
    resourceKey: "m6c696e6b2e706169722e646f6e7468617665746865736f6c73746f6e656170706f6e74686973",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.finishpairinggosolstoneapp": {
    resourceKey: "m6c696e6b2e706169722e66696e69736870616972696e67676f736f6c73746f6e65617070",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.finishpairingyourphonewithyourjournal": {
    resourceKey: "m6c696e6b2e706169722e66696e69736870616972696e67796f757270686f6e6577697468796f75726a6f75726e616c",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.getsolstoneforandroid": {
    resourceKey: "m6c696e6b2e706169722e676574736f6c73746f6e65666f72616e64726f6964",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.getsolstoneforiphone": {
    resourceKey: "m6c696e6b2e706169722e676574736f6c73746f6e65666f726970686f6e65",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.onlinuxyoucanalsosaveitas": {
    resourceKey: "m6c696e6b2e706169722e6f6e6c696e7578796f7563616e616c736f7361766569746173",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.openinthesolstoneapp": {
    resourceKey: "m6c696e6b2e706169722e6f70656e696e746865736f6c73746f6e65617070",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.orpasteitinyourself": {
    resourceKey: "m6c696e6b2e706169722e6f7270617374656974696e796f757273656c66",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.pairadevicegosolstoneapp": {
    resourceKey: "m6c696e6b2e706169722e7061697261646576696365676f736f6c73746f6e65617070",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.pairingaphoneinstead": {
    resourceKey: "m6c696e6b2e706169722e70616972696e676170686f6e65696e7374656164",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.pairthiscomputerwithyourjournal": {
    resourceKey: "m6c696e6b2e706169722e7061697274686973636f6d707574657277697468796f75726a6f75726e616c",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.solpbcopensourcethispagecollectsnothing": {
    resourceKey: "m6c696e6b2e706169722e736f6c7062636f70656e736f757263657468697370616765636f6c6c656374736e6f7468696e67",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.solstoneappinstall": {
    resourceKey: "m6c696e6b2e706169722e736f6c73746f6e65617070696e7374616c6c",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.thislinkworksonceandonlyfora": {
    resourceKey: "m6c696e6b2e706169722e746869736c696e6b776f726b736f6e6365616e646f6e6c79666f7261",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.thispagesaddressisyourpairinglink": {
    resourceKey: "m6c696e6b2e706169722e746869737061676573616464726573736973796f757270616972696e676c696e6b",
    formatIntent: "text",
    arguments: [
    ],
  },
  "link.pair.youopenedapairinglinkbutsolstonemobile": {
    resourceKey: "m6c696e6b2e706169722e796f756f70656e65646170616972696e676c696e6b627574736f6c73746f6e656d6f62696c65",
    formatIntent: "text",
    arguments: [
    ],
  },
};

const BUNDLES = new Map();

function getBundle(locale, useIsolating) {
  const cacheKey = `${locale}:${useIsolating}`;
  let bundle = BUNDLES.get(cacheKey);
  if (!bundle) {
    const locInfo = LOCALES[locale];
    if (!locInfo) throw new Error(`Unknown locale: ${locale}`);
    const ftlSource = CATALOGS[locale];
    if (ftlSource === undefined) throw new Error(`Unknown catalog: ${locale}`);
    const resource = new FluentResource(ftlSource);
    bundle = new FluentBundle(locInfo.bundleLocale, { useIsolating });
    const errors = bundle.addResource(resource);
    if (errors.length > 0) throw new Error(`FTL errors: ${errors.join(", ")}`);
    BUNDLES.set(cacheKey, bundle);
  }
  return bundle;
}

export function render(locale, messageId, args = [], { useIsolating = true } = {}) {
  if (typeof useIsolating !== "boolean") throw new Error("Expected boolean useIsolating");
  const locInfo = LOCALES[locale];
  if (!locInfo) throw new Error(`Unknown locale: ${locale}`);

  const msgInfo = MESSAGES[messageId];
  if (!msgInfo) throw new Error(`Unknown message: ${messageId}`);

  const seen = new Set();
  for (const [k] of args) {
    if (seen.has(k)) throw new Error(`Duplicate argument: ${k}`);
    seen.add(k);
  }

  const declaredMap = new Map(msgInfo.arguments.map(a => [a.name, a]));
  for (const [k] of args) {
    if (!declaredMap.has(k)) throw new Error(`Unknown argument: ${k}`);
  }
  for (const k of declaredMap.keys()) {
    if (!seen.has(k)) throw new Error(`Missing argument: ${k}`);
  }

  const fArgs = {};
  let selectedVariant = msgInfo.enumDefault || null;

  for (const [k, v] of args) {
    const spec = declaredMap.get(k);
    if (spec.type === "string") {
      if (typeof v !== "string") throw new Error(`Expected string for ${k}`);
      if (msgInfo.formatIntent === "enum" && msgInfo.selectorVar === k) {
        if (msgInfo.enumValues.includes(v)) {
          selectedVariant = v;
        } else {
          selectedVariant = msgInfo.enumDefault;
        }
      }
      fArgs[k] = v;
    } else if (spec.type === "boolean") {
      if (typeof v !== "boolean") throw new Error(`Expected boolean for ${k}`);
      fArgs[k] = v ? "true" : "false";
    } else if (spec.type === "integer") {
      if (v && typeof v === "object" && v.type === "cardinal") throw new Error(`Expected integer, got cardinal for ${k}`);
      const num = (v && typeof v === "object" && v.type === "integer") ? v.value : v;
      if (typeof num !== "number" && typeof num !== "bigint") throw new Error(`Expected number for ${k}`);
      if (typeof num === "number" && (!Number.isFinite(num) || !Number.isInteger(num))) throw new Error(`Expected integer number for ${k}`);
      const nVal = BigInt(num);
      const minVal = spec.min !== null ? BigInt(spec.min) : -9007199254740991n;
      const maxVal = spec.max !== null ? BigInt(spec.max) : 9007199254740991n;
      const effMin = minVal < -9007199254740991n ? -9007199254740991n : minVal;
      const effMax = maxVal > 9007199254740991n ? 9007199254740991n : maxVal;
      if (nVal < effMin || nVal > effMax) throw new Error(`Out of range for ${k}`);
      fArgs[k] = Number(nVal);
    } else if (spec.type === "cardinal") {
      if (v && typeof v === "object" && v.type === "integer") throw new Error(`Expected cardinal, got integer for ${k}`);
      const num = (v && typeof v === "object" && v.type === "cardinal") ? v.value : v;
      if (typeof num !== "number" && typeof num !== "bigint") throw new Error(`Expected number for ${k}`);
      if (typeof num === "number" && (!Number.isFinite(num) || !Number.isInteger(num))) throw new Error(`Expected integer number for ${k}`);
      const nVal = BigInt(num);
      const minVal = spec.min !== null ? BigInt(spec.min) : -2147483648n;
      const maxVal = spec.max !== null ? BigInt(spec.max) : 2147483647n;
      const effMin = minVal < -2147483648n ? -2147483648n : minVal;
      const effMax = maxVal > 2147483647n ? 2147483647n : maxVal;
      if (nVal < effMin || nVal > effMax) throw new Error(`Out of range for ${k}`);
      fArgs[k] = Number(nVal);
    }
  }

  if (msgInfo.formatIntent === "cardinal") {
    const select = CATEGORIES[locInfo.cardinal];
    fArgs.i18nCategory = select ? select(Math.abs(fArgs[msgInfo.selectorVar])) : "other";
  }

  const bundle = getBundle(locale, useIsolating);

  const targetKey = msgInfo.formatIntent === "enum" ? (msgInfo.variantKeys[selectedVariant] || msgInfo.defaultKey) : msgInfo.resourceKey;
  const message = bundle.getMessage(targetKey);
  if (!message || !message.value) throw new Error(`Message not found: ${targetKey}`);

  const formatErrors = [];
  const output = bundle.formatPattern(message.value, fArgs, formatErrors);
  if (formatErrors.length > 0) throw new Error(`Format error: ${formatErrors.join(", ")}`);
  return output;
}
