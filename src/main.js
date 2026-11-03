import { sidebarIcon } from "./navigation-icons.js";
import { EXPERIENCE_APPS, experienceContent } from "./experience-content.js";
import { renderExperienceApp } from "./experience-app.js";
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

  const os = await createAndBootDindbOS({
    root: "#app",
    theme: { mode: "light", accent: "#7c9fe5", wallpaper: "meadow", dockSize: 48 },
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
  runtime.launchExperience = (id) => {
    const app = EXPERIENCE_APPS.find((entry) => entry.id === id);
    if (app) os.launch(app.appId);
  };
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
      render: ({ content, window }) => registerView(runtime, "portfolio", content, renderAbout, window),
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
      render: ({ content, window }) => registerView(runtime, "projects", content, renderProjects, window),
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
      render: ({ content, window }) => registerView(runtime, "resume", content, renderResume, window),
    },
    ...EXPERIENCE_APPS.map((app) => ({
      id: app.appId,
      name: app.name,
      title: `${app.name}.app`,
      icon: app.icon || `/assets/experience-icons/${app.name}-official.svg`,
      desktop: true,
      singleton: true,
      width: 1180,
      height: 760,
      manifest: appManifest(),
      render: ({ content, window }) => {
        const state = { tab: "overview", projectId: app.projectIds[0] };
        return registerView(runtime, app.appId, content, (element, currentRuntime) => renderExperienceApp(element, currentRuntime, app.id, state), window);
      },
    })),
  ];
}

function appManifest() {
  return {
    capabilities: ["app.launch"],
    fileSystem: { read: ["/mnt/portfolio", "/home/kimdongwook"], write: [] },
  };
}

function registerView(runtime, id, content, render, windowApi) {
  runtime.positionedApps ||= new Set();
  if (windowApi && !runtime.positionedApps.has(id)) {
    runtime.positionedApps.add(id);
    if (globalThis.innerWidth > 760) {
      const left = globalThis.innerWidth >= 1180 ? 228 : 124;
      windowApi.setBounds({ left, top: 72, width: globalThis.innerWidth - left - 20, height: Math.min(760, globalThis.innerHeight - 170) });
    }
  }
  runtime.views.set(id, { content, render });
  const dispose = render(content, runtime);
  return () => {
    dispose?.();
    if (runtime.views.get(id)?.content === content) runtime.views.delete(id);
  };
}

function refreshViews(runtime) {
  for (const view of runtime.views.values()) {
    if (view.content.isConnected) view.render(view.content, runtime);
  }
}

function renderAbout(content, runtime) {
  const data = currentData(runtime);
  const ko = runtime.locale === "ko";
  const copy = ko ? {
    education: "학력·언어", university: "연세대학교", major: "응용통계학 · 컴퓨터과학",
    school: "과천외국어고등학교", track: "일본어과", stats: "스테이터스", assessment: "자기평가",
    career: "커리어", research: "AI", tools: "개발 도구", resume: "이력서 열기",
    leadership: "YAI 18기 부학회장", hub: "60명 넘는 학회원이 매일 사용하는 웹·앱",
    interests: "관심 분야", rl: "강화학습", vision: "컴퓨터 비전",
  } : {
    education: "Education & languages", university: "Yonsei University", major: "Applied Statistics · Computer Science",
    school: "Gwacheon Foreign Language High School", track: "Japanese", stats: "Skills", assessment: "Self-assessed",
    career: "Experience", research: "AI", tools: "Development tools", resume: "Open resume",
    leadership: "YAI 18th-cohort Vice President", hub: "Web & mobile platform used daily by 60+ members",
    interests: "Research interests", rl: "Reinforcement learning", vision: "Computer vision",
  };
  const grades = [[ko ? "잠재력" : "Potential", "SS", "potential", 0], [ko ? "백엔드" : "Backend", "A+", "backend", 4], [ko ? "인프라" : "Infra", "A", "infra", 4], ["DB", "A-", "database", 3], ["AI", "A", "ai", 4], [ko ? "프론트" : "Frontend", "B+", "skills", 3]];
  const languages = ko ? [["한국어", "원어민"], ["영어", "상"], ["일본어", "상"]] : [["Korean", "Native"], ["English", "Advanced"], ["Japanese", "Advanced"]];
  const tools = [
    [ko ? "언어" : "Languages", SKILLS.languages],
    [ko ? "웹·앱" : "Web & mobile", ["React", "React Native", "Flutter"]],
    [ko ? "백엔드·DB" : "Backend & DB", ["Node.js", "Supabase", "MongoDB"]],
    [ko ? "AI·연구" : "AI & research", ["PyTorch", "TensorFlow", "Qiskit"]],
    [ko ? "인프라" : "Infrastructure", ["AWS", "Docker", "Kubernetes"]],
  ];
  const careers = [1, 2, 4].map(id => ({
    app: EXPERIENCE_APPS.find(app => app.id === id),
    experience: data.experiences.find(experience => experience.id === id),
  }));
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-about" data-locale="${runtime.locale}">
      ${renderAppSidebar("about", runtime)}
      <main class="portfolio-main-pane profile-overview">
        <header class="profile-header">
          <div><h1>${ko ? "김동욱" : "Kim Dong Wook"}</h1><p>Full-Stack AI & SW Engineer</p></div>
          <nav class="profile-links" aria-label="${ko ? "프로필 링크" : "Profile links"}">
            <a href="https://github.com/Dindb-dong" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="https://www.linkedin.com/in/dindb-dong/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <button type="button" data-sidebar-target="resume">${copy.resume}</button>
          </nav>
        </header>
        <div class="profile-panels">
          <div class="profile-column">
            <section class="profile-panel profile-education" aria-label="${copy.education}">
              <h2>${copy.education}</h2>
              <div class="profile-school"><h3>${copy.university}</h3><p>${copy.major}</p><div class="profile-school-meta"><time>2023.03–2028.02</time><span>GPA <strong>4.00</strong> / 4.3</span></div></div>
              <div class="profile-school"><h3>${copy.school}</h3><p>${copy.track} <span class="profile-date">· 2020.03–2023.01</span></p></div>
              <dl class="profile-languages">${languages.map(([name, level]) => `<div><dt>${name}</dt><dd>${level}</dd></div>`).join("")}</dl>
            </section>
            <section class="profile-panel profile-tools" aria-label="${copy.tools}">
              <h2>${copy.tools}</h2>
              <dl>${tools.map(([category, names]) => `<div><dt>${category}</dt><dd>${names.map(escapeHtml).join(" · ")}</dd></div>`).join("")}</dl>
            </section>
          </div>
          <div class="profile-column">
            <section class="profile-panel profile-stats" aria-label="${copy.stats}">
              <header><h2>${copy.stats}</h2><span>${copy.assessment}</span></header>
              <dl class="profile-grade-grid">${grades.map(([name, grade, icon, segments]) => `<div ${grade === "SS" ? 'class="profile-potential"' : ""}><dt>${sidebarIcon(icon)}<span>${name}</span></dt>${segments ? `<span class="profile-grade-meter" aria-hidden="true">${Array.from({length: 5}, (_, index) => `<i${index < segments ? ' class="is-filled"' : ""}></i>`).join("")}</span>` : ""}<dd>${grade}</dd></div>`).join("")}</dl>
            </section>
          </div>
          <div class="profile-column">
            <section class="profile-panel profile-career" aria-label="${copy.career}">
              <h2>${copy.career}</h2>
              <div class="profile-career-list">${careers.map(({app, experience}) => `<button type="button" data-experience-open="${app.id}"><img src="${escapeAttr(app.icon || `/assets/experience-icons/${app.name}-official.svg`)}" alt=""><span><span class="profile-career-title"><strong>${escapeHtml(app.name)}</strong><time>${escapeHtml(experience.period.replace(/\s*[~-]\s*/g, "–"))}</time></span><span>${escapeHtml(experience.position)}</span></span><span aria-hidden="true">↗</span></button>`).join("")}</div>
            </section>
            <section class="profile-panel profile-research" aria-label="${copy.research}">
              <h2>${copy.research}</h2>
              <button type="button" class="profile-research-row" data-experience-open="3"><strong>${copy.leadership}</strong><span>2025.01–${ko ? "현재" : "present"}</span></button>
              <div class="profile-ai-interests"><h3>${copy.interests}</h3><dl><div><dt>CV</dt><dd>${copy.vision}</dd></div><div><dt>RL</dt><dd>${copy.rl}</dd></div></dl></div>
              <button type="button" class="profile-research-row" data-profile-project="20"><strong>YAI-HUB<span aria-hidden="true">↗</span></strong><span>${copy.hub}</span></button>
            </section>
          </div>
        </div>
      </main>
    </section>`;
  wireSidebar(content, runtime);
}

function renderProjects(content, runtime) {
  const data = currentData(runtime);
  const projects = filteredProjects(data.projects, runtime.projectFilter, runtime.projectQuery);
  const selected = data.projects.find((project) => project.id === runtime.selectedProjectId) || projects[0] || data.projects[0];
  if (selected && projects.some((project) => project.id === selected.id)) runtime.selectedProjectId = selected.id;
  const copy = runtime.locale === "ko" ? {
    search: "프로젝트 검색",
    placeholder: "제목, 역할, 기술 검색",
    count: `${projects.length}개 프로젝트`,
  } : {
    search: "Search projects",
    placeholder: "Search title, role, or technology",
    count: `${projects.length} projects`,
  };

  content.innerHTML = `
    <section class="portfolio-os-app portfolio-projects" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("projects", runtime)}
      <main class="portfolio-main-pane portfolio-finder">
        <div class="portfolio-project-controls" role="search" aria-label="${copy.search}">
          <label class="portfolio-search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
            <input type="search" aria-label="${copy.search}" value="${escapeAttr(runtime.projectQuery || "")}" placeholder="${escapeAttr(copy.placeholder)}" data-project-search>
          </label>
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
        <div class="portfolio-timeline">
          ${data.experiences.map((experience, index) => renderExperienceCard(experience, index, runtime)).join("")}
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
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-settings" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("settings", runtime)}
      <main class="portfolio-main-pane">
        <section class="portfolio-settings-list">
          <div class="portfolio-setting-row">
            <div>
              <strong>Language</strong>
            </div>
            <div class="portfolio-segmented" role="group" aria-label="Language">
              <button type="button" data-locale-choice="ko" class="${runtime.locale === "ko" ? "is-active" : ""}">한국어</button>
              <button type="button" data-locale-choice="en" class="${runtime.locale === "en" ? "is-active" : ""}">English</button>
            </div>
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
    html: "HTML로 열기",
    pdf: "PDF로 열기",
  } : {
    html: "Open HTML",
    pdf: "Open PDF",
  };
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-resume-app" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("resume", runtime)}
      <main class="portfolio-main-pane">
        <div class="portfolio-link-list portfolio-resume-actions">
            <a href="/resume.html" target="_blank" rel="noreferrer">${copy.html}</a>
            <a href="/resume.pdf" target="_blank" rel="noreferrer">${copy.pdf}</a>
        </div>
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
    ["about", "개요"],
    ["projects", "프로젝트"],
    ["experience", "경험"],
    ["skills", "기술"],
    ["resume", "이력서"],
    ["settings", "설정"],
    ["contact", "연락하기"],
  ] : [
    ["about", "Overview"],
    ["projects", "Projects"],
    ["experience", "Experience"],
    ["skills", "Skills"],
    ["resume", "Resume"],
    ["settings", "Settings"],
    ["contact", "Contact"],
  ];
  return `
    <aside class="portfolio-sidebar">
      <div class="portfolio-sidebar-title">
        <img class="portfolio-avatar" src="/assets/images/kim-dong-wook.png" alt="Kim Dong Wook">
        <div class="portfolio-sidebar-person"><strong>Kim Dong Wook</strong><small>Full-Stack AI Engineer</small></div>
      </div>
      <nav class="portfolio-sidebar-nav" aria-label="Portfolio sections">
        ${items.map(([id, label]) => `
          <button type="button" class="${active === id ? "is-active" : ""}" data-sidebar-target="${escapeAttr(id)}" ${active === id ? 'aria-current="page"' : ""}>
            ${sidebarIcon(id)}<span>${escapeHtml(label)}</span>
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
  content.querySelectorAll("[data-experience-open]").forEach((button) => {
    button.addEventListener("click", () => runtime.launchExperience(Number(button.dataset.experienceOpen)));
  });
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
  content.querySelectorAll("[data-profile-project]").forEach((button) => {
    button.addEventListener("click", () => {
      runtime.selectedProjectId = Number(button.dataset.profileProject);
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
        ${cover ? renderMedia(cover, project.title, true) : `<span class="portfolio-project-monogram">${escapeHtml(project.title.slice(0, 2))}</span>`}
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

function renderProjectDetail(project, runtime) {
  const previewMedia = [...project.media].sort((left, right) => Number(left.type === "video") - Number(right.type === "video")).slice(0, 3);
  const copy = runtime.locale === "ko" ? {
    introduction: "프로젝트 소개",
    details: "주요 작업",
    links: "관련 링크",
    moreMedia: `외 ${Math.max(0, project.media.length - 3)}개 미디어`,
  } : {
    introduction: "Introduction",
    details: "Key work",
    links: "Links",
    moreMedia: `${Math.max(0, project.media.length - 3)} more media`,
  };
  return `
    <div class="portfolio-detail-header">
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
    ${project.links.length || project.deck ? `
    <section class="portfolio-detail-section">
      <h3>${copy.links}</h3>
      <div class="portfolio-link-list">
        ${project.links.map((link) => `<a href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.name || "Open")}</a>`).join("")}
        ${project.deck ? `<a href="/assets/presentations/${escapeAttr(project.deck.file)}" target="_blank" rel="noreferrer">Open presentation</a>` : ""}
      </div>
    </section>
    ` : ""}
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

function renderExperienceCard(experience, index, runtime) {
  const app = experienceContent(runtime, experience.id);
  const ko = runtime.locale === "ko";
  return `
    <article class="portfolio-timeline-card portfolio-experience-launcher">
      <div class="portfolio-timeline-index">${String(index + 1).padStart(2, "0")}</div>
      <div class="portfolio-timeline-body">
        <header><h2 class="experience-launcher-name"><img src="${escapeAttr(app.icon)}" alt="">${escapeHtml(experience.groupName)}</h2><p>${escapeHtml([experience.position, experience.period].join(" · "))}</p></header>
        <p class="experience-launcher-summary">${escapeHtml(app.summary)}</p>
        <div class="experience-launcher-focus">${app.focus.map((focus) => `<span>${escapeHtml(focus)}</span>`).join("")}</div>
        <button type="button" class="experience-primary" data-experience-open="${experience.id}">${escapeHtml(app.name)}.app ${ko ? "열기" : "Open"} ↗</button>
        <details class="experience-launcher-details"><summary>${ko ? "담당 업무 요약" : "Responsibilities at a glance"}</summary><ul>${experience.description.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
          <div class="portfolio-mini-projects">${experience.projects.map((project) => `<span>${escapeHtml(project)}</span>`).join("")}</div>
        </details>
      </div>
      ${app.media.length ? `<button type="button" class="experience-launcher-cover" data-experience-open="${experience.id}" aria-label="${escapeAttr(`${app.name}.app ${ko ? "화면으로 열기" : "Open from preview"}`)}"><img src="${escapeAttr(app.media[0].src)}" alt="${escapeAttr(app.media[0].caption)}" loading="lazy"></button>` : ""}
    </article>`;
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
