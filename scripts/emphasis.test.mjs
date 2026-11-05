import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderEmphasis } from "../src/utils/emphasis.js";
import { CONTENT_EMPHASIS } from "../src/content-emphasis.js";

const strong = text => `<strong class="portfolio-emphasis">${text}</strong>`;

test("emphasis escapes every segment and treats phrases literally", () => {
  assert.equal(renderEmphasis('<img> CLIP + BLIP2 & "safe"', { bold: ["CLIP + BLIP2"] }), `&lt;img&gt; ${strong("CLIP + BLIP2")} &amp; &quot;safe&quot;`);
  assert.equal(renderEmphasis('<img onerror="bad()">', { mark: ['<img onerror="bad()">'] }), '<strong class="portfolio-emphasis portfolio-highlight">&lt;img onerror=&quot;bad()&quot;&gt;</strong>');
  assert.equal(renderEmphasis("no match & plain", { bold: ["missing"] }), "no match &amp; plain");
  assert.equal(renderEmphasis(null), "");
});

test("emphasis chooses the longest overlapping literal and handles repeats", () => {
  assert.equal(renderEmphasis("AI editor / AI editor", { bold: ["AI", "AI editor"] }), `${strong("AI editor")} / ${strong("AI editor")}`);
  assert.equal(renderEmphasis("80% contribution", { bold: ["80% contribution"], mark: ["80% contribution"] }), '<strong class="portfolio-emphasis portfolio-highlight">80% contribution</strong>');
  assert.equal(renderEmphasis("unchanged", { bold: [""] }), "unchanged");
});

for (const [locale, sections] of Object.entries(CONTENT_EMPHASIS)) {
  const prefix = locale === "ko" ? "" : "eng_";
  for (const [section, filename] of [["projects", "projectDetails.json"], ["experiences", "experiences.json"]]) {
    test(`${locale} ${section} curation covers every entity with source-faithful phrases`, async () => {
      const source = JSON.parse(await readFile(new URL(`../public/portfolio/data/${prefix}${filename}`, import.meta.url), "utf8"));
      const entities = section === "projects" ? Object.entries(source) : source.map(entry => [String(entry.id), entry]);
      assert.deepEqual(Object.keys(sections[section]).sort(), entities.map(([id]) => id).sort());
      for (const [id, entity] of entities) {
        const rules = sections[section][id];
        const content = section === "projects" ? [entity.role, ...entity.description, ...entity.extraDescription] : [entity.position, ...entity.description, ...entity.projects];
        assert.ok(rules.bold.length, `${id} has selected topic/ownership phrases`);
        for (const phrase of [...rules.bold, ...rules.mark || []]) {
          assert.ok(content.some(line => line.includes(phrase)), `${locale} ${section} ${id}: missing literal ${phrase}`);
        }
        const intro = section === "projects" ? entity.description : [entity.description[0]];
        assert.ok(intro.some(line => renderEmphasis(line, rules).includes('<strong class="portfolio-emphasis')), `${id} introduction has emphasis`);
      }
    });
  }
}

test("curation preserves contribution qualifiers and leaves versions/dates unmarked", () => {
  assert.ok(CONTENT_EMPHASIS.ko.projects[19].bold.includes("백엔드 아키텍처 설계에 참여"));
  assert.ok(CONTENT_EMPHASIS.en.projects[19].bold.includes("Contributed to backend architecture design"));
  assert.equal(renderEmphasis("DindbOS 0.2.3 / npm 0.1.1 / 2026.02", CONTENT_EMPHASIS.ko.projects[15]), "DindbOS 0.2.3 / npm 0.1.1 / 2026.02");
});
