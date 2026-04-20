(() => {
  const LEGACY_BASE = "legacy/public";
  const DEFAULT_LOCAL_BROWSER_WS = "ws://127.0.0.1:8787/browser";
  const REMOTE_BROWSER_STORAGE_KEY = "dindbos-remote-browser-ws";
  const MEDIA = {
    1: ["proj_1_1.mp4", "proj_1_2.png"],
    2: ["proj_2_1.png", "proj_2_2.png", "proj_2_3.png"],
    3: ["proj_3_1.png", "proj_3_2.png"],
    4: ["proj_4_1.png", "proj_4_2.png"],
    5: ["proj_5_1.png", "proj_5_2.png"],
    6: ["proj_6_1.mov", "proj_6_2.png"],
    7: ["proj_7_1.png", "proj_7_2.png", "proj_7_3.png"],
    8: ["proj_8_1.png", "proj_8_2.png", "proj_8_3.png"],
    9: ["proj_9_1.png", "proj_9_2.png", "proj_9_3.png"],
    10: ["proj_10_1.jpg", "proj_10_2.jpg", "proj_10_3.jpg"],
    11: ["proj_11_1.png", "proj_11_2.png", "proj_11_3.png"],
    12: ["proj_12_1.png"],
    13: ["proj_13_1.png"],
  };

  const state = {
    projects: [],
    introduce: null,
    experiences: [],
    presentations: [],
    remoteBrowserEndpoint: "",
    remoteBrowserHealthUrl: "",
    windows: new Map(),
    activeWindow: null,
    z: 20,
    filter: "All",
    iconPositions: loadIconPositions(),
  };

  const desktop = document.querySelector("#desktop");
  const windowLayer = document.querySelector("#windowLayer");
  const taskStrip = document.querySelector("#taskStrip");
  const contextMenu = document.querySelector("#contextMenu");
  const clock = document.querySelector("#clock");
  const systemStatus = document.querySelector("#systemStatus");
  const bootScreen = document.querySelector("#bootScreen");

  init();

  async function init() {
    bindGlobalEvents();
    tickClock();
    window.setInterval(tickClock, 1000);

    try {
      await mountLegacyData();
      prewarmRemoteBrowser();
      systemStatus.textContent = `${state.projects.length} projects mounted`;
      renderDesktop();
      openWindow("welcome", {
        title: "Welcome - DindbOS",
        width: 720,
        height: 430,
        x: 310,
        y: 118,
        content: renderWelcome,
      });
    } catch (error) {
      systemStatus.textContent = "Legacy mount failed";
      renderError(error);
    } finally {
      window.setTimeout(() => bootScreen.classList.add("is-hidden"), 400);
    }
  }

  async function mountLegacyData() {
    const [projects, introduce, experiences, presentations, browserConfig] = await Promise.all([
      fetchJson(`${LEGACY_BASE}/projectDetails.json`),
      fetchJson(`${LEGACY_BASE}/introduce.json`),
      fetchJson(`${LEGACY_BASE}/experiences.json`),
      fetchJson("assets/presentations/manifest.json").catch(() => []),
      fetchJson("remote-browser.config.json").catch(() => ({})),
    ]);

    state.projects = Object.entries(projects).map(([id, project]) => ({
      id: Number(id),
      ...project,
    }));
    state.introduce = introduce;
    state.experiences = experiences;
    state.presentations = presentations.map((item) => ({
      ...item,
      filePath: resolvePresentationPath(item.file),
    }));
    state.remoteBrowserEndpoint = pickRemoteBrowserEndpoint(browserConfig);
    state.remoteBrowserHealthUrl = pickRemoteBrowserHealthUrl(browserConfig);
  }

  async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Cannot load ${path}`);
    }
    return response.json();
  }

  function bindGlobalEvents() {
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showContextMenu(event.clientX, event.clientY);
    });

    document.addEventListener("pointerdown", (event) => {
      if (!contextMenu.contains(event.target)) {
        hideContextMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideContextMenu();
      }
    });

    contextMenu.addEventListener("click", (event) => {
      const command = event.target.closest("button")?.dataset.command;
      if (!command) return;
      hideContextMenu();
      runContextCommand(command);
    });

    document.querySelectorAll("[data-app]").forEach((button) => {
      button.addEventListener("click", () => openApp(button.dataset.app));
    });

    document.querySelector("#launcherButton").addEventListener("click", () => {
      openApp("terminal");
    });
  }

  function renderDesktop() {
    desktop.innerHTML = "";
    const coreIcons = [
      { id: "about", label: "About.mdx", type: "doc", app: "about" },
      { id: "projects", label: "Projects", type: "folder", app: "projects" },
      { id: "browser", label: "Browser.app", type: "browser", app: "browser" },
      { id: "presentations", label: "Presentations", type: "pdf", app: "presentations" },
      { id: "experience", label: "Experience.log", type: "doc", app: "experience" },
      { id: "terminal", label: "Terminal", type: "terminal", app: "terminal" },
      { id: "contact", label: "Contact.url", type: "link", app: "contact" },
    ];
    const projectIcons = state.projects.map((project) => ({
      id: `project-${project.id}`,
      label: makeShortFileName(project.title),
      type: "project",
      projectId: project.id,
      app: "project",
    }));

    [...coreIcons, ...projectIcons].forEach((item, index) => {
      desktop.appendChild(createDesktopIcon(item, index));
    });
  }

  function createDesktopIcon(item, index) {
    const button = document.createElement("button");
    button.className = "desktop-icon";
    button.type = "button";
    button.dataset.iconId = item.id;

    const position = state.iconPositions[item.id] || defaultIconPosition(index);
    button.style.left = `${position.x}px`;
    button.style.top = `${position.y}px`;

    const art = document.createElement("span");
    art.className = `icon-art ${item.type}`;
    if (item.type === "project") {
      art.appendChild(createMediaElement(item.projectId, { muted: true, autoplay: false }));
    }

    const label = document.createElement("span");
    label.className = "icon-label";
    label.textContent = item.label;

    button.append(art, label);
    button.addEventListener("click", () => {
      document.querySelectorAll(".desktop-icon.is-selected").forEach((icon) => {
        icon.classList.remove("is-selected");
      });
      button.classList.add("is-selected");
    });
    button.addEventListener("dblclick", () => {
      if (item.app === "project") {
        openProject(item.projectId);
      } else {
        openApp(item.app);
      }
    });
    makeIconDraggable(button);
    return button;
  }

  function defaultIconPosition(index) {
    const col = Math.floor(index / 6);
    const row = index % 6;
    return {
      x: 8 + col * 118,
      y: 8 + row * 126,
    };
  }

  function makeIconDraggable(icon) {
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let dragging = false;

    icon.addEventListener("pointerdown", (event) => {
      if (window.matchMedia("(max-width: 760px)").matches) return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originX = parseFloat(icon.style.left) || 0;
      originY = parseFloat(icon.style.top) || 0;
      icon.setPointerCapture(event.pointerId);
    });

    icon.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const nextX = clamp(originX + event.clientX - startX, 0, desktop.clientWidth - icon.offsetWidth);
      const nextY = clamp(originY + event.clientY - startY, 0, desktop.clientHeight - icon.offsetHeight);
      icon.style.left = `${nextX}px`;
      icon.style.top = `${nextY}px`;
    });

    icon.addEventListener("pointerup", (event) => {
      if (!dragging) return;
      dragging = false;
      icon.releasePointerCapture(event.pointerId);
      state.iconPositions[icon.dataset.iconId] = {
        x: parseFloat(icon.style.left) || 0,
        y: parseFloat(icon.style.top) || 0,
      };
      saveIconPositions();
    });
  }

  function openApp(app) {
    const openers = {
      about: () => openWindow("about", {
        title: "About.mdx",
        width: 760,
        height: 560,
        x: 250,
        y: 126,
        content: renderAbout,
      }),
      projects: () => openWindow("projects", {
        title: "Projects - Finder",
        width: 920,
        height: 620,
        x: 180,
        y: 96,
        content: renderProjects,
      }),
      experience: () => openWindow("experience", {
        title: "Experience.log",
        width: 820,
        height: 560,
        x: 224,
        y: 120,
        content: renderExperience,
      }),
      browser: () => openBrowser(),
      presentations: () => openWindow("presentations", {
        title: "Presentations - PDF Viewer",
        width: 760,
        height: 520,
        x: 250,
        y: 118,
        content: renderPresentations,
      }),
      terminal: () => openWindow(`terminal-${Date.now()}`, {
        title: "Terminal",
        width: 680,
        height: 430,
        x: 330,
        y: 150,
        content: renderTerminal,
      }),
      contact: () => openWindow("contact", {
        title: "Contact.url",
        width: 520,
        height: 340,
        x: 390,
        y: 170,
        content: renderContact,
      }),
    };
    openers[app]?.();
  }

  function openProject(projectId) {
    const project = state.projects.find((item) => item.id === Number(projectId));
    if (!project) return;
    openWindow(`project-${project.id}`, {
      title: `${project.title}.app`,
      width: 880,
      height: 570,
      x: 210 + project.id * 8,
      y: 104 + project.id * 6,
      content: (container) => renderProjectDetail(container, project),
    });
  }

  function openBrowser(initialUrl = "", label = "Browser.app") {
    const id = `browser-${Date.now()}`;
    openWindow(id, {
      title: label,
      width: 980,
      height: 650,
      x: 150,
      y: 86,
      content: (container) => renderBrowser(container, initialUrl),
    });
  }

  function openPresentation(entry) {
    if (isHtmlPresentation(entry)) {
      openBrowser(entry.filePath, `${entry.title} - Browser`);
      return;
    }

    const id = `pdf-${entry.projectId || Date.now()}`;
    openWindow(id, {
      title: `${entry.title}.pdf`,
      width: 920,
      height: 660,
      x: 180,
      y: 84,
      content: (container) => renderPdfViewer(container, entry),
    });
  }

  function openWindow(id, options) {
    const existing = state.windows.get(id);
    if (existing) {
      existing.frame.hidden = false;
      focusWindow(id);
      return;
    }

    const frame = document.createElement("section");
    frame.className = "window-frame";
    frame.dataset.windowId = id;
    frame.style.width = `${options.width}px`;
    frame.style.height = `${options.height}px`;
    frame.style.left = `${options.x}px`;
    frame.style.top = `${options.y}px`;

    const titlebar = document.createElement("header");
    titlebar.className = "window-titlebar";

    const title = document.createElement("div");
    title.className = "window-title";
    title.textContent = options.title;

    const controls = document.createElement("div");
    controls.className = "window-controls";
    controls.append(
      createWindowControl("minimize", "−", () => minimizeWindow(id)),
      createWindowControl("maximize", "+", () => maximizeWindow(id)),
      createWindowControl("close", "×", () => closeWindow(id)),
    );

    const content = document.createElement("div");
    content.className = "window-content";

    titlebar.append(title, controls);
    frame.append(titlebar, content);
    windowLayer.appendChild(frame);
    state.windows.set(id, { frame, title: options.title });

    options.content(content);
    makeWindowDraggable(frame, titlebar);
    frame.addEventListener("pointerdown", () => focusWindow(id));
    focusWindow(id);
    renderTasks();
  }

  function createWindowControl(kind, label, action) {
    const button = document.createElement("button");
    button.className = `window-control ${kind}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      action();
    });
    return button;
  }

  function makeWindowDraggable(frame, handle) {
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let dragging = false;

    handle.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button") || frame.classList.contains("is-maximized")) return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originX = frame.offsetLeft;
      originY = frame.offsetTop;
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const nextX = clamp(originX + event.clientX - startX, 8, window.innerWidth - 120);
      const nextY = clamp(originY + event.clientY - startY, 62, window.innerHeight - 80);
      frame.style.left = `${nextX}px`;
      frame.style.top = `${nextY}px`;
    });

    handle.addEventListener("pointerup", (event) => {
      if (!dragging) return;
      dragging = false;
      handle.releasePointerCapture(event.pointerId);
    });
  }

  function focusWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    state.activeWindow = id;
    win.frame.style.zIndex = `${++state.z}`;
    renderTasks();
  }

  function minimizeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.frame.hidden = true;
    renderTasks();
  }

  function maximizeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.frame.classList.toggle("is-maximized");
    focusWindow(id);
  }

  function closeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.frame.remove();
    state.windows.delete(id);
    if (state.activeWindow === id) {
      state.activeWindow = [...state.windows.keys()].at(-1) || null;
    }
    renderTasks();
  }

  function renderTasks() {
    taskStrip.innerHTML = "";
    state.windows.forEach((win, id) => {
      const button = document.createElement("button");
      button.className = "task-button";
      button.type = "button";
      button.textContent = win.title;
      button.classList.toggle("is-active", state.activeWindow === id && !win.frame.hidden);
      button.addEventListener("click", () => {
        win.frame.hidden = !win.frame.hidden && state.activeWindow === id;
        if (!win.frame.hidden) focusWindow(id);
        renderTasks();
      });
      taskStrip.appendChild(button);
    });
  }

  function renderWelcome(container) {
    const profile = state.introduce.profile;
    container.innerHTML = `
      <p class="panel-eyebrow">Mounted from legacy archive</p>
      <h1 class="panel-title">Portfolio Desktop</h1>
      <p class="muted">
        ${escapeHtml(profile.nameKo)}의 프로젝트와 경험을 바탕화면 파일처럼 열어보세요.
        우클릭 메뉴, 창 이동, 최소화, 프로젝트 폴더 탐색이 작동합니다.
      </p>
      <div class="rich-stack">
        <p>더블클릭: 파일 또는 앱 열기</p>
        <p>우클릭: 브라우저 기본 메뉴 대신 DindbOS 메뉴 열기</p>
        <p>Browser.app: 같은 origin의 HTML/build를 iframe 없이 Shadow DOM 런타임에서 실행</p>
        <p>Presentations: PDF와 HTML 발표 자료를 사이트 안에서 바로 열람</p>
        <p>Terminal: <strong>help</strong>, <strong>ls</strong>, <strong>open projects</strong> 명령 지원</p>
      </div>
    `;
  }

  function renderAbout(container) {
    const { profile, details } = state.introduce;
    container.innerHTML = `
      <div class="about-layout">
        <figure class="profile-image">
          <img src="${escapeAttr(profile.imageUrl)}" alt="${escapeAttr(profile.nameKo)} profile" />
        </figure>
        <div class="profile-meta">
          <p class="panel-eyebrow">About Me</p>
          <h1 class="panel-title">${escapeHtml(profile.nameEn)}</h1>
          <div class="profile-subtitle">${escapeHtml(profile.subtitle)}</div>
          <div class="profile-role">${escapeHtml(profile.role)}</div>
          <div class="rich-stack">
            ${profile.intro.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          </div>
        </div>
      </div>
      <div class="rich-stack">
        ${details.map((line) => `<p>${allowBasicRichText(line)}</p>`).join("")}
      </div>
    `;
  }

  function renderProjects(container) {
    const categories = ["All", ...new Set(state.projects.flatMap((project) => project.categories || []))].sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b);
    });

    const toolbar = document.createElement("div");
    toolbar.className = "project-toolbar";
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "filter-pill";
      button.type = "button";
      button.textContent = category;
      button.classList.toggle("is-active", state.filter === category);
      button.addEventListener("click", () => {
        state.filter = category;
        renderProjects(container);
      });
      toolbar.appendChild(button);
    });

    const grid = document.createElement("div");
    grid.className = "project-grid";
    const projects = state.filter === "All"
      ? state.projects
      : state.projects.filter((project) => project.categories?.includes(state.filter));

    projects.forEach((project) => grid.appendChild(createProjectCard(project)));
    container.replaceChildren(toolbar, grid);
  }

  function createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";
    card.tabIndex = 0;
    card.addEventListener("click", () => openProject(project.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openProject(project.id);
    });

    const media = document.createElement("div");
    media.className = "project-card-media";
    media.appendChild(createMediaElement(project.id, { muted: true, autoplay: true }));

    const body = document.createElement("div");
    body.className = "project-card-body";
    body.innerHTML = `
      <h3>${escapeHtml(project.title)}</h3>
      <p class="project-card-role">${escapeHtml(project.role || "Project")}</p>
      <p class="project-card-desc">${escapeHtml(project.description?.[0] || "")}</p>
      ${renderTags([...(project.languages || []), ...(project.techStacks || []), ...(project.categories || [])])}
    `;

    card.append(media, body);
    return card;
  }

  function renderProjectDetail(container, project) {
    const runnableLinks = getRunnableLinks(project);
    const presentation = getPresentationForProject(project.id);
    container.innerHTML = `
      <div class="detail-layout">
        <div class="detail-media"></div>
        <div class="detail-copy">
          <p class="panel-eyebrow">${escapeHtml(project.role || "Project")}</p>
          <h2>${escapeHtml(project.title)}</h2>
          ${renderTags([...(project.languages || []), ...(project.techStacks || []), ...(project.categories || [])])}
          <ul>
            ${(project.description || []).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
            ${(project.extraDescription || []).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
          </ul>
          <div class="link-row">
            ${runnableLinks
              .map((link) => `<button class="action-link" type="button" data-browser-url="${escapeAttr(link.url)}" data-browser-title="${escapeAttr(project.title)}">${escapeHtml(link.name)} 실행</button>`)
              .join("")}
            ${presentation ? `<button class="action-link" type="button" data-pdf-project="${escapeAttr(project.id)}">발표 자료 열기</button>` : ""}
            ${(project.links || [])
              .filter((link) => link.url)
              .map((link) => `<a class="action-link" href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.name)}</a>`)
              .join("")}
          </div>
        </div>
      </div>
    `;
    container.querySelector(".detail-media").appendChild(createMediaElement(project.id, { muted: true, autoplay: true }));
    container.querySelectorAll("[data-browser-url]").forEach((button) => {
      button.addEventListener("click", () => {
        openBrowser(button.dataset.browserUrl, `${button.dataset.browserTitle} - Browser`);
      });
    });
    container.querySelectorAll("[data-pdf-project]").forEach((button) => {
      button.addEventListener("click", () => {
        const entry = getPresentationForProject(Number(button.dataset.pdfProject));
        if (entry) openPresentation(entry);
      });
    });
  }

  function renderExperience(container) {
    container.innerHTML = `
      <p class="panel-eyebrow">Experience</p>
      <h1 class="panel-title">Work Log</h1>
      <div class="timeline">
        ${state.experiences.map((item) => `
          <article class="timeline-item">
            <div class="timeline-period">${escapeHtml(item.period)}</div>
            <div>
              <h3>${escapeHtml(item.groupName)}</h3>
              <p class="timeline-position">${escapeHtml(item.position)}</p>
              <ul>
                ${item.description.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
              </ul>
              <div class="tag-row">
                ${item.projects.map((project) => `<span class="tag">${escapeHtml(project)}</span>`).join("")}
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderBrowser(container, initialUrl = "") {
    container.innerHTML = `
      <form class="browser-shell">
        <div class="browser-toolbar">
          <button class="browser-button" type="button" data-browser-back>Back</button>
          <button class="browser-button" type="button" data-browser-forward>Forward</button>
          <button class="browser-button" type="button" data-browser-reload>Reload</button>
          <input class="browser-address" aria-label="Browser address" placeholder="https://example.com" value="${escapeAttr(initialUrl)}" />
          <button class="browser-button" type="submit">Go</button>
          <button class="browser-button" type="button" data-browser-engine>Engine status</button>
          <button class="browser-button" type="button" data-open-external>New tab</button>
        </div>
        <div class="browser-viewport"></div>
      </form>
    `;

    const form = container.querySelector(".browser-shell");
    const input = container.querySelector(".browser-address");
    const viewport = container.querySelector(".browser-viewport");
    const external = container.querySelector("[data-open-external]");
    const back = container.querySelector("[data-browser-back]");
    const forward = container.querySelector("[data-browser-forward]");
    const reload = container.querySelector("[data-browser-reload]");
    const engine = container.querySelector("[data-browser-engine]");
    const historyStack = [];
    let historyIndex = -1;

    const updateHistoryButtons = () => {
      back.disabled = historyIndex <= 0;
      forward.disabled = historyIndex >= historyStack.length - 1;
      reload.disabled = !input.value;
    };

    const navigate = async (url, options = {}) => {
      const normalized = normalizeUrl(url);
      input.value = normalized;
      if (!normalized) {
        renderBrowserHome(viewport, input);
        updateHistoryButtons();
        return;
      }

      if (options.push !== false) {
        historyStack.splice(historyIndex + 1);
        historyStack.push(normalized);
        historyIndex = historyStack.length - 1;
      }

      updateHistoryButtons();
      await loadWebDocument(viewport, normalized, navigate);
      updateHistoryButtons();
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      navigate(input.value);
    });
    external.addEventListener("click", () => {
      const url = normalizeUrl(input.value);
      if (url) window.open(url, "_blank", "noreferrer");
    });
    back.addEventListener("click", () => {
      if (historyIndex <= 0) return;
      historyIndex -= 1;
      navigate(historyStack[historyIndex], { push: false });
    });
    forward.addEventListener("click", () => {
      if (historyIndex >= historyStack.length - 1) return;
      historyIndex += 1;
      navigate(historyStack[historyIndex], { push: false });
    });
    reload.addEventListener("click", () => {
      if (historyIndex < 0) return;
      navigate(historyStack[historyIndex], { push: false });
    });
    engine.addEventListener("click", () => {
      renderEngineStatus(viewport);
    });
    navigate(initialUrl);
  }

  async function loadWebDocument(viewport, url, navigate) {
    viewport.innerHTML = `<div class="browser-status">Loading ${escapeHtml(url)}</div>`;

    try {
      const absoluteUrl = new URL(url, window.location.href);
      if (!isSameOrigin(absoluteUrl.href)) {
        const endpoint = getRemoteBrowserEndpoint();
        if (!endpoint) {
          renderEngineRequired(viewport, absoluteUrl.href);
          return;
        }
        renderRemoteBrowser(viewport, absoluteUrl.href, endpoint);
        return;
      }

      const response = await fetch(absoluteUrl.href, { credentials: "same-origin" });
      const type = response.headers.get("content-type") || "";
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!type.includes("text/html") && !/\.html?($|[?#])/i.test(absoluteUrl.pathname)) {
        throw new Error("Only HTML documents can run inside Browser.app");
      }

      const html = await response.text();
      await renderNativeDocument(viewport, html, absoluteUrl.href, navigate);
    } catch (error) {
      renderBrowserBlocked(viewport, url, error);
    }
  }

  function renderRemoteBrowser(viewport, url, endpoint, attempt = 1) {
    viewport.innerHTML = `
      <div class="remote-browser">
        <div class="remote-browser-status">${attempt === 1 ? "Connecting remote Chromium..." : `Waking remote Chromium... retry ${attempt}`}</div>
        <img class="remote-browser-screen" alt="Remote browser viewport" draggable="false" />
      </div>
    `;

    const shell = viewport.querySelector(".remote-browser");
    const status = viewport.querySelector(".remote-browser-status");
    const screen = viewport.querySelector(".remote-browser-screen");
    const socket = new WebSocket(endpoint);
    let receivedFrame = false;
    let closedByRetry = false;

    const send = (payload) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    };

    const retry = (reason) => {
      if (receivedFrame || attempt >= 8) {
        status.textContent = reason;
        return;
      }

      closedByRetry = true;
      socket.close();
      const delay = Math.min(12000, 1500 * attempt);
      status.textContent = `${reason}. Retrying in ${Math.round(delay / 1000)}s`;
      window.setTimeout(() => {
        renderRemoteBrowser(viewport, url, endpoint, attempt + 1);
      }, delay);
    };

    const viewportSize = () => ({
      width: Math.max(320, Math.round(shell.clientWidth)),
      height: Math.max(240, Math.round(shell.clientHeight)),
    });

    socket.addEventListener("open", () => {
      status.textContent = "Remote Chromium connected";
      send({ type: "navigate", url, ...viewportSize() });
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "status") {
        status.textContent = message.text;
      }
      if (message.type === "frame") {
        receivedFrame = true;
        screen.src = message.image;
      }
      if (message.type === "error") {
        status.textContent = message.message;
      }
    });

    socket.addEventListener("close", () => {
      if (closedByRetry) return;
      if (!receivedFrame) {
        retry("Remote Chromium is still waking");
        return;
      }
      status.textContent = "Remote Chromium disconnected";
    });

    socket.addEventListener("error", () => {
      retry("Remote Chromium connection failed");
    });

    const toPoint = (event) => {
      const rect = screen.getBoundingClientRect();
      return {
        x: Math.round(((event.clientX - rect.left) / rect.width) * viewportSize().width),
        y: Math.round(((event.clientY - rect.top) / rect.height) * viewportSize().height),
      };
    };

    screen.addEventListener("pointermove", (event) => {
      send({ type: "mouse", event: "move", ...toPoint(event) });
    });

    screen.addEventListener("pointerdown", (event) => {
      screen.setPointerCapture(event.pointerId);
      screen.focus();
      send({ type: "mouse", event: "down", button: event.button, ...toPoint(event) });
    });

    screen.addEventListener("pointerup", (event) => {
      screen.releasePointerCapture(event.pointerId);
      send({ type: "mouse", event: "up", button: event.button, ...toPoint(event) });
    });

    screen.addEventListener("wheel", (event) => {
      event.preventDefault();
      send({ type: "mouse", event: "wheel", deltaX: event.deltaX, deltaY: event.deltaY, ...toPoint(event) });
    }, { passive: false });

    screen.tabIndex = 0;
    screen.addEventListener("keydown", (event) => {
      send({ type: "key", event: "down", key: event.key });
    });
    screen.addEventListener("keyup", (event) => {
      send({ type: "key", event: "up", key: event.key });
    });

    const resizeObserver = new ResizeObserver(() => {
      send({ type: "resize", ...viewportSize() });
    });
    resizeObserver.observe(shell);
  }

  function renderEngineStatus(viewport) {
    const endpoint = getRemoteBrowserEndpoint();
    viewport.innerHTML = `
      <div class="browser-blocked">
        <div class="engine-card">
          <p class="panel-eyebrow">Browser Engine</p>
          <h1 class="panel-title">Remote Chromium</h1>
          <p class="muted">
            임의 주소는 포트폴리오 JS가 직접 여는 게 아니라 실제 Chromium 엔진이 엽니다.
            로컬에서는 기본값으로 <strong>${escapeHtml(DEFAULT_LOCAL_BROWSER_WS)}</strong>에 자동 연결합니다.
          </p>
          <div class="command-box">cd remote-browser && npm install && npm start</div>
          <p class="muted">현재 endpoint: ${escapeHtml(endpoint || "not configured")}</p>
        </div>
      </div>
    `;
  }

  function renderEngineRequired(viewport, url) {
    viewport.innerHTML = `
      <div class="browser-blocked">
        <div class="engine-card">
          <p class="panel-eyebrow">Engine Required</p>
          <h1 class="panel-title">Start Chromium</h1>
          <p class="muted">
            ${escapeHtml(url)} 같은 외부 주소는 iframe이나 fetch로 열 수 없습니다.
            실제 Chromium 엔진을 실행하면 이 창 안에서 열립니다.
          </p>
          <div class="command-box">cd remote-browser && npm install && npm start</div>
          <p class="muted">
            로컬 개발에서는 Browser.app이 자동으로 ${escapeHtml(DEFAULT_LOCAL_BROWSER_WS)}에 연결합니다.
          </p>
          <a class="action-link" href="${escapeAttr(url)}" target="_blank" rel="noreferrer">Open normal tab</a>
        </div>
      </div>
    `;
  }

  async function renderNativeDocument(viewport, html, documentUrl, navigate) {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const scripts = [...parsed.querySelectorAll("script")];
    const host = document.createElement("div");
    host.className = "browser-document-host";
    const shadow = host.attachShadow({ mode: "open" });
    const bodyHost = document.createElement("div");
    bodyHost.className = "web-document-body";

    rewriteDocumentUrls(parsed, documentUrl);
    scripts.forEach((script) => script.remove());

    const baseStyle = document.createElement("style");
    baseStyle.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #ffffff;
        color: #111111;
        font-family: sans-serif;
      }
      .web-document-body {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
      .deck,
      main,
      #root {
        width: 100% !important;
        min-height: 100% !important;
      }
    `;
    shadow.appendChild(baseStyle);

    parsed.head.querySelectorAll("style, link[rel='stylesheet'], link[rel='preconnect']").forEach((node) => {
      shadow.appendChild(cloneHeadNode(node));
    });

    [...parsed.body.childNodes].forEach((node) => {
      bodyHost.appendChild(document.importNode(node, true));
    });
    shadow.appendChild(bodyHost);
    viewport.replaceChildren(host);

    shadow.addEventListener("click", (event) => {
      const anchor = event.composedPath().find((node) => node?.tagName === "A" && node.href);
      if (!anchor) return;
      if (anchor.target === "_blank" || event.metaKey || event.ctrlKey) return;
      event.preventDefault();
      navigate(anchor.getAttribute("href"));
    });

    await executeDocumentScripts(scripts, shadow, bodyHost, documentUrl);
    await runKnownDocumentEnhancers(shadow);
  }

  function cloneHeadNode(node) {
    const clone = document.createElement(node.tagName.toLowerCase());
    copyAttributes(node, clone);
    if (node.tagName === "STYLE") {
      clone.textContent = scopeCss(node.textContent || "");
    }
    return clone;
  }

  async function executeDocumentScripts(scripts, shadow, bodyHost, documentUrl) {
    const scopedDocument = createScopedDocument(shadow, bodyHost);

    for (const script of scripts) {
      const src = script.getAttribute("src");
      if (src) {
        const scriptUrl = new URL(src, documentUrl).href;
        if (isSameOrigin(scriptUrl)) {
          const response = await fetch(scriptUrl);
          if (!response.ok) throw new Error(`Cannot load script ${scriptUrl}`);
          executeScopedScript(await response.text(), scopedDocument, scriptUrl);
        } else {
          await loadGlobalScript(scriptUrl);
        }
        continue;
      }

      executeScopedScript(script.textContent || "", scopedDocument, documentUrl);
    }
  }

  function executeScopedScript(source, scopedDocument, sourceUrl) {
    const withSource = `${source}\n//# sourceURL=${sourceUrl}`;
    const fn = new Function("document", "window", "self", "globalThis", withSource);
    fn(scopedDocument, window, window, window);
  }

  function createScopedDocument(shadow, bodyHost) {
    return new Proxy(shadow, {
      get(target, prop) {
        if (prop === "body") return bodyHost;
        if (prop === "head") return target;
        if (prop === "documentElement") return target.host;
        if (prop === "createElement") return document.createElement.bind(document);
        if (prop === "createElementNS") return document.createElementNS.bind(document);
        if (prop === "createTextNode") return document.createTextNode.bind(document);
        if (prop === "addEventListener") return target.addEventListener.bind(target);
        if (prop === "removeEventListener") return target.removeEventListener.bind(target);
        const value = target[prop] ?? document[prop];
        return typeof value === "function" ? value.bind(value === target[prop] ? target : document) : value;
      },
    });
  }

  function loadGlobalScript(src) {
    return new Promise((resolve, reject) => {
      if ([...document.scripts].some((script) => script.dataset.runtimeSrc === src)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.dataset.runtimeSrc = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Cannot load external script ${src}`));
      document.head.appendChild(script);
    });
  }

  async function runKnownDocumentEnhancers(shadow) {
    if (window.mermaid && shadow.querySelector(".mermaid")) {
      await window.mermaid.run({ nodes: [...shadow.querySelectorAll(".mermaid")] }).catch(() => {});
    }
  }

  function rewriteDocumentUrls(parsed, documentUrl) {
    const attributes = ["href", "src", "poster", "action"];
    parsed.querySelectorAll("*").forEach((node) => {
      attributes.forEach((attr) => {
        const value = node.getAttribute(attr);
        if (!value || /^(#|data:|mailto:|tel:|javascript:)/i.test(value)) return;
        node.setAttribute(attr, new URL(value, documentUrl).href);
      });
    });
  }

  function copyAttributes(source, target) {
    [...source.attributes].forEach((attr) => {
      target.setAttribute(attr.name, attr.value);
    });
  }

  function scopeCss(css) {
    return css
      .replace(/:root/g, ":host")
      .replace(/html\s*,\s*body/g, ":host, .web-document-body")
      .replace(/\bbody\b/g, ".web-document-body");
  }

  function renderBrowserBlocked(viewport, url, error) {
    viewport.innerHTML = `
      <div class="browser-blocked">
        <div>
          <p class="panel-eyebrow">Browser runtime blocked</p>
          <h1 class="panel-title">Archive Required</h1>
          <p class="muted">
            ${escapeHtml(url)} 문서를 직접 읽지 못했습니다. 외부 도메인은 포트폴리오 JS가 직접 열 수 없고, Remote Chromium 엔진이 필요합니다.
          </p>
          <p class="muted">
            로컬에서는 <strong>cd remote-browser && npm install && npm start</strong>만 실행하면 Browser.app이 자동으로 붙습니다.
          </p>
          <p class="muted">Reason: ${escapeHtml(error.message)}</p>
          <a class="action-link" href="${escapeAttr(url)}" target="_blank" rel="noreferrer">Open real browser tab</a>
        </div>
      </div>
    `;
  }

  function renderBrowserHome(viewport, input) {
    const runnable = state.projects.flatMap((project) => (
      getRunnableLinks(project).map((link) => ({ project, link }))
    ));
    const localDocuments = state.presentations
      .filter(isHtmlPresentation)
      .map((entry) => ({ project: state.projects.find((project) => project.id === entry.projectId), entry }));
    viewport.innerHTML = `
      <div class="browser-home">
        <p class="panel-eyebrow">Runnable web projects</p>
        <h1 class="panel-title">Browser.app</h1>
        <p class="muted">
          같은 origin에 있는 HTML과 정적 build를 직접 읽어서 Shadow DOM 런타임에서 실행합니다.
          외부 사이트는 보안 정책 때문에 로컬 archive가 필요합니다.
        </p>
        <div class="shortcut-grid">
          ${localDocuments.map(({ project, entry }) => `
            <button class="shortcut-card" type="button" data-shortcut-url="${escapeAttr(entry.filePath)}">
              <strong>${escapeHtml(entry.title)}</strong>
              <span>${escapeHtml(project?.title || entry.filePath)} · local HTML</span>
            </button>
          `).join("")}
          ${runnable.map(({ project, link }) => `
            <button class="shortcut-card" type="button" data-shortcut-url="${escapeAttr(link.url)}">
              <strong>${escapeHtml(project.title)}</strong>
              <span>${escapeHtml(link.url)}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
    viewport.querySelectorAll("[data-shortcut-url]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.shortcutUrl;
        input.form.requestSubmit();
      });
    });
  }

  function renderPresentations(container) {
    const entries = state.presentations.map((entry) => ({
      ...entry,
      project: state.projects.find((project) => project.id === entry.projectId),
    }));
    container.innerHTML = `
      <p class="panel-eyebrow">Presentations</p>
      <h1 class="panel-title">Presentations</h1>
      <p class="muted">
        PDF와 HTML 발표 자료는 <strong>assets/presentations</strong> 폴더에 넣고 manifest에 등록하면 이곳에서 열립니다.
      </p>
      <div class="pdf-list">
        ${entries.map((entry) => `
          <article class="pdf-row">
            <div>
              <h3>${escapeHtml(entry.title)}</h3>
              <p>${escapeHtml(entry.project?.title || "Project")} · ${escapeHtml(entry.filePath)}</p>
            </div>
            <button class="action-link" type="button" data-pdf-file="${escapeAttr(entry.file)}">${isHtmlPresentation(entry) ? "Open in Browser" : "Open PDF"}</button>
          </article>
        `).join("")}
      </div>
    `;
    container.querySelectorAll("[data-pdf-file]").forEach((button) => {
      button.addEventListener("click", () => {
        const entry = state.presentations.find((item) => item.file === button.dataset.pdfFile);
        if (entry) openPresentation(entry);
      });
    });
  }

  function renderPdfViewer(container, entry) {
    container.innerHTML = `
      <div class="pdf-viewer">
        <div class="pdf-toolbar">
          <div class="pdf-title">${escapeHtml(entry.title)}</div>
          <a class="action-link" href="${escapeAttr(entry.filePath)}" target="_blank" rel="noreferrer">New tab</a>
        </div>
        <div class="pdf-body">
          <div class="pdf-missing">Checking PDF...</div>
        </div>
      </div>
    `;
    const body = container.querySelector(".pdf-body");
    fetch(entry.filePath, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) throw new Error("missing");
        body.innerHTML = `<iframe class="pdf-frame" title="${escapeAttr(entry.title)}" src="${escapeAttr(entry.filePath)}"></iframe>`;
      })
      .catch(() => {
        body.innerHTML = `
          <div class="pdf-missing">
            <div>
              <strong>PDF 파일을 아직 찾지 못했습니다.</strong>
              <span>${escapeHtml(entry.filePath)} 위치에 파일을 넣으면 이 창에서 바로 열립니다.</span>
            </div>
          </div>
        `;
      });
  }

  function renderTerminal(container) {
    const output = [
      "DindbOS terminal",
      "type 'help' for commands",
      "",
    ];

    container.innerHTML = `
      <div class="terminal-surface">
        <div class="terminal-output"></div>
        <label class="terminal-input-row">
          <span>$</span>
          <input class="terminal-input" autocomplete="off" spellcheck="false" />
        </label>
      </div>
    `;

    const outputEl = container.querySelector(".terminal-output");
    const input = container.querySelector(".terminal-input");
    const print = (line = "") => {
      output.push(line);
      outputEl.textContent = output.join("\n");
      outputEl.scrollTop = outputEl.scrollHeight;
    };
    outputEl.textContent = output.join("\n");
    input.focus();
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const command = input.value.trim();
      input.value = "";
      if (!command) return;
      print(`$ ${command}`);
      runTerminalCommand(command, print, output, outputEl);
    });
  }

  function runTerminalCommand(command, print, output, outputEl) {
    const normalized = command.toLowerCase();
    if (normalized === "help") {
      print("commands: help, ls, whoami, projects, open about, open projects, open browser, open pdfs, open experience, clear, date");
      return;
    }
    if (normalized === "ls") {
      print(["About.mdx", "Projects/", "Browser.app", "Presentations/", "Experience.log", "Contact.url", ...state.projects.map((p) => `${makeShortFileName(p.title)}.app`)].join("\n"));
      return;
    }
    if (normalized === "whoami") {
      print(`${state.introduce.profile.nameKo} / ${state.introduce.profile.role}`);
      return;
    }
    if (normalized === "projects") {
      state.projects.forEach((project) => print(`${project.id}. ${project.title}`));
      return;
    }
    if (normalized.startsWith("open ")) {
      const target = normalized.replace("open ", "");
      const app = target.includes("project") ? "projects" : target === "pdfs" ? "presentations" : target;
      openApp(app);
      print(`opened ${target}`);
      return;
    }
    if (normalized === "clear") {
      output.splice(0, output.length);
      outputEl.textContent = "";
      return;
    }
    if (normalized === "date") {
      print(new Date().toLocaleString("ko-KR"));
      return;
    }
    print(`command not found: ${command}`);
  }

  function renderContact(container) {
    const profile = state.introduce.profile;
    container.innerHTML = `
      <p class="panel-eyebrow">Contact</p>
      <h1 class="panel-title">${escapeHtml(profile.nameKo)}</h1>
      <p class="muted">프로젝트와 코드는 GitHub에서 이어서 볼 수 있습니다.</p>
      <div class="link-row">
        <a class="action-link" href="https://github.com/Dindb-dong" target="_blank" rel="noreferrer">GitHub</a>
        <a class="action-link" href="https://dindb-dong.github.io" target="_blank" rel="noreferrer">Portfolio URL</a>
      </div>
    `;
  }

  function renderError(error) {
    desktop.innerHTML = `
      <div class="empty-state">
        <div>
          <h1>Legacy mount failed</h1>
          <p>${escapeHtml(error.message)}</p>
        </div>
      </div>
    `;
  }

  function createMediaElement(projectId, options = {}) {
    const first = MEDIA[projectId]?.[0];
    if (!first) {
      const fallback = document.createElement("img");
      fallback.src = `${LEGACY_BASE}/logo512.png`;
      fallback.alt = "Project fallback image";
      return fallback;
    }

    const path = `${LEGACY_BASE}/thumbnails/${first}`;
    const isVideo = /\.(mp4|mov)$/i.test(first);
    if (isVideo) {
      const video = document.createElement("video");
      video.src = path;
      video.muted = options.muted ?? true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = options.autoplay ?? true;
      video.preload = "metadata";
      return video;
    }

    const image = document.createElement("img");
    image.src = path;
    image.alt = `Project ${projectId} thumbnail`;
    image.loading = "lazy";
    return image;
  }

  function renderTags(tags) {
    const uniqueTags = [...new Set(tags.filter(Boolean))].slice(0, 8);
    if (!uniqueTags.length) return "";
    return `<div class="tag-row">${uniqueTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
  }

  function showContextMenu(x, y) {
    contextMenu.classList.add("is-open");
    const width = contextMenu.offsetWidth;
    const height = contextMenu.offsetHeight;
    contextMenu.style.left = `${Math.min(x, window.innerWidth - width - 8)}px`;
    contextMenu.style.top = `${Math.min(y, window.innerHeight - height - 8)}px`;
  }

  function hideContextMenu() {
    contextMenu.classList.remove("is-open");
  }

  function runContextCommand(command) {
    if (command === "open-projects") openApp("projects");
    if (command === "open-browser") openApp("browser");
    if (command === "open-presentations") openApp("presentations");
    if (command === "new-terminal") openApp("terminal");
    if (command === "arrange-icons") arrangeIcons();
    if (command === "about-shell") openWindow("shell-about", {
      title: "About DindbOS",
      width: 520,
      height: 330,
      x: 410,
      y: 180,
      content: (container) => {
        container.innerHTML = `
          <p class="panel-eyebrow">DindbOS</p>
          <h1 class="panel-title">Web Desktop</h1>
          <p class="muted">
            legacy 폴더의 JSON과 썸네일을 브라우저 데스크톱 안에 마운트한 포트폴리오 셸입니다.
          </p>
        `;
      },
    });
  }

  function arrangeIcons() {
    state.iconPositions = {};
    saveIconPositions();
    renderDesktop();
  }

  function getRunnableLinks(project) {
    return (project.links || []).filter((link) => {
      if (!link.url) return false;
      const label = `${link.name} ${link.url}`.toLowerCase();
      const isWebsite = label.includes("website") || label.includes("netlify") || label.includes("github.io");
      const isRepository = label.includes("github.com") || label.includes("instagram.com");
      return isWebsite && !isRepository;
    });
  }

  function getPresentationForProject(projectId) {
    return state.presentations.find((entry) => entry.projectId === Number(projectId));
  }

  function getRemoteBrowserEndpoint() {
    return localStorage.getItem(REMOTE_BROWSER_STORAGE_KEY)
      || window.DINDB_REMOTE_BROWSER_WS
      || state.remoteBrowserEndpoint
      || "";
  }

  function getRemoteBrowserHealthUrl() {
    return state.remoteBrowserHealthUrl || deriveHealthUrl(getRemoteBrowserEndpoint());
  }

  function setRemoteBrowserEndpoint(value) {
    if (!value) {
      localStorage.removeItem(REMOTE_BROWSER_STORAGE_KEY);
      return;
    }
    localStorage.setItem(REMOTE_BROWSER_STORAGE_KEY, value);
  }

  function pickRemoteBrowserEndpoint(config) {
    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
      return config.localWebSocketUrl || DEFAULT_LOCAL_BROWSER_WS;
    }

    if (window.location.protocol === "https:") {
      return config.productionWebSocketUrl || "";
    }

    return config.localWebSocketUrl || DEFAULT_LOCAL_BROWSER_WS;
  }

  function pickRemoteBrowserHealthUrl(config) {
    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
      return config.localHealthUrl || deriveHealthUrl(config.localWebSocketUrl || DEFAULT_LOCAL_BROWSER_WS);
    }

    if (window.location.protocol === "https:") {
      return config.productionHealthUrl || deriveHealthUrl(config.productionWebSocketUrl || "");
    }

    return config.localHealthUrl || deriveHealthUrl(config.localWebSocketUrl || DEFAULT_LOCAL_BROWSER_WS);
  }

  function deriveHealthUrl(webSocketUrl) {
    if (!webSocketUrl) return "";
    try {
      const url = new URL(webSocketUrl);
      url.protocol = url.protocol === "wss:" ? "https:" : "http:";
      url.pathname = "/health";
      url.search = "";
      url.hash = "";
      return url.href;
    } catch {
      return "";
    }
  }

  function prewarmRemoteBrowser() {
    const healthUrl = getRemoteBrowserHealthUrl();
    if (!healthUrl) return;

    fetch(healthUrl, {
      method: "GET",
      mode: isSameOrigin(healthUrl) ? "cors" : "no-cors",
      cache: "no-store",
      keepalive: true,
    })
      .then(() => {
        systemStatus.textContent = "Browser engine pinged";
      })
      .catch(() => {
        systemStatus.textContent = "Browser engine sleeping";
      });
  }

  function resolvePresentationPath(file) {
    if (/^https?:\/\//i.test(file)) {
      return file;
    }
    return `assets/presentations/${file}`;
  }

  function isHtmlPresentation(entry) {
    return /\.html?($|[?#])/i.test(entry.filePath || entry.file || "");
  }

  function normalizeUrl(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^(\/|\.\/|\.\.\/|assets\/|legacy\/)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function isSameOrigin(url) {
    return new URL(url, window.location.href).origin === window.location.origin;
  }

  function tickClock() {
    clock.textContent = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function makeShortFileName(title) {
    const clean = title
      .replace(/[:&]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return clean.length > 22 ? `${clean.slice(0, 20)}...` : clean;
  }

  function loadIconPositions() {
    try {
      return JSON.parse(localStorage.getItem("dindbos-icon-positions") || "{}");
    } catch {
      return {};
    }
  }

  function saveIconPositions() {
    localStorage.setItem("dindbos-icon-positions", JSON.stringify(state.iconPositions));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function allowBasicRichText(value) {
    return escapeHtml(value)
      .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
      .replace(/&lt;b&gt;/gi, "<strong>")
      .replace(/&lt;\/b&gt;/gi, "</strong>");
  }
})();
