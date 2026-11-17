import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { DoomGame } from "./showcase/doom.js";
import { NestedDesktop } from "./showcase/nested-desktop.js";

const doom = {
  id: "doom",
  name: "Doom",
  icon: new URL("./showcase/doom.svg", import.meta.url).href,
  desktop: true,
  singleton: true,
  width: 650,
  height: 520,
  render: ({ content }) => mount(content, DoomGame),
};

export const showcaseApps = [doom, {
  id: "nested-desktop",
  name: "Nested DindbOS",
  icon: new URL("./showcase/nested-desktop.svg", import.meta.url).href,
  desktop: true,
  singleton: true,
  width: 960,
  height: 680,
  render: ({ content }) => mount(content, NestedDesktop, { apps: [doom] }),
}];

function mount(content, View, props) {
  const root = createRoot(content);
  root.render(createElement(View, props));
  return () => root.unmount();
}
