const escape = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

export function renderDropdown({ id, label, value, options, placeholder = label }) {
  const current = options.find(option => option.value === value);
  return `<div class="app-dropdown" data-dropdown>
    <button type="button" class="app-dropdown-trigger" data-dropdown-trigger aria-label="${escape(label)}" ${options.length ? "" : "disabled"} aria-haspopup="listbox" aria-expanded="false" aria-controls="${escape(id)}">
      <span>${escape(current?.label || placeholder)}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div id="${escape(id)}" class="app-dropdown-menu" data-dropdown-menu role="listbox" aria-label="${escape(label)}" popover="auto">
      ${options.map(option => `<button type="button" class="app-dropdown-option" role="option" aria-selected="${option.value === value}" data-dropdown-value="${escape(option.value)}" tabindex="-1">${option.icon ? `<img src="${escape(option.icon)}" alt="">` : ""}<span>${escape(option.label)}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></button>`).join("")}
    </div>
  </div>`;
}

export function mountDropdown(root, onSelect) {
  const trigger = root.querySelector("[data-dropdown-trigger]");
  const menu = root.querySelector("[data-dropdown-menu]");
  const options = [...menu.querySelectorAll("[role=option]")];
  const lifetime = new AbortController();
  const listen = { signal: lifetime.signal };
  let positioning;
  const opened = () => menu.matches(":popover-open");
  const position = () => {
    const rect = trigger.getBoundingClientRect();
    const above = rect.top - 16;
    const below = innerHeight - rect.bottom - 16;
    const upwards = above >= 320 || above > below;
    const width = Math.min(Math.max(rect.width, 224), innerWidth - 24);
    menu.style.width = `${width}px`;
    menu.style.maxHeight = `${Math.max(96, Math.min(320, upwards ? above : below))}px`;
    menu.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - width - 12))}px`;
    menu.style.top = `${upwards ? Math.max(12, rect.top - menu.offsetHeight - 8) : rect.bottom + 8}px`;
  };
  const close = (restoreFocus = false) => {
    if (opened()) menu.hidePopover();
    trigger.setAttribute("aria-expanded", "false");
    positioning?.abort();
    if (restoreFocus) trigger.focus({ preventScroll: true });
  };
  const open = (index = options.findIndex(option => option.getAttribute("aria-selected") === "true")) => {
    if (!options.length) return;
    if (!opened()) {
      menu.showPopover();
      trigger.setAttribute("aria-expanded", "true");
      positioning = new AbortController();
      window.addEventListener("resize", position, { signal: positioning.signal });
      document.addEventListener("scroll", position, { capture: true, signal: positioning.signal });
    }
    position();
    options[Math.max(0, index)].focus({ preventScroll: true });
    options[Math.max(0, index)].scrollIntoView({ block: "nearest" });
  };
  trigger.addEventListener("click", () => opened() ? close(true) : open(), listen);
  trigger.addEventListener("keydown", event => {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      open(event.key === "Home" ? 0 : event.key === "End" || event.key === "ArrowUp" ? options.length - 1 : undefined);
    }
  }, listen);
  menu.addEventListener("keydown", event => {
    const index = options.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options[next].focus({ preventScroll: true });
      options[next].scrollIntoView({ block: "nearest" });
    } else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "Tab") close(true);
  }, listen);
  menu.addEventListener("toggle", () => {
    trigger.setAttribute("aria-expanded", String(opened()));
    if (!opened()) positioning?.abort();
  }, listen);
  options.forEach(option => option.addEventListener("click", () => {
    close(true);
    onSelect(option.dataset.dropdownValue);
  }, listen));
  return () => { close(); lifetime.abort(); };
}
