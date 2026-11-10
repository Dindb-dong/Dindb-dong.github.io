import { test } from "node:test";
import assert from "node:assert/strict";
import { portfolioUIOptions } from "../src/ui-options.js";

test("normal portfolio visitors use automatic SDK selection", () => {
  assert.deepEqual(portfolioUIOptions(), { style: "auto" });
  assert.deepEqual(portfolioUIOptions("?ln=ko&device=unknown&style=constructor&mobileStyle=auto"), { style: "auto" });
});

test("device previews retain automatic selection for each recognized visitor", () => {
  for (const device of ["macos", "windows", "ios", "android", "other"]) {
    assert.deepEqual(portfolioUIOptions(`?device=${device}`), { style: "auto", visitorOS: device });
  }
});

test("explicit styles and mobile overrides pass independently to the SDK", () => {
  for (const style of ["auto", "macos", "windows", "ios", "android"]) {
    assert.deepEqual(portfolioUIOptions(`?device=ios&style=${style}&mobileStyle=android&ln=en`), {
      style, visitorOS: "ios", mobileStyle: "android",
    });
  }
  assert.deepEqual(portfolioUIOptions("?device=__proto__&style=invalid&mobileStyle=ios"), { style: "auto", mobileStyle: "ios" });
});
