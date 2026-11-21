import assert from "node:assert/strict";
import { test } from "node:test";
import { visibleTimeBetween } from "../src/analytics.js";

test("counts only foreground overlap inside the tracked content interval", () => {
  const entries = [
    { name: "hidden", startTime: 0 },
    { name: "visible", startTime: 100 },
    { name: "hidden", startTime: 300 },
    { name: "visible", startTime: 800 },
  ];
  assert.equal(visibleTimeBetween(entries, 200, 1000, true), 300);
  assert.equal(visibleTimeBetween(entries, 400, 750, false), 0);
});

test("falls back to the previous visibility when timeline entries are unavailable", () => {
  assert.equal(visibleTimeBetween([], 100, 900, false), 0);
  assert.equal(visibleTimeBetween([], 100, 900, true), 800);
});
