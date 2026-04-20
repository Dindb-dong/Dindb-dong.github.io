(() => {
  const LEGACY_BASE = "legacy/public";
  const DEFAULT_LOCAL_BROWSER_WS = "ws://127.0.0.1:8787/browser";
  const REMOTE_BROWSER_STORAGE_KEY = "dindbos-remote-browser-ws";
  const LANGUAGE_STORAGE_KEY = "dindbos-language";
  const SUPPORTED_LOCALES = ["ko", "en"];
  const MIN_WINDOW_WIDTH = 320;
  const MIN_WINDOW_HEIGHT = 240;
  const WINDOW_BOUNDS = { left: 8, top: 70, right: 8, bottom: 12 };
  const LEGACY_FILES = {
    ko: {
      projects: "projectDetails.json",
      introduce: "introduce.json",
      experiences: "experiences.json",
    },
    en: {
      projects: "eng_projectDetails.json",
      introduce: "eng_introduce.json",
      experiences: "eng_experiences.json",
    },
  };
  const COPY = {
    ko: {
      "meta.description": "김동욱의 웹 데스크톱 포트폴리오. 프로젝트, 경험, 소개를 OS처럼 탐색합니다.",
      "boot.copy": "legacy archive mounting...",
      "status.mounting": "레거시 마운트 중",
      "status.mounted": "프로젝트 {count}개 마운트됨",
      "status.mountFailed": "레거시 마운트 실패",
      "status.browserPinged": "브라우저 엔진 깨움",
      "status.browserSleeping": "브라우저 엔진 대기 중",
      "status.languageSwitching": "언어 전환 중",
      "status.languageChanged": "{language}로 전환됨",
      "language.ko": "한국어",
      "language.en": "English",
      "language.toggle": "언어 전환",
      "dock.about": "소개",
      "dock.projects": "프로젝트",
      "dock.browser": "브라우저",
      "dock.terminal": "터미널",
      "dock.settings": "설정",
      "context.openProjects": "프로젝트 열기",
      "context.openBrowser": "브라우저 열기",
      "context.openPresentations": "발표 자료 열기",
      "context.openSettings": "설정 열기",
      "context.newTerminal": "새 터미널",
      "context.arrangeIcons": "아이콘 정렬",
      "context.aboutShell": "DindbOS 정보",
      "icon.about": "About.mdx",
      "icon.projects": "Projects",
      "icon.browser": "Browser.app",
      "icon.presentations": "Presentations",
      "icon.experience": "Experience.log",
      "icon.terminal": "Terminal",
      "icon.settings": "Settings.app",
      "icon.contact": "Contact.url",
      "title.welcome": "Welcome - DindbOS",
      "title.projects": "Projects - Finder",
      "title.experience": "Experience.log",
      "title.browser": "Browser.app",
      "title.presentations": "Presentations - PDF Viewer",
      "title.terminal": "Terminal",
      "title.contact": "Contact.url",
      "title.settings": "Settings",
      "title.shellAbout": "About DindbOS",
      "welcome.eyebrow": "Mounted from legacy archive",
      "welcome.title": "Portfolio Desktop",
      "welcome.body": "{name}의 프로젝트와 경험을 바탕화면 파일처럼 열어보세요. 우클릭 메뉴, 창 이동, 창 크기 조절, 최소화, 프로젝트 폴더 탐색이 작동합니다.",
      "welcome.drag": "더블클릭: 파일 또는 앱 열기",
      "welcome.menu": "우클릭: 브라우저 기본 메뉴 대신 DindbOS 메뉴 열기",
      "welcome.browser": "Browser.app: 실제 Chromium 엔진으로 외부 주소 열기",
      "welcome.presentations": "Presentations: PDF와 HTML 발표 자료를 사이트 안에서 바로 열람",
      "welcome.terminal": "Terminal: help, ls, open projects 명령 지원",
      "settings.eyebrow": "System Preferences",
      "settings.title": "Language",
      "settings.body": "언어를 바꾸면 레거시 프로젝트 데이터와 시스템 문구가 함께 바뀝니다.",
      "settings.active": "현재 사용 중",
      "projects.run": "실행",
      "projects.openPresentation": "발표 자료 열기",
      "browser.back": "뒤로",
      "browser.forward": "앞으로",
      "browser.reload": "새로고침",
      "browser.go": "이동",
      "browser.engine": "엔진 상태",
      "browser.newTab": "새 탭",
      "browser.placeholder": "https://example.com",
      "browser.loading": "{url} 로딩 중",
      "browser.connecting": "원격 Chromium 연결 중...",
      "browser.waking": "원격 Chromium 깨우는 중... 재시도 {attempt}",
      "browser.connected": "원격 Chromium 연결됨",
      "browser.disconnected": "원격 Chromium 연결 종료",
      "browser.wakingRetry": "원격 Chromium이 아직 깨어나는 중",
      "browser.connectionFailed": "원격 Chromium 연결 실패",
      "browser.retrying": "{reason}. {seconds}초 후 재시도",
      "browser.homeEyebrow": "Runnable web projects",
      "browser.homeTitle": "Browser.app",
      "browser.homeBody": "같은 origin의 HTML과 정적 build는 내부 런타임에서 열고, 외부 사이트는 Render의 Remote Chromium으로 엽니다.",
      "browser.engineTitle": "Remote Chromium",
      "browser.engineBody": "임의 주소는 포트폴리오 JS가 직접 여는 게 아니라 실제 Chromium 엔진이 엽니다.",
      "browser.engineRequired": "Start Chromium",
      "browser.engineRequiredBody": "{url} 같은 외부 주소는 iframe이나 fetch로 열 수 없습니다. 실제 Chromium 엔진을 실행하면 이 창 안에서 열립니다.",
      "browser.blockedEyebrow": "Browser runtime blocked",
      "browser.blockedTitle": "Archive Required",
      "browser.blockedBody": "{url} 문서를 직접 읽지 못했습니다. 외부 도메인은 Remote Chromium 엔진이 필요합니다.",
      "browser.openExternal": "일반 브라우저 탭 열기",
      "presentations.body": "PDF와 HTML 발표 자료는 assets/presentations 폴더에 넣고 manifest에 등록하면 이곳에서 열립니다.",
      "presentations.openBrowser": "브라우저에서 열기",
      "presentations.openPdf": "PDF 열기",
      "pdf.newTab": "새 탭",
      "pdf.checking": "PDF 확인 중...",
      "pdf.missingTitle": "PDF 파일을 아직 찾지 못했습니다.",
      "pdf.missingBody": "{path} 위치에 파일을 넣으면 이 창에서 바로 열립니다.",
      "terminal.name": "DindbOS 터미널",
      "terminal.helpHint": "명령어는 'help'를 입력하세요",
      "terminal.help": "commands: help, ls, whoami, projects, open about, open projects, open browser, open pdfs, open experience, open settings, clear, date",
      "terminal.opened": "{target} 열림",
      "terminal.notFound": "명령을 찾지 못했습니다: {command}",
      "contact.body": "프로젝트와 코드는 GitHub에서 이어서 볼 수 있습니다.",
      "shellAbout.body": "legacy 폴더의 JSON과 썸네일을 브라우저 데스크톱 안에 마운트한 포트폴리오 셸입니다.",
    },
    en: {
      "meta.description": "Kim Dong Wook's web desktop portfolio for exploring projects, experience, and profile like an OS.",
      "boot.copy": "mounting legacy archive...",
      "status.mounting": "Mounting legacy",
      "status.mounted": "{count} projects mounted",
      "status.mountFailed": "Legacy mount failed",
      "status.browserPinged": "Browser engine pinged",
      "status.browserSleeping": "Browser engine sleeping",
      "status.languageSwitching": "Switching language",
      "status.languageChanged": "Switched to {language}",
      "language.ko": "한국어",
      "language.en": "English",
      "language.toggle": "Switch language",
      "dock.about": "About",
      "dock.projects": "Projects",
      "dock.browser": "Browser",
      "dock.terminal": "Terminal",
      "dock.settings": "Settings",
      "context.openProjects": "Open Projects",
      "context.openBrowser": "Open Browser",
      "context.openPresentations": "Open Presentations",
      "context.openSettings": "Open Settings",
      "context.newTerminal": "New Terminal",
      "context.arrangeIcons": "Arrange icons",
      "context.aboutShell": "About DindbOS",
      "icon.about": "About.mdx",
      "icon.projects": "Projects",
      "icon.browser": "Browser.app",
      "icon.presentations": "Presentations",
      "icon.experience": "Experience.log",
      "icon.terminal": "Terminal",
      "icon.settings": "Settings.app",
      "icon.contact": "Contact.url",
      "title.welcome": "Welcome - DindbOS",
      "title.projects": "Projects - Finder",
      "title.experience": "Experience.log",
      "title.browser": "Browser.app",
      "title.presentations": "Presentations - PDF Viewer",
      "title.terminal": "Terminal",
      "title.contact": "Contact.url",
      "title.settings": "Settings",
      "title.shellAbout": "About DindbOS",
      "welcome.eyebrow": "Mounted from legacy archive",
      "welcome.title": "Portfolio Desktop",
      "welcome.body": "Open {name}'s projects and experience like files on a desktop. Context menus, window moving, resizing, minimizing, and project folders work.",
      "welcome.drag": "Double-click: open a file or app",
      "welcome.menu": "Right-click: open the DindbOS menu before the browser menu",
      "welcome.browser": "Browser.app: open external URLs through a real Chromium engine",
      "welcome.presentations": "Presentations: view PDF and HTML decks inside the portfolio",
      "welcome.terminal": "Terminal: supports help, ls, and open projects",
      "settings.eyebrow": "System Preferences",
      "settings.title": "Language",
      "settings.body": "Changing language switches both the legacy project data and system copy.",
      "settings.active": "Active",
      "projects.run": "Run",
      "projects.openPresentation": "Open presentation",
      "browser.back": "Back",
      "browser.forward": "Forward",
      "browser.reload": "Reload",
      "browser.go": "Go",
      "browser.engine": "Engine status",
      "browser.newTab": "New tab",
      "browser.placeholder": "https://example.com",
      "browser.loading": "Loading {url}",
      "browser.connecting": "Connecting remote Chromium...",
      "browser.waking": "Waking remote Chromium... retry {attempt}",
      "browser.connected": "Remote Chromium connected",
      "browser.disconnected": "Remote Chromium disconnected",
      "browser.wakingRetry": "Remote Chromium is still waking",
      "browser.connectionFailed": "Remote Chromium connection failed",
      "browser.retrying": "{reason}. Retrying in {seconds}s",
      "browser.homeEyebrow": "Runnable web projects",
      "browser.homeTitle": "Browser.app",
      "browser.homeBody": "Same-origin HTML and static builds run inside the local runtime. External websites open through Render Remote Chromium.",
      "browser.engineTitle": "Remote Chromium",
      "browser.engineBody": "Arbitrary URLs are opened by a real Chromium engine, not directly by portfolio JavaScript.",
      "browser.engineRequired": "Start Chromium",
      "browser.engineRequiredBody": "External URLs like {url} cannot be opened through iframe or fetch. Start the real Chromium engine to open them inside this window.",
      "browser.blockedEyebrow": "Browser runtime blocked",
      "browser.blockedTitle": "Archive Required",
      "browser.blockedBody": "Could not read {url} directly. External domains need the Remote Chromium engine.",
      "browser.openExternal": "Open normal browser tab",
      "presentations.body": "PDF and HTML decks registered in assets/presentations/manifest.json open here.",
      "presentations.openBrowser": "Open in Browser",
      "presentations.openPdf": "Open PDF",
      "pdf.newTab": "New tab",
      "pdf.checking": "Checking PDF...",
      "pdf.missingTitle": "PDF file was not found yet.",
      "pdf.missingBody": "Place it at {path} to open it directly in this window.",
      "terminal.name": "DindbOS terminal",
      "terminal.helpHint": "type 'help' for commands",
      "terminal.help": "commands: help, ls, whoami, projects, open about, open projects, open browser, open pdfs, open experience, open settings, clear, date",
      "terminal.opened": "opened {target}",
      "terminal.notFound": "command not found: {command}",
      "contact.body": "Projects and code continue on GitHub.",
      "shellAbout.body": "A portfolio shell that mounts JSON and thumbnails from the legacy folder into a browser desktop.",
    },
  };
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
    locale: loadLocale(),
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
  const bootCopy = document.querySelector("#bootCopy");
  const launcherButton = document.querySelector("#launcherButton");
  const languageToggle = document.querySelector("#languageToggle");

  init();

  async function init() {
    applyLocaleChrome();
    bindGlobalEvents();
    tickClock();
    window.setInterval(tickClock, 1000);

    try {
      await mountLegacyData();
      prewarmRemoteBrowser();
      systemStatus.textContent = t("status.mounted", { count: state.projects.length });
      renderDesktop();
      openWindow("welcome", {
        title: t("title.welcome"),
        getTitle: () => t("title.welcome"),
        width: 720,
        height: 430,
        x: 310,
        y: 118,
        content: renderWelcome,
      });
    } catch (error) {
      systemStatus.textContent = t("status.mountFailed");
      renderError(error);
    } finally {
      window.setTimeout(() => bootScreen.classList.add("is-hidden"), 400);
    }
  }

  async function mountLegacyData() {
    const files = LEGACY_FILES[state.locale] || LEGACY_FILES.ko;
    const [projects, introduce, experiences, presentations, browserConfig] = await Promise.all([
      fetchJson(`${LEGACY_BASE}/${files.projects}`),
      fetchJson(`${LEGACY_BASE}/${files.introduce}`),
      fetchJson(`${LEGACY_BASE}/${files.experiences}`),
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
    if (state.filter !== "All" && !state.projects.some((project) => project.categories?.includes(state.filter))) {
      state.filter = "All";
    }
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

    launcherButton.addEventListener("click", () => {
      openApp("terminal");
    });

    languageToggle.addEventListener("click", () => {
      setLocale(state.locale === "ko" ? "en" : "ko");
    });

    window.addEventListener("resize", constrainOpenWindows);
  }

  function renderDesktop() {
    desktop.innerHTML = "";
    const coreIcons = [
      { id: "about", label: t("icon.about"), type: "doc", app: "about" },
      { id: "projects", label: t("icon.projects"), type: "folder", app: "projects" },
      { id: "browser", label: t("icon.browser"), type: "browser", app: "browser" },
      { id: "presentations", label: t("icon.presentations"), type: "pdf", app: "presentations" },
      { id: "experience", label: t("icon.experience"), type: "doc", app: "experience" },
      { id: "terminal", label: t("icon.terminal"), type: "terminal", app: "terminal" },
      { id: "settings", label: t("icon.settings"), type: "settings", app: "settings" },
      { id: "contact", label: t("icon.contact"), type: "link", app: "contact" },
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
        title: t("icon.about"),
        getTitle: () => t("icon.about"),
        width: 760,
        height: 560,
        x: 250,
        y: 126,
        content: renderAbout,
      }),
      projects: () => openWindow("projects", {
        title: t("title.projects"),
        getTitle: () => t("title.projects"),
        width: 920,
        height: 620,
        x: 180,
        y: 96,
        content: renderProjects,
      }),
      experience: () => openWindow("experience", {
        title: t("title.experience"),
        getTitle: () => t("title.experience"),
        width: 820,
        height: 560,
        x: 224,
        y: 120,
        content: renderExperience,
      }),
      browser: () => openBrowser(),
      presentations: () => openWindow("presentations", {
        title: t("title.presentations"),
        getTitle: () => t("title.presentations"),
        width: 760,
        height: 520,
        x: 250,
        y: 118,
        content: renderPresentations,
      }),
      terminal: () => openWindow(`terminal-${Date.now()}`, {
        title: t("title.terminal"),
        getTitle: () => t("title.terminal"),
        width: 680,
        height: 430,
        x: 330,
        y: 150,
        content: renderTerminal,
        refreshOnLocale: false,
      }),
      contact: () => openWindow("contact", {
        title: t("title.contact"),
        getTitle: () => t("title.contact"),
        width: 520,
        height: 340,
        x: 390,
        y: 170,
        content: renderContact,
      }),
      settings: () => openWindow("settings", {
        title: t("title.settings"),
        getTitle: () => t("title.settings"),
        width: 560,
        height: 390,
        x: 382,
        y: 142,
        content: renderSettings,
      }),
    };
    openers[app]?.();
  }

  function openProject(projectId) {
    const project = state.projects.find((item) => item.id === Number(projectId));
    if (!project) return;
    openWindow(`project-${project.id}`, {
      title: `${project.title}.app`,
      getTitle: () => `${state.projects.find((item) => item.id === Number(projectId))?.title || project.title}.app`,
      width: 880,
      height: 570,
      x: 210 + project.id * 8,
      y: 104 + project.id * 6,
      content: (container) => renderProjectDetail(container, state.projects.find((item) => item.id === Number(projectId)) || project),
    });
  }

  function openBrowser(initialUrl = "", label = t("title.browser")) {
    const id = `browser-${Date.now()}`;
    openWindow(id, {
      title: label,
      width: 980,
      height: 650,
      x: 150,
      y: 86,
      content: (container) => renderBrowser(container, initialUrl),
      refreshOnLocale: false,
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
      getTitle: () => {
        const current = state.presentations.find((item) => item.file === entry.file) || entry;
        return `${current.title}.pdf`;
      },
      width: 920,
      height: 660,
      x: 180,
      y: 84,
      content: (container) => renderPdfViewer(container, state.presentations.find((item) => item.file === entry.file) || entry),
    });
  }

  function openWindow(id, options) {
    const existing = state.windows.get(id);
    if (existing) {
      if (existing.frame.hidden) {
        restoreWindow(id);
      } else {
        focusWindow(id);
      }
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
    const minimizeControl = createWindowControl("minimize", "-", () => minimizeWindow(id));
    const maximizeControl = createWindowControl("maximize", "+", () => maximizeWindow(id));
    const closeControl = createWindowControl("close", "x", () => closeWindow(id));
    controls.append(minimizeControl, maximizeControl, closeControl);

    const content = document.createElement("div");
    content.className = "window-content";

    titlebar.append(title, controls);
    frame.append(titlebar, content, createResizeHandles());
    windowLayer.appendChild(frame);
    state.windows.set(id, {
      frame,
      titleEl: title,
      contentEl: content,
      closeControl,
      title: options.title,
      getTitle: options.getTitle,
      content: options.content,
      refreshOnLocale: options.refreshOnLocale !== false,
      animating: false,
    });

    options.content(content);
    makeWindowDraggable(frame, titlebar);
    makeWindowResizable(frame);
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

  function createResizeHandles() {
    const fragment = document.createDocumentFragment();
    ["n", "e", "s", "w", "ne", "nw", "se", "sw"].forEach((direction) => {
      const handle = document.createElement("span");
      handle.className = `resize-handle resize-${direction}`;
      handle.dataset.resize = direction;
      fragment.appendChild(handle);
    });
    return fragment;
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

  function makeWindowResizable(frame) {
    frame.querySelectorAll("[data-resize]").forEach((handle) => {
      let startX = 0;
      let startY = 0;
      let startRect = null;
      let resizing = false;
      const direction = handle.dataset.resize;

      handle.addEventListener("pointerdown", (event) => {
        if (frame.classList.contains("is-maximized")) return;
        resizing = true;
        startX = event.clientX;
        startY = event.clientY;
        startRect = {
          left: frame.offsetLeft,
          top: frame.offsetTop,
          width: frame.offsetWidth,
          height: frame.offsetHeight,
        };
        frame.classList.add("is-resizing");
        focusWindow(frame.dataset.windowId);
        handle.setPointerCapture(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
      });

      handle.addEventListener("pointermove", (event) => {
        if (!resizing || !startRect) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        applyWindowRect(frame, resizeRect(startRect, direction, dx, dy));
      });

      handle.addEventListener("pointerup", (event) => {
        if (!resizing) return;
        resizing = false;
        startRect = null;
        frame.classList.remove("is-resizing");
        handle.releasePointerCapture(event.pointerId);
      });

      handle.addEventListener("pointercancel", () => {
        resizing = false;
        startRect = null;
        frame.classList.remove("is-resizing");
      });
    });
  }

  function resizeRect(startRect, direction, dx, dy) {
    let left = startRect.left;
    let top = startRect.top;
    let width = startRect.width;
    let height = startRect.height;

    if (direction.includes("e")) width = startRect.width + dx;
    if (direction.includes("s")) height = startRect.height + dy;
    if (direction.includes("w")) {
      width = startRect.width - dx;
      left = startRect.left + dx;
    }
    if (direction.includes("n")) {
      height = startRect.height - dy;
      top = startRect.top + dy;
    }

    if (width < MIN_WINDOW_WIDTH) {
      if (direction.includes("w")) left = startRect.left + startRect.width - MIN_WINDOW_WIDTH;
      width = MIN_WINDOW_WIDTH;
    }
    if (height < MIN_WINDOW_HEIGHT) {
      if (direction.includes("n")) top = startRect.top + startRect.height - MIN_WINDOW_HEIGHT;
      height = MIN_WINDOW_HEIGHT;
    }

    return constrainRect({ left, top, width, height });
  }

  function applyWindowRect(frame, rect) {
    frame.style.left = `${rect.left}px`;
    frame.style.top = `${rect.top}px`;
    frame.style.width = `${rect.width}px`;
    frame.style.height = `${rect.height}px`;
  }

  function constrainRect(rect) {
    const minLeft = WINDOW_BOUNDS.left;
    const minTop = WINDOW_BOUNDS.top;
    const maxRight = window.innerWidth - WINDOW_BOUNDS.right;
    const maxBottom = window.innerHeight - WINDOW_BOUNDS.bottom;
    let width = Math.max(MIN_WINDOW_WIDTH, Math.min(rect.width, maxRight - minLeft));
    let height = Math.max(MIN_WINDOW_HEIGHT, Math.min(rect.height, maxBottom - minTop));
    let left = clamp(rect.left, minLeft, maxRight - width);
    let top = clamp(rect.top, minTop, maxBottom - height);

    if (left + width > maxRight) width = maxRight - left;
    if (top + height > maxBottom) height = maxBottom - top;

    return { left, top, width, height };
  }

  function constrainOpenWindows() {
    state.windows.forEach((win) => {
      if (win.frame.hidden || win.frame.classList.contains("is-maximized")) return;
      applyWindowRect(win.frame, constrainRect({
        left: win.frame.offsetLeft,
        top: win.frame.offsetTop,
        width: win.frame.offsetWidth,
        height: win.frame.offsetHeight,
      }));
    });
  }

  function focusWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    state.activeWindow = id;
    win.frame.style.zIndex = `${++state.z}`;
    renderTasks();
  }

  async function minimizeWindow(id) {
    const win = state.windows.get(id);
    if (!win || win.animating || win.frame.hidden) return;
    win.animating = true;
    renderTasks();
    const targetRect = getTaskTargetRect(win);
    await playGenieAnimation(win.frame, targetRect, "minimize");
    win.frame.hidden = true;
    win.animating = false;
    renderTasks();
  }

  function maximizeWindow(id) {
    const win = state.windows.get(id);
    if (!win || win.animating) return;
    win.frame.classList.toggle("is-maximized");
    focusWindow(id);
  }

  async function closeWindow(id) {
    const win = state.windows.get(id);
    if (!win || win.animating) return;
    win.animating = true;
    const targetRect = win.closeControl.getBoundingClientRect();
    await playGenieAnimation(win.frame, targetRect, "close");
    win.frame.remove();
    state.windows.delete(id);
    if (state.activeWindow === id) {
      state.activeWindow = [...state.windows.keys()].at(-1) || null;
    }
    renderTasks();
  }

  async function restoreWindow(id) {
    const win = state.windows.get(id);
    if (!win || win.animating || !win.frame.hidden) {
      if (win && !win?.frame.hidden) focusWindow(id);
      return;
    }

    win.animating = true;
    const sourceRect = getTaskTargetRect(win);
    win.frame.hidden = false;
    win.frame.style.visibility = "hidden";
    focusWindow(id);
    await playGenieAnimation(win.frame, sourceRect, "restore");
    win.frame.style.visibility = "";
    win.animating = false;
    renderTasks();
  }

  async function playGenieAnimation(frame, targetRect, mode) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frameRect = frame.getBoundingClientRect();
    if (!frameRect.width || !frameRect.height || !targetRect.width || !targetRect.height) return;

    const ghost = frame.cloneNode(true);
    ghost.classList.add("genie-ghost", `genie-${mode}`);
    ghost.removeAttribute("id");
    ghost.removeAttribute("data-window-id");
    ghost.setAttribute("aria-hidden", "true");
    Object.assign(ghost.style, {
      left: `${frameRect.left}px`,
      top: `${frameRect.top}px`,
      width: `${frameRect.width}px`,
      height: `${frameRect.height}px`,
      zIndex: `${++state.z + 200}`,
      visibility: "visible",
    });
    document.body.appendChild(ghost);

    const deltaX = targetRect.left + targetRect.width / 2 - (frameRect.left + frameRect.width / 2);
    const deltaY = targetRect.top + targetRect.height / 2 - (frameRect.top + frameRect.height / 2);
    const scaleX = clamp(targetRect.width / frameRect.width, 0.04, 0.32);
    const scaleY = clamp(targetRect.height / frameRect.height, 0.035, 0.22);
    const targetBias = clamp(((targetRect.left + targetRect.width / 2) - frameRect.left) / frameRect.width, 0.08, 0.92);

    const collapseFrames = [
      {
        opacity: 1,
        transform: "translate3d(0, 0, 0) scale(1, 1)",
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      },
      {
        offset: 0.52,
        opacity: 0.92,
        transform: `translate3d(${deltaX * 0.48}px, ${deltaY * 0.36}px, 0) scale(${Math.max(scaleX * 1.8, 0.28)}, 0.72)`,
        clipPath: `polygon(${targetBias * 42}% 0, ${100 - (1 - targetBias) * 42}% 0, 100% 100%, 0 100%)`,
      },
      {
        opacity: mode === "close" ? 0 : 0.24,
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
        clipPath: `polygon(${targetBias * 84}% 0, ${100 - (1 - targetBias) * 84}% 0, 100% 100%, 0 100%)`,
      },
    ];

    frame.style.visibility = "hidden";
    const keyframes = mode === "restore" ? [...collapseFrames].reverse() : collapseFrames;
    await ghost.animate(keyframes, {
      duration: mode === "restore" ? 360 : 420,
      easing: "cubic-bezier(0.2, 0.78, 0.18, 1)",
    }).finished.catch(() => {});
    ghost.remove();
    if (mode !== "restore") {
      frame.style.visibility = "";
    }
  }

  function getTaskTargetRect(win) {
    const target = win.taskButton || taskStrip || launcherButton;
    const rect = target.getBoundingClientRect();
    if (rect.width && rect.height) return rect;
    return launcherButton.getBoundingClientRect();
  }

  function renderTasks() {
    taskStrip.innerHTML = "";
    state.windows.forEach((win, id) => {
      const button = document.createElement("button");
      button.className = "task-button";
      button.type = "button";
      button.textContent = win.title;
      button.classList.toggle("is-active", state.activeWindow === id && !win.frame.hidden);
      button.classList.toggle("is-minimized", win.frame.hidden);
      button.addEventListener("click", () => {
        if (win.animating) return;
        if (!win.frame.hidden && state.activeWindow === id) {
          minimizeWindow(id);
          return;
        }
        if (win.frame.hidden) {
          restoreWindow(id);
          return;
        }
        focusWindow(id);
      });
      win.taskButton = button;
      taskStrip.appendChild(button);
    });
  }

  function renderWelcome(container) {
    const profile = state.introduce.profile;
    container.innerHTML = `
      <p class="panel-eyebrow">${escapeHtml(t("welcome.eyebrow"))}</p>
      <h1 class="panel-title">${escapeHtml(t("welcome.title"))}</h1>
      <p class="muted">
        ${escapeHtml(t("welcome.body", { name: state.locale === "ko" ? profile.nameKo : profile.nameEn }))}
      </p>
      <div class="rich-stack">
        <p>${escapeHtml(t("welcome.drag"))}</p>
        <p>${escapeHtml(t("welcome.menu"))}</p>
        <p>${escapeHtml(t("welcome.browser"))}</p>
        <p>${escapeHtml(t("welcome.presentations"))}</p>
        <p>${escapeHtml(t("welcome.terminal"))}</p>
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
              .map((link) => `<button class="action-link" type="button" data-browser-url="${escapeAttr(link.url)}" data-browser-title="${escapeAttr(project.title)}">${escapeHtml(link.name)} ${escapeHtml(t("projects.run"))}</button>`)
              .join("")}
            ${presentation ? `<button class="action-link" type="button" data-pdf-project="${escapeAttr(project.id)}">${escapeHtml(t("projects.openPresentation"))}</button>` : ""}
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
          <button class="browser-button" type="button" data-browser-back>${escapeHtml(t("browser.back"))}</button>
          <button class="browser-button" type="button" data-browser-forward>${escapeHtml(t("browser.forward"))}</button>
          <button class="browser-button" type="button" data-browser-reload>${escapeHtml(t("browser.reload"))}</button>
          <input class="browser-address" aria-label="Browser address" placeholder="${escapeAttr(t("browser.placeholder"))}" value="${escapeAttr(initialUrl)}" />
          <button class="browser-button" type="submit">${escapeHtml(t("browser.go"))}</button>
          <button class="browser-button" type="button" data-browser-engine>${escapeHtml(t("browser.engine"))}</button>
          <button class="browser-button" type="button" data-open-external>${escapeHtml(t("browser.newTab"))}</button>
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
    viewport.innerHTML = `<div class="browser-status">${escapeHtml(t("browser.loading", { url }))}</div>`;

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
        <div class="remote-browser-status">${escapeHtml(attempt === 1 ? t("browser.connecting") : t("browser.waking", { attempt }))}</div>
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
      status.textContent = t("browser.retrying", { reason, seconds: Math.round(delay / 1000) });
      window.setTimeout(() => {
        renderRemoteBrowser(viewport, url, endpoint, attempt + 1);
      }, delay);
    };

    const viewportSize = () => ({
      width: Math.max(320, Math.round(shell.clientWidth)),
      height: Math.max(240, Math.round(shell.clientHeight)),
    });

    socket.addEventListener("open", () => {
      status.textContent = t("browser.connected");
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
        retry(t("browser.wakingRetry"));
        return;
      }
      status.textContent = t("browser.disconnected");
    });

    socket.addEventListener("error", () => {
      retry(t("browser.connectionFailed"));
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
          <h1 class="panel-title">${escapeHtml(t("browser.engineTitle"))}</h1>
          <p class="muted">
            ${escapeHtml(t("browser.engineBody"))}
            <br />
            Local default: <strong>${escapeHtml(DEFAULT_LOCAL_BROWSER_WS)}</strong>
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
          <h1 class="panel-title">${escapeHtml(t("browser.engineRequired"))}</h1>
          <p class="muted">
            ${escapeHtml(t("browser.engineRequiredBody", { url }))}
          </p>
          <div class="command-box">cd remote-browser && npm install && npm start</div>
          <p class="muted">
            Local default: ${escapeHtml(DEFAULT_LOCAL_BROWSER_WS)}
          </p>
          <a class="action-link" href="${escapeAttr(url)}" target="_blank" rel="noreferrer">${escapeHtml(t("browser.openExternal"))}</a>
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
          <p class="panel-eyebrow">${escapeHtml(t("browser.blockedEyebrow"))}</p>
          <h1 class="panel-title">${escapeHtml(t("browser.blockedTitle"))}</h1>
          <p class="muted">
            ${escapeHtml(t("browser.blockedBody", { url }))}
          </p>
          <p class="muted">
            <strong>cd remote-browser && npm install && npm start</strong>
          </p>
          <p class="muted">Reason: ${escapeHtml(error.message)}</p>
          <a class="action-link" href="${escapeAttr(url)}" target="_blank" rel="noreferrer">${escapeHtml(t("browser.openExternal"))}</a>
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
        <p class="panel-eyebrow">${escapeHtml(t("browser.homeEyebrow"))}</p>
        <h1 class="panel-title">${escapeHtml(t("browser.homeTitle"))}</h1>
        <p class="muted">
          ${escapeHtml(t("browser.homeBody"))}
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
      <p class="panel-eyebrow">${escapeHtml(t("icon.presentations"))}</p>
      <h1 class="panel-title">${escapeHtml(t("icon.presentations"))}</h1>
      <p class="muted">
        ${escapeHtml(t("presentations.body"))}
      </p>
      <div class="pdf-list">
        ${entries.map((entry) => `
          <article class="pdf-row">
            <div>
              <h3>${escapeHtml(entry.title)}</h3>
              <p>${escapeHtml(entry.project?.title || "Project")} · ${escapeHtml(entry.filePath)}</p>
            </div>
            <button class="action-link" type="button" data-pdf-file="${escapeAttr(entry.file)}">${escapeHtml(isHtmlPresentation(entry) ? t("presentations.openBrowser") : t("presentations.openPdf"))}</button>
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
          <a class="action-link" href="${escapeAttr(entry.filePath)}" target="_blank" rel="noreferrer">${escapeHtml(t("pdf.newTab"))}</a>
        </div>
        <div class="pdf-body">
          <div class="pdf-missing">${escapeHtml(t("pdf.checking"))}</div>
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
              <strong>${escapeHtml(t("pdf.missingTitle"))}</strong>
              <span>${escapeHtml(t("pdf.missingBody", { path: entry.filePath }))}</span>
            </div>
          </div>
        `;
      });
  }

  function renderTerminal(container) {
    const output = [
      t("terminal.name"),
      t("terminal.helpHint"),
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
      print(t("terminal.help"));
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
      print(t("terminal.opened", { target }));
      return;
    }
    if (normalized === "clear") {
      output.splice(0, output.length);
      outputEl.textContent = "";
      return;
    }
    if (normalized === "date") {
      print(new Date().toLocaleString(localeTag()));
      return;
    }
    print(t("terminal.notFound", { command }));
  }

  function renderSettings(container) {
    container.innerHTML = `
      <div class="settings-panel">
        <p class="panel-eyebrow">${escapeHtml(t("settings.eyebrow"))}</p>
        <h1 class="panel-title">${escapeHtml(t("settings.title"))}</h1>
        <p class="muted">${escapeHtml(t("settings.body"))}</p>
        <div class="language-options">
          ${SUPPORTED_LOCALES.map((locale) => `
            <button class="language-option ${state.locale === locale ? "is-active" : ""}" type="button" data-locale="${escapeAttr(locale)}">
              <strong>${escapeHtml(t(`language.${locale}`))}</strong>
              <span>${state.locale === locale ? escapeHtml(t("settings.active")) : ""}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
    container.querySelectorAll("[data-locale]").forEach((button) => {
      button.addEventListener("click", () => setLocale(button.dataset.locale));
    });
  }

  function renderContact(container) {
    const profile = state.introduce.profile;
    container.innerHTML = `
      <p class="panel-eyebrow">Contact</p>
      <h1 class="panel-title">${escapeHtml(profile.nameKo)}</h1>
      <p class="muted">${escapeHtml(t("contact.body"))}</p>
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
          <h1>${escapeHtml(t("status.mountFailed"))}</h1>
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
    if (command === "open-settings") openApp("settings");
    if (command === "new-terminal") openApp("terminal");
    if (command === "arrange-icons") arrangeIcons();
    if (command === "about-shell") openWindow("shell-about", {
      title: t("title.shellAbout"),
      getTitle: () => t("title.shellAbout"),
      width: 520,
      height: 330,
      x: 410,
      y: 180,
      content: (container) => {
        container.innerHTML = `
          <p class="panel-eyebrow">DindbOS</p>
          <h1 class="panel-title">Web Desktop</h1>
          <p class="muted">
            ${escapeHtml(t("shellAbout.body"))}
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

  async function setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale) || locale === state.locale) return;
    state.locale = locale;
    saveLocale();
    applyLocaleChrome();
    systemStatus.textContent = t("status.languageSwitching");

    try {
      await mountLegacyData();
      renderDesktop();
      refreshLocaleSensitiveWindows();
      systemStatus.textContent = t("status.languageChanged", { language: t(`language.${locale}`) });
      prewarmRemoteBrowser();
    } catch (error) {
      systemStatus.textContent = t("status.mountFailed");
      renderError(error);
    }
  }

  function refreshLocaleSensitiveWindows() {
    state.windows.forEach((win) => {
      const nextTitle = win.getTitle?.() || win.title;
      win.title = nextTitle;
      win.titleEl.textContent = nextTitle;
      if (win.refreshOnLocale) {
        win.content(win.contentEl);
      }
    });
    renderTasks();
  }

  function applyLocaleChrome() {
    document.documentElement.lang = state.locale;
    document.title = state.locale === "ko"
      ? "DindbOS | Kim Dong Wook Portfolio"
      : "DindbOS | Kim Dong Wook Portfolio";
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
    if (bootCopy) bootCopy.textContent = t("boot.copy");
    if (systemStatus) systemStatus.textContent = t("status.mounting");
    if (languageToggle) {
      languageToggle.textContent = state.locale.toUpperCase();
      languageToggle.setAttribute("aria-label", t("language.toggle"));
      languageToggle.title = t("language.toggle");
    }
    document.querySelectorAll("[data-app]").forEach((button) => {
      button.textContent = t(`dock.${button.dataset.app}`) || button.textContent;
    });
    const contextLabels = {
      "open-projects": "context.openProjects",
      "open-browser": "context.openBrowser",
      "open-presentations": "context.openPresentations",
      "open-settings": "context.openSettings",
      "new-terminal": "context.newTerminal",
      "arrange-icons": "context.arrangeIcons",
      "about-shell": "context.aboutShell",
    };
    Object.entries(contextLabels).forEach(([command, key]) => {
      const button = contextMenu.querySelector(`[data-command="${command}"]`);
      if (button) button.textContent = t(key);
    });
    tickClock();
  }

  function t(key, replacements = {}) {
    const phrase = COPY[state.locale]?.[key] ?? COPY.ko[key] ?? key;
    return Object.entries(replacements).reduce((result, [name, value]) => (
      result.replaceAll(`{${name}}`, String(value))
    ), phrase);
  }

  function localeTag() {
    return state.locale === "en" ? "en-US" : "ko-KR";
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
        systemStatus.textContent = t("status.browserPinged");
      })
      .catch(() => {
        systemStatus.textContent = t("status.browserSleeping");
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
    clock.textContent = new Date().toLocaleTimeString(localeTag(), {
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

  function loadLocale() {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LOCALES.includes(saved) ? saved : "ko";
  }

  function saveLocale() {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, state.locale);
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
