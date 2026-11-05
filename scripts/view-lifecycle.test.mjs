import { test } from "node:test";
import assert from "node:assert/strict";
import { mountView, updateView, refreshViews } from "../src/view-lifecycle.js";

test("rerenders replace disposers and navigation owns only the content being replaced", () => {
  const runtime = { views: new Map() };
  const project = { isConnected: true };
  const resume = { isConnected: true };
  const events = [];
  let generation = 0;
  const render = name => () => {
    const id = ++generation;
    events.push(`render ${name} ${id}`);
    return () => events.push(`dispose ${name} ${id}`);
  };
  const closeProject = mountView(runtime, "portfolio", project, render("projects"));
  const closeResume = mountView(runtime, "resume", resume, render("resume"));
  updateView(runtime, resume);
  assert.deepEqual(events, ["render projects 1", "render resume 2", "dispose resume 2", "render resume 3"]);
  updateView(runtime, project, render("about"));
  assert.deepEqual(events.slice(-2), ["dispose projects 1", "render about 4"]);
  refreshViews(runtime);
  assert.deepEqual(events.slice(-4), ["dispose about 4", "render about 5", "dispose resume 3", "render resume 6"]);
  closeProject();
  closeProject();
  closeResume();
  assert.deepEqual(events.slice(-2), ["dispose about 5", "dispose resume 6"]);
  assert.equal(runtime.views.size, 0);
});

test("a stale close callback cannot dispose a reopened view; detached views do not refresh", () => {
  const runtime = { views: new Map() };
  let disposed = 0;
  let rendered = 0;
  const render = () => { rendered++; return () => disposed++; };
  const staleClose = mountView(runtime, "portfolio", { isConnected: true }, render);
  const currentClose = mountView(runtime, "portfolio", { isConnected: false }, render);
  staleClose();
  refreshViews(runtime);
  assert.equal(rendered, 2);
  assert.equal(disposed, 1);
  currentClose();
  assert.equal(disposed, 2);
});
