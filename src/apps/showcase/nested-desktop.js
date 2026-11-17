import React, { useState } from "react";
import { DindbOSDesktop } from "dindbos/react";

const h = React.createElement;

const nestedDesktopOptions = {
  storage: { backend: "memory", name: "dindbos-nested" },
  serviceWorker: false,
  bootstrapPackages: false,
  builtins: { includePortfolio: false },
};

export function NestedDesktop({ apps }) {
  const [failed, setFailed] = useState(false);
  return h("section", {
    "aria-label": "Nested DindbOS session",
    style: { display: "grid", gridTemplateRows: "auto minmax(0, 1fr)", gap: 8, height: "100%" },
  },
  h("p", { style: { margin: 0, color: "var(--muted)", fontSize: 13 } },
    "This session resets when you close the window."),
  failed
    ? h("p", { role: "alert" }, "The desktop could not start. Close the window and reopen it to try again.")
    : h(DindbOSDesktop, {
      ...nestedDesktopOptions,
      apps,
      style: { minHeight: 0 },
      onError: () => setFailed(true),
    }));
}
