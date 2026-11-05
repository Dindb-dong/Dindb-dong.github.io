import { test } from "node:test";
import assert from "node:assert/strict";
import { loadLocale } from "../src/portfolio-data.js";

const cases = [
  ["English URL overrides saved Korean and browser Korean", "?ln=en", "ko-KR", { "dindbos-language": "ko" }, false, "en"],
  ["Korean URL overrides saved English and browser English", "?ln=ko", "en-US", { "dindbos-language": "en" }, false, "ko"],
  ["saved preference overrides browser language", "", "ko-KR", { "dindbos-language": "en", "portfolio-language": "ko" }, false, "en"],
  ["legacy saved preference remains supported", "", "en-US", { "portfolio-language": "ko" }, false, "ko"],
  ["unsupported URL and stored values fall back to browser", "?ln=fr", "ko-KR", { "dindbos-language": "fr" }, false, "ko"],
  ["Korean regional browser language selects Korean", "", "ko-KR", {}, false, "ko"],
  ["English regional browser language selects English", "", "en-GB", {}, false, "en"],
  ["other browser languages fall back to English", "", "ja-JP", {}, false, "en"],
  ["blocked storage falls back to browser language", "", "ko-KR", {}, true, "ko"],
  ["URL selection works even with blocked storage", "?ln=en", "ko-KR", {}, true, "en"],
];

for (const [name, search, language, stored, blocked, expected] of cases) {
  test(name, t => {
    const values = {
      location: { search }, navigator: { language },
      localStorage: { getItem(key) { if (blocked) throw new Error("Storage denied"); return stored[key] ?? null; } },
    };
    for (const [key, value] of Object.entries(values)) {
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
      Object.defineProperty(globalThis, key, { configurable: true, value });
      t.after(() => { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; });
    }
    assert.equal(loadLocale(), expected);
  });
}
