import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { loadPortfolioRuntime } from "../src/portfolio-data.js";
import { buildPortfolioFileSystem } from "../src/portfolio-filesystem.js";
import { EXPERIENCE_APPS, experienceContent } from "../src/experience-content.js";

const root = new URL("../", import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), "utf8"));
const files = {
  ko: ["projectDetails", "introduce", "experiences"],
  en: ["eng_projectDetails", "eng_introduce", "eng_experiences"],
};

function mockLoading(t, fail = () => false) {
  const requests = [];
  const storage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => null };
  t.after(() => { if (storage === undefined) delete globalThis.localStorage; else globalThis.localStorage = storage; });
  t.mock.method(globalThis, "fetch", async path => {
    requests.push(path);
    if (fail(path)) return { ok: false, status: 404 };
    const localPath = path.startsWith("/portfolio/") ? `public${path}` : path.slice(1);
    return { ok: true, json: () => json(localPath) };
  });
  return requests;
}

test("both locales, experience references, media and VFS use active content consistently", async t => {
  const requests = mockLoading(t);
  const runtime = await loadPortfolioRuntime();
  assert.equal(requests.some(path => path.includes("legacy")), false);
  const koIds = runtime.datasets.ko.projects.map(project => project.id);
  assert.deepEqual(runtime.datasets.en.projects.map(project => project.id), koIds);
  assert.equal(new Set(koIds).size, 19);
  assert.deepEqual(koIds, [...koIds].sort((a, b) => b - a));
  const fs = buildPortfolioFileSystem(runtime);
  for (const locale of ["ko", "en"]) {
    const data = runtime.datasets[locale];
    assert.deepEqual(JSON.parse(fs[`/mnt/portfolio/${locale}/projects.json`]), await json(`public/portfolio/data/${files[locale][0]}.json`));
    assert.deepEqual(JSON.parse(fs[`/mnt/portfolio/${locale}/experiences.json`]), data.experiences);
    assert.deepEqual(JSON.parse(fs[`/mnt/portfolio/${locale}/introduce.json`]), data.introduce);
    for (const app of EXPERIENCE_APPS) {
      const content = experienceContent({ ...runtime, locale }, app.id);
      assert.ok(content.experience, `Missing experience ${app.id} in ${locale}`);
      assert.equal(content.projects.length, app.projectIds.length);
      for (const media of content.media) {
        assert.ok(app.projectIds.includes(media.projectId));
        await access(new URL(`public${media.src}`, root));
      }
    }
    for (const project of data.projects) {
      for (const media of project.media) await access(new URL(`public${media.src}`, root));
    }
    assert.equal(Object.keys(fs).filter(path => path.startsWith(`/mnt/portfolio/${locale}/projects/`)).length, data.projects.length);
  }
  for (const deck of runtime.presentations) {
    assert.ok(koIds.includes(Number(deck.projectId)));
    await access(new URL(`assets/presentations/${deck.file}`, root));
  }
  assert.ok(fs["/home/kimdongwook/profile.md"].includes("Kim Dong Wook"));
  assert.equal(fs["/home/kimdongwook/Desktop/README.md"], "symlink:/home/kimdongwook/readme.md");
});

test("English and optional resource failures preserve existing fallback behavior", async t => {
  mockLoading(t, path => path.includes("eng_") || !path.startsWith("/portfolio/"));
  const runtime = await loadPortfolioRuntime();
  assert.deepEqual(runtime.datasets.en.projects, runtime.datasets.ko.projects);
  assert.deepEqual(runtime.presentations, []);
  assert.deepEqual(runtime.browserConfig, {});
});

test("required Korean data failures remain fatal", async t => {
  mockLoading(t, path => path.endsWith("/introduce.json"));
  await assert.rejects(loadPortfolioRuntime(), /Failed to load \/portfolio\/data\/introduce.json: 404/);
});
