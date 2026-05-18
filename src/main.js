import { createAndBootDindbOS } from "dindbos";
import "dindbos/styles.css";
import "./portfolio.css";
import {
  buildPortfolioFileSystem,
  CONTACT_LINKS,
  currentData,
  loadPortfolioRuntime,
  persistLocale,
  portfolioDataForBuiltin,
  SKILLS,
} from "./portfolio-data.js";

bootPortfolioOS();

async function bootPortfolioOS() {
  const runtime = await loadPortfolioRuntime();
  const data = currentData(runtime);

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
      includePortfolio: false,
      portfolioData: portfolioDataForBuiltin(data),
    },
    browserProvider: browserProvider(runtime.browserConfig),
    fileSystem: buildPortfolioFileSystem(runtime),
    apps: portfolioApps(runtime),
    launch: ["portfolio"],
    diagnostics: {
      evidence: [{
        id: "portfolio-host-restore",
        profile: "github-pages",
        status: "pass",
        runner: "DindbOS portfolio host",
        categories: ["sdk", "portfolio", "github-pages"],
        notes: "DindbOS boots from the installed package tarball and restores legacy portfolio data as apps and VFS files.",
      }],
    },
  });
}

function portfolioApps(runtime) {
  return [
    {
      id: "portfolio",
      name: "Portfolio",
      title: "Kim Dong Wook.app",
      icon: "portfolio",
      pinned: true,
      desktop: true,
      singleton: true,
      manifest: appManifest(),
      render: ({ content }) => registerView(runtime, "portfolio", content, renderAbout),
    },
    {
      id: "projects-portfolio",
      name: "Projects",
      title: "Projects.app",
      icon: "folder",
      pinned: true,
      desktop: true,
      singleton: true,
      manifest: appManifest(),
      render: ({ content }) => registerView(runtime, "projects", content, renderProjects),
    },
  ];
}

function appManifest() {
  return {
    capabilities: ["app.launch"],
    fileSystem: { read: ["/mnt/portfolio", "/home/kimdongwook"], write: [] },
  };
}

function registerView(runtime, id, content, render) {
  runtime.views.set(id, { content, render });
  render(content, runtime);
}

function refreshViews(runtime) {
  for (const view of runtime.views.values()) {
    if (view.content.isConnected) view.render(view.content, runtime);
  }
}

function renderAbout(content, runtime) {
  const data = currentData(runtime);
  const profile = data.introduce?.profile || {};
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-about" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("about", runtime)}
      <main class="portfolio-main-pane">
        <header class="portfolio-hero">
          <div>
            <p class="portfolio-kicker">Profile mounted from legacy archive</p>
            <h1>${escapeHtml(profile.nameEn || "Kim Dong Wook")}</h1>
            <p class="portfolio-subtitle">${escapeHtml([profile.nameKo, profile.role, profile.subtitle].filter(Boolean).join(" · "))}</p>
          </div>
          <div class="portfolio-language-pill">${runtime.locale.toUpperCase()}</div>
        </header>
        <section class="portfolio-profile-grid">
          <article class="portfolio-profile-card">
            ${profile.imageUrl ? `<img class="portfolio-avatar" src="${escapeAttr(profile.imageUrl)}" alt="${escapeAttr(profile.nameEn || "Profile")}">` : ""}
            <div class="portfolio-profile-copy">
              ${(profile.intro || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
            </div>
          </article>
          <aside class="portfolio-inspector-card">
            <h2>Contact</h2>
            <div class="portfolio-link-list">
              ${CONTACT_LINKS.map((link) => `<a href="${escapeAttr(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}
            </div>
            <h2>Mounted files</h2>
            <code>/home/kimdongwook/profile.md</code>
            <code>/mnt/portfolio/${escapeHtml(runtime.locale)}/introduce.json</code>
          </aside>
        </section>
        <section class="portfolio-section">
          <h2>${escapeHtml(data.introduce?.sectionTitle || "About")}</h2>
          <div class="portfolio-rich-text">
            ${(data.introduce?.details || []).map((paragraph) => `<p>${sanitizeTrustedLegacyHtml(paragraph)}</p>`).join("")}
          </div>
        </section>
        <section class="portfolio-section">
          <h2>Portfolio index</h2>
          <div class="portfolio-metric-row">
            <div><strong>${data.projects.length}</strong><span>Projects</span></div>
            <div><strong>${data.experiences.length}</strong><span>Experience groups</span></div>
            <div><strong>${unique(data.projects.flatMap((project) => project.techStacks)).length}</strong><span>Tech stacks</span></div>
          </div>
        </section>
      </main>
    </section>
  `;
  wireSidebar(content, runtime);
}

function renderProjects(content, runtime) {
  const data = currentData(runtime);
  const projects = filteredProjects(data.projects, runtime.projectFilter);
  const selected = data.projects.find((project) => project.id === runtime.selectedProjectId) || projects[0] || data.projects[0];
  if (selected) runtime.selectedProjectId = selected.id;

  content.innerHTML = `
    <section class="portfolio-os-app portfolio-os-app--plain portfolio-projects" data-locale="${escapeAttr(runtime.locale)}">
      <main class="portfolio-main-pane portfolio-finder">
        <header class="portfolio-toolbar">
          <div>
            <p class="portfolio-kicker">Projects Finder</p>
            <h1>Projects</h1>
          </div>
          <div class="portfolio-filter-group" role="group" aria-label="Project filters">
            ${renderFilterButton("all", "All", runtime.projectFilter)}
            ${renderFilterButton("category", "AI", runtime.projectFilter)}
            ${renderFilterButton("category", "Web", runtime.projectFilter)}
            ${renderFilterButton("category", "Mobile", runtime.projectFilter)}
            ${renderFilterButton("category", "Data Science", runtime.projectFilter)}
          </div>
        </header>
        <section class="portfolio-finder-layout">
          <div class="portfolio-project-list" role="listbox" aria-label="Projects">
            ${projects.map((project) => renderProjectRow(project, selected?.id)).join("")}
          </div>
          <article class="portfolio-detail-pane">
            ${selected ? renderProjectDetail(selected) : renderEmptyDetail()}
          </article>
        </section>
      </main>
    </section>
  `;

  content.querySelectorAll("[data-project-id]").forEach((button) => {
    button.addEventListener("click", () => {
      runtime.selectedProjectId = Number(button.dataset.projectId);
      renderProjects(content, runtime);
    });
  });
  content.querySelectorAll("[data-filter-type]").forEach((button) => {
    button.addEventListener("click", () => {
      runtime.projectFilter = {
        type: button.dataset.filterType,
        value: button.dataset.filterValue,
      };
      const nextProjects = filteredProjects(currentData(runtime).projects, runtime.projectFilter);
      runtime.selectedProjectId = nextProjects[0]?.id || currentData(runtime).projects[0]?.id;
      renderProjects(content, runtime);
    });
  });
}

function renderExperience(content, runtime) {
  const data = currentData(runtime);
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-experience" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("experience", runtime)}
      <main class="portfolio-main-pane">
        <header class="portfolio-hero">
          <div>
            <p class="portfolio-kicker">Experience.log</p>
            <h1>Experience</h1>
            <p class="portfolio-subtitle">Roles, achievements, and project links restored from legacy JSON.</p>
          </div>
        </header>
        <div class="portfolio-timeline">
          ${data.experiences.map((experience, index) => renderExperienceCard(experience, index)).join("")}
        </div>
      </main>
    </section>
  `;
  wireSidebar(content, runtime);
}

function renderSkills(content, runtime) {
  const data = currentData(runtime);
  const languages = unique([...SKILLS.languages, ...data.projects.flatMap((project) => project.languages)]);
  const techStacks = unique([...SKILLS.techStacks, ...data.projects.flatMap((project) => project.techStacks)]);
  const interests = unique([...SKILLS.interests, ...data.projects.flatMap((project) => project.categories)]);

  content.innerHTML = `
    <section class="portfolio-os-app portfolio-skills" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("skills", runtime)}
      <main class="portfolio-main-pane">
        <header class="portfolio-hero">
          <div>
            <p class="portfolio-kicker">Skills.app</p>
            <h1>Skills and interests</h1>
            <p class="portfolio-subtitle">Clicking a skill scopes the Projects app to matching work.</p>
          </div>
        </header>
        <section class="portfolio-skill-board">
          ${renderSkillGroup("Languages", languages, "language")}
          ${renderSkillGroup("Tech Stacks", techStacks, "tech")}
          ${renderSkillGroup("Interests", interests, "category")}
        </section>
      </main>
    </section>
  `;
  wireSidebar(content, runtime);
  content.querySelectorAll("[data-skill-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      runtime.projectFilter = {
        type: button.dataset.skillFilter,
        value: button.dataset.skillValue,
      };
      const nextProjects = filteredProjects(currentData(runtime).projects, runtime.projectFilter);
      runtime.selectedProjectId = nextProjects[0]?.id || runtime.selectedProjectId;
      refreshViews(runtime);
    });
  });
}

function renderSettings(content, runtime) {
  const data = currentData(runtime);
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-settings" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("settings", runtime)}
      <main class="portfolio-main-pane">
        <header class="portfolio-hero">
          <div>
            <p class="portfolio-kicker">System Preferences</p>
            <h1>Portfolio settings</h1>
            <p class="portfolio-subtitle">Language switches the restored legacy data across open portfolio apps.</p>
          </div>
        </header>
        <section class="portfolio-settings-list">
          <div class="portfolio-setting-row">
            <div>
              <strong>Language</strong>
              <span>Current data locale: ${escapeHtml(runtime.locale.toUpperCase())}</span>
            </div>
            <div class="portfolio-segmented" role="group" aria-label="Language">
              <button type="button" data-locale-choice="ko" class="${runtime.locale === "ko" ? "is-active" : ""}">한국어</button>
              <button type="button" data-locale-choice="en" class="${runtime.locale === "en" ? "is-active" : ""}">English</button>
            </div>
          </div>
          <div class="portfolio-setting-row">
            <div>
              <strong>Data mounted</strong>
              <span>${data.projects.length} projects · ${data.experiences.length} experience groups · ${runtime.presentations.length} decks</span>
            </div>
            <code>/mnt/portfolio/${escapeHtml(runtime.locale)}</code>
          </div>
          <div class="portfolio-setting-row">
            <div>
              <strong>DindbOS runtime</strong>
              <span>SDK package host with Files, Terminal, Portfolio apps, and mounted VFS.</span>
            </div>
            <code>IndexedDB storage</code>
          </div>
        </section>
      </main>
    </section>
  `;
  wireSidebar(content, runtime);
  content.querySelectorAll("[data-locale-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      runtime.locale = persistLocale(button.dataset.localeChoice);
      runtime.selectedProjectId = currentData(runtime).projects[0]?.id || runtime.selectedProjectId;
      refreshViews(runtime);
    });
  });
}

function renderAppSidebar(active, runtime) {
  const items = [
    ["about", "About", "Profile"],
    ["experience", "Experience", "Timeline"],
    ["skills", "Skills", "Filters"],
    ["settings", "Preferences", "Language"],
    ["contact", "Contact", "Contact.url"],
  ];
  return `
    <aside class="portfolio-sidebar">
      <div class="portfolio-sidebar-title">
        <strong>DindbOS</strong>
        <span>${escapeHtml(runtime.locale.toUpperCase())}</span>
      </div>
      <nav class="portfolio-sidebar-nav" aria-label="Portfolio sections">
        ${items.map(([id, label, meta]) => `
          <button type="button" class="${active === id ? "is-active" : ""}" data-sidebar-target="${escapeAttr(id)}">
            <span>${escapeHtml(label)}</span>
            <small>${escapeHtml(meta)}</small>
          </button>
        `).join("")}
      </nav>
      <div class="portfolio-sidebar-foot">
        <span>${currentData(runtime).projects.length} projects restored</span>
      </div>
    </aside>
  `;
}

function wireSidebar(content, runtime) {
  content.querySelectorAll("[data-sidebar-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.sidebarTarget;
      if (target === "contact") {
        window.open(CONTACT_LINKS[0].href, "_blank", "noreferrer");
        return;
      }
      const view = runtime.views.get(target);
      if (view) {
        view.render(view.content, runtime);
        return;
      }
      renderInlineView(target, content, runtime);
    });
  });
}

function renderInlineView(target, content, runtime) {
  const renderers = {
    about: renderAbout,
    projects: renderProjects,
    experience: renderExperience,
    skills: renderSkills,
    settings: renderSettings,
  };
  const renderer = renderers[target];
  if (!renderer) return;
  for (const [viewId, view] of runtime.views.entries()) {
    if (view.content === content) {
      runtime.views.set(viewId, { content, render: renderer });
      break;
    }
  }
  renderer(content, runtime);
}

function renderFilterButton(type, value, activeFilter) {
  const active = activeFilter.type === type && activeFilter.value === value;
  return `
    <button type="button" class="${active ? "is-active" : ""}" data-filter-type="${escapeAttr(type)}" data-filter-value="${escapeAttr(value)}">
      ${escapeHtml(value)}
    </button>
  `;
}

function renderProjectRow(project, selectedId) {
  const cover = project.media[0];
  return `
    <button type="button" class="portfolio-project-row ${project.id === selectedId ? "is-selected" : ""}" data-project-id="${project.id}">
      <span class="portfolio-project-cover">
        ${cover ? renderMedia(cover, project.title, true) : "<span>No media</span>"}
      </span>
      <span class="portfolio-project-summary">
        <strong>${escapeHtml(project.title)}</strong>
        <small>${escapeHtml(project.role)}</small>
        <span>${escapeHtml(firstText(project.description))}</span>
      </span>
      <span class="portfolio-project-count">${project.media.length}</span>
    </button>
  `;
}

function renderProjectDetail(project) {
  return `
    <div class="portfolio-detail-header">
      <p class="portfolio-kicker">Project Detail</p>
      <h2>${escapeHtml(project.title)}</h2>
      <p>${escapeHtml(project.role)}</p>
    </div>
    <div class="portfolio-tag-row">
      ${[...project.categories, ...project.languages, ...project.techStacks].map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
    <div class="portfolio-media-grid">
      ${project.media.map((item) => renderMedia(item, project.title, false)).join("")}
    </div>
    <section class="portfolio-detail-section">
      <h3>Project introduction</h3>
      ${project.description.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    </section>
    <section class="portfolio-detail-section">
      <h3>Details</h3>
      <ul>
        ${project.extraDescription.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ul>
    </section>
    <section class="portfolio-detail-section">
      <h3>Links</h3>
      <div class="portfolio-link-list">
        ${project.links.map((link) => `<a href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.name || "Open")}</a>`).join("")}
        ${project.deck ? `<a href="/assets/presentations/${escapeAttr(project.deck.file)}" target="_blank" rel="noreferrer">Open presentation</a>` : ""}
      </div>
    </section>
  `;
}

function renderEmptyDetail() {
  return `
    <div class="portfolio-empty">
      <h2>No project selected</h2>
      <p>Choose a project from the Finder list.</p>
    </div>
  `;
}

function renderMedia(item, title, compact) {
  if (item.type === "video") {
    return `<video class="${compact ? "is-compact" : ""}" src="${escapeAttr(item.src)}" autoplay loop muted playsinline aria-label="${escapeAttr(title)}"></video>`;
  }
  return `<img class="${compact ? "is-compact" : ""}" src="${escapeAttr(item.src)}" alt="${escapeAttr(title)}">`;
}

function renderExperienceCard(experience, index) {
  return `
    <article class="portfolio-timeline-card">
      <div class="portfolio-timeline-index">${String(index + 1).padStart(2, "0")}</div>
      <div class="portfolio-timeline-body">
        <header>
          <h2>${escapeHtml(experience.groupName || experience.title || "Experience")}</h2>
          <p>${escapeHtml([experience.position, experience.period].filter(Boolean).join(" · "))}</p>
        </header>
        <ul>
          ${(experience.description || []).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
        </ul>
        <div class="portfolio-mini-projects">
          ${(experience.projects || []).map((project) => `<span>${escapeHtml(project)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderSkillGroup(title, values, filterType) {
  return `
    <article class="portfolio-skill-group">
      <h2>${escapeHtml(title)}</h2>
      <div class="portfolio-skill-pills">
        ${values.map((value) => `
          <button type="button" data-skill-filter="${escapeAttr(filterType)}" data-skill-value="${escapeAttr(value)}">
            ${escapeHtml(value)}
          </button>
        `).join("")}
      </div>
    </article>
  `;
}

function filteredProjects(projects, filter) {
  if (!filter || filter.type === "all") return projects;
  return projects.filter((project) => {
    if (filter.type === "category") return project.categories.includes(filter.value);
    if (filter.type === "language") return project.languages.includes(filter.value);
    if (filter.type === "tech") return project.techStacks.includes(filter.value);
    return true;
  });
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

function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function firstText(value) {
  if (Array.isArray(value)) return String(value.find(Boolean) || "");
  return String(value || "");
}

function sanitizeTrustedLegacyHtml(value) {
  return escapeHtml(value)
    .replaceAll("&lt;br&gt;", "<br>")
    .replaceAll("&lt;br/&gt;", "<br>")
    .replaceAll("&lt;br /&gt;", "<br>");
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
