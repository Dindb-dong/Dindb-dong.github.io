import { createAndBootDindbOS } from "dindbos";
import "dindbos/styles.css";
import "./portfolio.css";

const LEGACY_BASE = "/legacy/public";
const PRESENTATIONS_MANIFEST = "/assets/presentations/manifest.json";

bootPortfolioOS();

async function bootPortfolioOS() {
  const [projectsJson, introduce, experiences, presentations, browserConfig] = await Promise.all([
    fetchJson(`${LEGACY_BASE}/projectDetails.json`),
    fetchJson(`${LEGACY_BASE}/introduce.json`),
    fetchJson(`${LEGACY_BASE}/experiences.json`),
    fetchJson(PRESENTATIONS_MANIFEST).catch(() => []),
    fetchJson("/remote-browser.config.json").catch(() => ({})),
  ]);
  const projects = Object.entries(projectsJson).map(([id, project]) => ({
    id: Number(id),
    ...project,
  }));
  const portfolioData = {
    name: introduce?.profile?.nameEn || "Kim Dong Wook",
    summary: [
      introduce?.profile?.role || "Full-Stack AI Engineer",
      introduce?.profile?.subtitle || "",
      "Mounted as a real DindbOS browser runtime.",
    ].filter(Boolean).join(" · "),
    projects: projects.map((project) => ({
      name: project.title,
      type: [project.role, ...(project.categories || [])].filter(Boolean).join(" · "),
      description: firstText(project.description) || firstText(project.extraDescription) || "Portfolio project mounted from legacy data.",
    })),
  };

  await createAndBootDindbOS({
    root: "#app",
    session: {
      user: "kimdongwook",
      product: "DindbOS Portfolio",
      home: "/home/kimdongwook",
      groups: ["users", "portfolio"],
    },
    storage: {
      backend: "indexeddb",
      name: "dindbos-portfolio-runtime",
    },
    builtins: {
      includePortfolio: true,
      portfolioData,
    },
    browserProvider: browserProvider(browserConfig),
    fileSystem: portfolioFileSystem({ projects, introduce, experiences, presentations }),
    apps: portfolioApps({ projects, introduce, experiences, presentations }),
    launch: ["portfolio", "files", "terminal"],
    diagnostics: {
      evidence: [{
        id: "portfolio-host-install",
        profile: "github-pages",
        status: "pass",
        runner: "DindbOS portfolio host",
        categories: ["sdk", "portfolio", "github-pages"],
        notes: "DindbOS boots from the installed npm package tarball and mounts legacy portfolio data into the VFS.",
      }],
    },
  });
}

function portfolioApps(data) {
  return [
    {
      id: "about-portfolio",
      name: "About",
      title: "About Kim.app",
      icon: "text",
      pinned: true,
      singleton: true,
      width: 760,
      height: 560,
      manifest: {
        capabilities: ["app.launch"],
        fileSystem: { read: ["/mnt/portfolio"], write: [] },
      },
      render: ({ content }) => renderAbout(content, data.introduce, data.experiences),
    },
    {
      id: "projects-portfolio",
      name: "Projects",
      title: "Projects.app",
      icon: "folder",
      pinned: true,
      singleton: true,
      width: 920,
      height: 640,
      manifest: {
        capabilities: ["app.launch"],
        fileSystem: { read: ["/mnt/portfolio"], write: [] },
      },
      render: ({ content }) => renderProjects(content, data.projects, data.presentations),
    },
  ];
}

function renderAbout(content, introduce, experiences) {
  const profile = introduce?.profile || {};
  content.innerHTML = `
    <section class="portfolio-host-app">
      <header class="portfolio-host-hero">
        <p class="dos-kicker">About</p>
        <h1>${escapeHtml(profile.nameEn || "Kim Dong Wook")}</h1>
        <p>${escapeHtml(profile.role || "Full-Stack AI Engineer")} · ${escapeHtml(profile.subtitle || "")}</p>
        ${(profile.intro || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </header>
      <section class="portfolio-host-section">
        <h2>Experience</h2>
        <div class="portfolio-host-grid">
          ${(experiences || []).map((entry) => `
            <article class="portfolio-host-card">
              <strong>${escapeHtml(entry.title || entry.company || "Experience")}</strong>
              <span>${escapeHtml([entry.period, entry.role].filter(Boolean).join(" · "))}</span>
              <p>${escapeHtml(firstText(entry.description || entry.details) || "")}</p>
            </article>
          `).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderProjects(content, projects, presentations) {
  content.innerHTML = `
    <section class="portfolio-host-app">
      <header class="portfolio-host-hero">
        <p class="dos-kicker">Projects</p>
        <h1>Mounted Portfolio Projects</h1>
        <p>Legacy project JSON is now mounted through DindbOS and mirrored under /mnt/portfolio.</p>
      </header>
      <div class="portfolio-host-grid">
        ${projects.map((project) => {
          const deck = presentations.find((entry) => Number(entry.projectId) === Number(project.id));
          return `
            <article class="portfolio-host-card">
              <strong>${escapeHtml(project.title)}</strong>
              <span>${escapeHtml(project.role || "Project")}</span>
              <p>${escapeHtml(firstText(project.description) || firstText(project.extraDescription) || "")}</p>
              <div class="portfolio-host-tags">
                ${(project.categories || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
              </div>
              ${(project.links || []).map((link) => `<a href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.name || "Open")}</a>`).join("")}
              ${deck ? `<a href="/assets/presentations/${escapeAttr(deck.file)}" target="_blank" rel="noreferrer">Open deck</a>` : ""}
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function portfolioFileSystem({ projects, introduce, experiences, presentations }) {
  return {
    "/etc/motd": [
      "Welcome to DindbOS Portfolio.",
      "This runtime is installed from the DindbOS SDK package.",
      "Try: ls /mnt/portfolio, cat /home/kimdongwook/readme.md, open /mnt/portfolio/projects.json",
    ].join("\n"),
    "/home/kimdongwook/readme.md": [
      "# Kim Dong Wook Portfolio",
      "",
      "This site now boots as a real DindbOS runtime.",
      "Open Files.app, Terminal.app, Settings.app, or Portfolio.app to inspect the mounted data.",
      "",
      "- `/mnt/portfolio/projects.json`",
      "- `/mnt/portfolio/introduce.json`",
      "- `/mnt/portfolio/experiences.json`",
      "- `/mnt/portfolio/presentations.json`",
    ].join("\n"),
    "/home/kimdongwook/Desktop/README.md": "symlink:/home/kimdongwook/readme.md",
    "/mnt/portfolio/projects.json": `${JSON.stringify(projects, null, 2)}\n`,
    "/mnt/portfolio/introduce.json": `${JSON.stringify(introduce, null, 2)}\n`,
    "/mnt/portfolio/experiences.json": `${JSON.stringify(experiences, null, 2)}\n`,
    "/mnt/portfolio/presentations.json": `${JSON.stringify(presentations, null, 2)}\n`,
    ...Object.fromEntries(projects.map((project) => [
      `/mnt/portfolio/projects/${safeFileName(project.title)}.md`,
      projectMarkdown(project, presentations.find((entry) => Number(entry.projectId) === Number(project.id))),
    ])),
  };
}

function projectMarkdown(project, deck) {
  return [
    `# ${project.title}`,
    "",
    `Role: ${project.role || "-"}`,
    `Categories: ${(project.categories || []).join(", ") || "-"}`,
    `Languages: ${(project.languages || []).join(", ") || "-"}`,
    `Tech: ${(project.techStacks || []).join(", ") || "-"}`,
    "",
    ...(project.description || []),
    "",
    ...(project.extraDescription || []),
    "",
    ...(project.links || []).map((link) => `- [${link.name || "Open"}](${link.url})`),
    deck ? `- [Presentation](/assets/presentations/${deck.file})` : "",
  ].filter(Boolean).join("\n");
}

function browserProvider(config) {
  const production = location.hostname && location.hostname !== "127.0.0.1" && location.hostname !== "localhost";
  return {
    browserProviderUrl: production
      ? config.productionWebSocketUrl
      : config.localWebSocketUrl || config.productionWebSocketUrl,
    browserProviderLabel: production ? "Render Remote Chromium" : "Local Remote Chromium",
  };
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

function firstText(value) {
  if (Array.isArray(value)) return String(value.find(Boolean) || "");
  return String(value || "");
}

function safeFileName(value) {
  return String(value || "project")
    .replace(/[^\p{Letter}\p{Number}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "project";
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
