import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, escapeAttr } from "../src/utils/html.js";
import { unique, firstText } from "../src/utils/values.js";

test("shared escaping handles HTML, quoted attributes, null, and double escaping", () => {
  assert.equal(escapeHtml(`<>&"'`), "&lt;&gt;&amp;&quot;&#039;");
  assert.equal(escapeAttr('`" onfocus="x'), "&#096;&quot; onfocus=&quot;x");
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
  assert.equal(escapeHtml(0), "0");
  assert.equal(escapeHtml("&lt;"), "&amp;lt;");
});

test("shared value helpers preserve ordering and text selection contracts", () => {
  const values = ["React", "Python", "React", "", null];
  assert.deepEqual(unique(values), ["Python", "React"]);
  assert.deepEqual(values, ["React", "Python", "React", "", null]);
  assert.equal(firstText([null, "", "First", "Second"]), "First");
  assert.equal(firstText(null), "");
  assert.equal(firstText("Text"), "Text");
});
