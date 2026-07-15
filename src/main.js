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
      width: 1180,
      height: 760,
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
      width: 1220,
      height: 780,
      manifest: appManifest(),
      render: ({ content }) => registerView(runtime, "projects", content, renderProjects),
    },
    {
      id: "resume",
      name: "Resume",
      title: "Resume.app",
      icon: "document",
      pinned: true,
      desktop: true,
      singleton: true,
      width: 1100,
      height: 780,
      manifest: appManifest(),
      render: ({ content }) => registerView(runtime, "resume", content, renderResume),
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
  const featuredProjects = [...data.projects].slice(-3).reverse();
  const copy = runtime.locale === "ko" ? {
    eyebrow: "FULL-STACK AI ENGINEER",
    lead: "AI 모델부터 제품 경험까지 직접 설계하고 구현합니다.",
    projects: "프로젝트 보기",
    resume: "이력서 열기",
    github: "GitHub",
    featured: "대표 프로젝트",
    featuredDescription: "최근 작업과 기술적 범위를 빠르게 살펴보세요.",
    viewAll: "전체 프로젝트",
    story: data.introduce?.sectionTitle || "소개",
    projectLabel: "프로젝트",
    experienceLabel: "경험 그룹",
    stackLabel: "기술 스택",
    systemLabel: "DindbOS에서 실행 중",
  } : {
    eyebrow: "FULL-STACK AI ENGINEER",
    lead: "I design and build the whole path from AI models to product experiences.",
    projects: "View projects",
    resume: "Open resume",
    github: "GitHub",
    featured: "Featured projects",
    featuredDescription: "A quick look at recent work and technical range.",
    viewAll: "View all projects",
    story: data.introduce?.sectionTitle || "About",
    projectLabel: "Projects",
    experienceLabel: "Experience groups",
    stackLabel: "Tech stacks",
    systemLabel: "Running on DindbOS",
  };
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-about" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("about", runtime)}
      <main class="portfolio-main-pane">
        <header class="portfolio-hero portfolio-hero--profile">
          <div class="portfolio-identity">
            <img class="portfolio-avatar" src="/assets/images/kim-dong-wook.png" alt="${escapeAttr(profile.nameEn || "Kim Dong Wook")}">
            <div>
              <p class="portfolio-kicker">${copy.eyebrow}</p>
              <h1>${escapeHtml(profile.nameEn || "Kim Dong Wook")}</h1>
              <p class="portfolio-name-ko">${escapeHtml(profile.nameKo || "김동욱")}</p>
              <p class="portfolio-subtitle">${escapeHtml(profile.subtitle || "")}</p>
            </div>
          </div>
          <div class="portfolio-hero-copy">
            <p>${escapeHtml(copy.lead)}</p>
            <div class="portfolio-action-row">
              <button class="portfolio-action portfolio-action--primary" type="button" data-sidebar-target="projects">${copy.projects}</button>
              <button class="portfolio-action" type="button" data-sidebar-target="resume">${copy.resume}</button>
              <a class="portfolio-action" href="${escapeAttr(CONTACT_LINKS[0].href)}" target="_blank" rel="noreferrer">${copy.github}</a>
            </div>
          </div>
        </header>
        <section class="portfolio-metric-row" aria-label="Portfolio summary">
          <div><strong>${data.projects.length}</strong><span>${copy.projectLabel}</span></div>
          <div><strong>${data.experiences.length}</strong><span>${copy.experienceLabel}</span></div>
          <div><strong>${unique(data.projects.flatMap((project) => project.techStacks)).length}</strong><span>${copy.stackLabel}</span></div>
        </section>
        <section class="portfolio-section portfolio-featured-section">
          <div class="portfolio-section-heading">
            <div>
              <p class="portfolio-kicker">WORK / 2026</p>
              <h2>${copy.featured}</h2>
              <p>${copy.featuredDescription}</p>
            </div>
            <button class="portfolio-text-action" type="button" data-sidebar-target="projects">${copy.viewAll} →</button>
          </div>
          <div class="portfolio-featured-grid">
            ${featuredProjects.map((project) => renderFeaturedProject(project)).join("")}
          </div>
        </section>
        <section class="portfolio-section portfolio-story-section">
          <div class="portfolio-section-heading">
            <div>
              <p class="portfolio-kicker">PROFILE</p>
              <h2>${escapeHtml(copy.story)}</h2>
            </div>
          </div>
          <div class="portfolio-rich-text">
            ${(data.introduce?.details || []).map((paragraph) => `<p>${sanitizeTrustedLegacyHtml(paragraph)}</p>`).join("")}
          </div>
        </section>
        <footer class="portfolio-runtime-note"><span aria-hidden="true"></span>${copy.systemLabel} · v0.1.1</footer>
      </main>
    </section>
  `;
  wireSidebar(content, runtime);
}

function renderProjects(content, runtime) {
  const data = currentData(runtime);
  const projects = filteredProjects(data.projects, runtime.projectFilter, runtime.projectQuery);
  const selected = data.projects.find((project) => project.id === runtime.selectedProjectId) || projects[0] || data.projects[0];
  if (selected && projects.some((project) => project.id === selected.id)) runtime.selectedProjectId = selected.id;
  const copy = runtime.locale === "ko" ? {
    eyebrow: "PROJECT ARCHIVE",
    title: "프로젝트",
    description: "역할, 기술, 결과를 기준으로 작업을 탐색하세요.",
    search: "프로젝트 검색",
    placeholder: "제목, 역할, 기술 검색",
    count: `${projects.length}개 프로젝트`,
  } : {
    eyebrow: "PROJECT ARCHIVE",
    title: "Projects",
    description: "Explore work by role, technology, and outcome.",
    search: "Search projects",
    placeholder: "Search title, role, or technology",
    count: `${projects.length} projects`,
  };

  content.innerHTML = `
    <section class="portfolio-os-app portfolio-projects" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("projects", runtime)}
      <main class="portfolio-main-pane portfolio-finder">
        <header class="portfolio-toolbar">
          <div>
            <p class="portfolio-kicker">${copy.eyebrow}</p>
            <h1>${copy.title}</h1>
            <p class="portfolio-subtitle">${copy.description}</p>
          </div>
          <label class="portfolio-search-field">
            <span>${copy.search}</span>
            <input type="search" value="${escapeAttr(runtime.projectQuery || "")}" placeholder="${escapeAttr(copy.placeholder)}" data-project-search>
          </label>
        </header>
        <div class="portfolio-filter-bar">
          <div class="portfolio-filter-group" role="group" aria-label="Project filters">
            ${renderFilterButton("all", "All", runtime.projectFilter)}
            ${renderFilterButton("category", "AI", runtime.projectFilter)}
            ${renderFilterButton("category", "Web", runtime.projectFilter)}
            ${renderFilterButton("category", "Mobile", runtime.projectFilter)}
            ${renderFilterButton("category", "Data Science", runtime.projectFilter)}
          </div>
          <p class="portfolio-result-count" role="status">${copy.count}</p>
        </div>
        <section class="portfolio-finder-layout">
          <div class="portfolio-project-list" role="listbox" aria-label="Projects">
            ${projects.length ? projects.map((project) => renderProjectRow(project, selected?.id)).join("") : renderProjectListEmpty(runtime)}
          </div>
          <article class="portfolio-detail-pane">
            ${selected && projects.some((project) => project.id === selected.id) ? renderProjectDetail(selected, runtime) : renderEmptyDetail(runtime)}
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
      const nextProjects = filteredProjects(currentData(runtime).projects, runtime.projectFilter, runtime.projectQuery);
      runtime.selectedProjectId = nextProjects[0]?.id || currentData(runtime).projects[0]?.id;
      renderProjects(content, runtime);
    });
  });
  const search = content.querySelector("[data-project-search]");
  search?.addEventListener("input", () => {
    runtime.projectQuery = search.value;
    const nextProjects = filteredProjects(currentData(runtime).projects, runtime.projectFilter, runtime.projectQuery);
    runtime.selectedProjectId = nextProjects[0]?.id || null;
    renderProjects(content, runtime);
    content.querySelector("[data-project-search]")?.focus();
  });
  content.querySelector("[data-project-reset]")?.addEventListener("click", () => {
    runtime.projectQuery = "";
    runtime.projectFilter = { type: "all", value: "All" };
    runtime.selectedProjectId = currentData(runtime).projects[0]?.id || null;
    renderProjects(content, runtime);
  });
  wireSidebar(content, runtime);
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

function renderResume(content, runtime) {
  const copy = runtime.locale === "ko" ? {
    eyebrow: "RESUME",
    title: "이력서",
    description: "경력과 기술을 한 페이지 문서로 확인하거나 PDF로 내려받으세요.",
    html: "HTML로 열기",
    pdf: "PDF로 열기",
  } : {
    eyebrow: "RESUME",
    title: "Resume",
    description: "Review experience and skills in one page, or open the PDF export.",
    html: "Open HTML",
    pdf: "Open PDF",
  };
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-resume-app" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("resume", runtime)}
      <main class="portfolio-main-pane">
        <header class="portfolio-toolbar">
          <div>
            <p class="portfolio-kicker">${copy.eyebrow}</p>
            <h1>${copy.title}</h1>
            <p class="portfolio-subtitle">${copy.description}</p>
          </div>
          <div class="portfolio-link-list portfolio-link-list--toolbar">
            <a href="/resume.html" target="_blank" rel="noreferrer">${copy.html}</a>
            <a href="/resume.pdf" target="_blank" rel="noreferrer">${copy.pdf}</a>
          </div>
        </header>
        <section class="portfolio-resume-frame-shell">
          <iframe
            class="portfolio-resume-frame"
            src="/resume.html"
            title="Kim Dong Wook Resume"
            loading="lazy"
            referrerpolicy="no-referrer"
          ></iframe>
        </section>
      </main>
    </section>
  `;
  wireSidebar(content, runtime);
}

function renderAppSidebar(active, runtime) {
  const items = runtime.locale === "ko" ? [
    ["about", "개요", "Profile"],
    ["projects", "프로젝트", "16 works"],
    ["experience", "경험", "Timeline"],
    ["skills", "기술", "Capabilities"],
    ["resume", "이력서", "resume.pdf"],
    ["settings", "설정", "Language"],
    ["contact", "연락하기", "GitHub"],
  ] : [
    ["about", "Overview", "Profile"],
    ["projects", "Projects", "16 works"],
    ["experience", "Experience", "Timeline"],
    ["skills", "Skills", "Capabilities"],
    ["resume", "Resume", "resume.pdf"],
    ["settings", "Settings", "Language"],
    ["contact", "Contact", "GitHub"],
  ];
  return `
    <aside class="portfolio-sidebar">
      <div class="portfolio-sidebar-title">
        <span class="portfolio-sidebar-mark" aria-hidden="true">D</span>
        <strong>Kim Dong Wook</strong>
        <span>${escapeHtml(runtime.locale.toUpperCase())}</span>
      </div>
      <nav class="portfolio-sidebar-nav" aria-label="Portfolio sections">
        ${items.map(([id, label, meta]) => `
          <button type="button" class="${active === id ? "is-active" : ""}" data-sidebar-target="${escapeAttr(id)}" ${active === id ? 'aria-current="page"' : ""}>
            <span>${escapeHtml(label)}</span>
            <small>${escapeHtml(meta)}</small>
          </button>
        `).join("")}
      </nav>
      <div class="portfolio-sidebar-foot">
        <span class="portfolio-status-dot" aria-hidden="true"></span>
        <span>${currentData(runtime).projects.length} projects · available</span>
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
  content.querySelectorAll("[data-featured-project]").forEach((button) => {
    button.addEventListener("click", () => {
      runtime.selectedProjectId = Number(button.dataset.featuredProject);
      runtime.projectFilter = { type: "all", value: "All" };
      runtime.projectQuery = "";
      renderInlineView("projects", content, runtime);
    });
  });
}

function renderInlineView(target, content, runtime) {
  const renderers = {
    about: renderAbout,
    projects: renderProjects,
    resume: renderResume,
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
  const cover = project.media.find((item) => item.type === "image") || project.media[0];
  return `
    <button type="button" role="option" aria-selected="${project.id === selectedId}" class="portfolio-project-row ${project.id === selectedId ? "is-selected" : ""}" data-project-id="${project.id}">
      <span class="portfolio-project-cover">
        ${cover ? renderMedia(cover, project.title, true) : "<span>No media</span>"}
      </span>
      <span class="portfolio-project-summary">
        <strong>${escapeHtml(project.title)}</strong>
        <small>${escapeHtml(project.role)}</small>
        <span>${escapeHtml(firstText(project.description))}</span>
      </span>
      <span class="portfolio-project-count" aria-label="${project.media.length} media">${project.media.length}</span>
    </button>
  `;
}

function renderFeaturedProject(project) {
  const cover = project.media.find((item) => item.type === "image") || project.media[0];
  return `
    <button class="portfolio-featured-project" type="button" data-featured-project="${project.id}">
      <span class="portfolio-featured-media">${cover ? renderMedia(cover, project.title, true) : ""}</span>
      <span class="portfolio-featured-copy">
        <small>${escapeHtml(project.role || project.categories[0] || "Project")}</small>
        <strong>${escapeHtml(project.title)}</strong>
        <span>${escapeHtml(firstText(project.description))}</span>
      </span>
      <span class="portfolio-featured-arrow" aria-hidden="true">↗</span>
    </button>
  `;
}

function renderProjectDetail(project, runtime) {
  const previewMedia = [...project.media].sort((left, right) => Number(left.type === "video") - Number(right.type === "video")).slice(0, 3);
  const copy = runtime.locale === "ko" ? {
    detail: "PROJECT DETAIL",
    introduction: "프로젝트 소개",
    details: "주요 작업",
    links: "관련 링크",
    moreMedia: `외 ${Math.max(0, project.media.length - 3)}개 미디어`,
  } : {
    detail: "PROJECT DETAIL",
    introduction: "Introduction",
    details: "Key work",
    links: "Links",
    moreMedia: `${Math.max(0, project.media.length - 3)} more media`,
  };
  return `
    <div class="portfolio-detail-header">
      <p class="portfolio-kicker">${copy.detail}</p>
      <h2>${escapeHtml(project.title)}</h2>
      <p>${escapeHtml(project.role)}</p>
    </div>
    <div class="portfolio-tag-row">
      ${[...project.categories, ...project.languages, ...project.techStacks].map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
    <div class="portfolio-media-grid">
      ${previewMedia.map((item) => renderMedia(item, project.title, false)).join("")}
      ${project.media.length > 3 ? `<span class="portfolio-more-media">${copy.moreMedia}</span>` : ""}
    </div>
    <section class="portfolio-detail-section">
      <h3>${copy.introduction}</h3>
      ${project.description.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    </section>
    <section class="portfolio-detail-section">
      <h3>${copy.details}</h3>
      <ul>
        ${project.extraDescription.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ul>
    </section>
    <section class="portfolio-detail-section">
      <h3>${copy.links}</h3>
      <div class="portfolio-link-list">
        ${project.links.map((link) => `<a href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.name || "Open")}</a>`).join("")}
        ${project.deck ? `<a href="/assets/presentations/${escapeAttr(project.deck.file)}" target="_blank" rel="noreferrer">Open presentation</a>` : ""}
      </div>
    </section>
  `;
}

function renderEmptyDetail(runtime) {
  return `
    <div class="portfolio-empty">
      <h2>${runtime.locale === "ko" ? "프로젝트를 찾지 못했습니다" : "No project found"}</h2>
      <p>${runtime.locale === "ko" ? "검색어나 필터를 바꿔보세요." : "Try another search or filter."}</p>
    </div>
  `;
}

function renderProjectListEmpty(runtime) {
  return `
    <div class="portfolio-list-empty">
      <strong>${runtime.locale === "ko" ? "검색 결과 없음" : "No matches"}</strong>
      <span>${runtime.locale === "ko" ? "다른 키워드를 입력해보세요." : "Try a different keyword."}</span>
      <button type="button" data-project-reset>${runtime.locale === "ko" ? "검색 초기화" : "Clear search"}</button>
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

function filteredProjects(projects, filter, query = "") {
  let result = projects;
  if (filter && filter.type !== "all") result = result.filter((project) => {
    if (filter.type === "category") return project.categories.includes(filter.value);
    if (filter.type === "language") return project.languages.includes(filter.value);
    if (filter.type === "tech") return project.techStacks.includes(filter.value);
    return true;
  });
  const normalizedQuery = String(query || "").trim().toLocaleLowerCase();
  if (!normalizedQuery) return result;
  return result.filter((project) => [
    project.title,
    project.role,
    ...project.categories,
    ...project.languages,
    ...project.techStacks,
    ...project.description,
  ].join(" ").toLocaleLowerCase().includes(normalizedQuery));
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
    .replaceAll("&lt;br /&gt;", "<br>")
    .replaceAll("&lt;b&gt;", "<strong>")
    .replaceAll("&lt;/b&gt;", "</strong>");
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
