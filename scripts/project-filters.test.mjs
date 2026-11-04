import { test } from "node:test";
import assert from "node:assert/strict";
import { filteredProjects } from "../src/project-filters.js";

test("project sorting and combined search/category/tag filters preserve source data", () => {
  const projects = [
    { id: 1, title: "Beta", role: "Engineer", categories: ["Web"], languages: ["TypeScript"], techStacks: ["React"], description: [] },
    { id: 3, title: "Alpha", role: "Researcher", categories: ["AI", "Web"], languages: ["Python"], techStacks: ["React"], description: ["Vision"] },
    { id: 2, title: "Gamma", role: "Engineer", categories: ["Mobile"], languages: ["TypeScript"], techStacks: ["Flutter"], description: [] },
  ];
  const ids = options => filteredProjects(projects, { type: "all" }, "", options).map(project => project.id);
  assert.deepEqual(ids({}), [3, 2, 1]);
  assert.deepEqual(ids({ sort: "oldest" }), [1, 2, 3]);
  assert.deepEqual(ids({ sort: "title" }), [3, 1, 2]);
  assert.deepEqual(ids({ categories: ["Web", "Mobile"], tags: ["TypeScript", "React"] }), [1]);
  assert.deepEqual(filteredProjects(projects, null, "VISION", { tags: ["React"] }).map(project => project.id), [3]);
  assert.deepEqual(filteredProjects(projects, { type: "tech", value: "Flutter" }).map(project => project.id), [2]);
  assert.deepEqual(ids({ categories: ["AI"], tags: ["Flutter"] }), []);
  assert.deepEqual(projects.map(project => project.id), [1, 3, 2]);
});
