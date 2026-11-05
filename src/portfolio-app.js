import { revealActiveNavigation, sidebarIcon } from "./navigation-icons.js";
import { EXPERIENCE_APPS, experienceContent } from "./experience-content.js";
import { renderExperienceApp } from "./experience-app.js";
import { renderProjectBrowser } from "./apps/projects.js";
import { currentData, SKILLS } from "./portfolio-data.js";
import { filteredProjects } from "./project-filters.js";
import { mountView, updateView, refreshViews } from "./view-lifecycle.js";
import { unique } from "./utils/values.js";
import { escapeHtml, escapeAttr } from "./utils/html.js";

function renderProjects(content, runtime) {
  return renderProjectBrowser(content, runtime, {
    renderAppSidebar,
    wireSidebar,
    rerender: () => updateView(runtime, content, renderProjects),
  });
}

export function createPortfolioApps(runtime) {
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
  return mountView(runtime, id, content, render);
}

function renderAbout(content, runtime) {
  const data = currentData(runtime);
  const ko = runtime.locale === "ko";
  const copy = ko ? {
    education: "학력·언어", university: "연세대학교", major: "응용통계학 · 컴퓨터과학",
    school: "과천외국어고등학교", track: "일본어과", stats: "스테이터스",
    career: "커리어", research: "AI", tools: "개발 도구", resume: "이력서 열기",
    leadership: "YAI 18기 부학회장", hub: "60명 넘는 학회원이 매일 사용하는 웹·앱",
    interests: "관심 분야", rl: "강화학습", vision: "컴퓨터 비전",
  } : {
    education: "Education & languages", university: "Yonsei University", major: "Applied Statistics · Computer Science",
    school: "Gwacheon Foreign Language High School", track: "Japanese", stats: "Skills",
    career: "Experience", research: "AI", tools: "Development tools", resume: "Open resume",
    leadership: "YAI 18th-cohort Vice President", hub: "Web & mobile platform used daily by 60+ members",
    interests: "Research interests", rl: "Reinforcement learning", vision: "Computer vision",
  };
  const grades = [[ko ? "잠재력" : "Potential", "SS", "potential", 0], [ko ? "백엔드" : "Backend", "A+", "backend", 4], [ko ? "인프라" : "Infra", "A", "infra", 4], ["DB", "A-", "database", 3], ["AI", "A", "ai", 4], [ko ? "프론트" : "Frontend", "A-", "skills", 3]];
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
          <img class="profile-mobile-portrait" src="/assets/images/kim-dong-wook.png" alt="Kim Dong Wook">
          <nav class="profile-links" aria-label="${ko ? "프로필 링크" : "Profile links"}">
            <a href="https://github.com/Dindb-dong" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="https://www.linkedin.com/in/dindb-dong/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <button type="button" data-sidebar-target="resume">${copy.resume}</button>
          </nav>
        </header>
        <div class="profile-panels">
          <div class="profile-column">
            <section class="profile-panel profile-education" aria-label="${copy.education}">
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
              <header><h2>${copy.stats}</h2></header>
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
      runtime.projectBrowse = true;
      runtime.projectQuery = "";
      const nextProjects = filteredProjects(currentData(runtime).projects, runtime.projectFilter);
      runtime.selectedProjectId = nextProjects[0]?.id || runtime.selectedProjectId;
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
  ] : [
    ["about", "Overview"],
    ["projects", "Projects"],
    ["experience", "Experience"],
    ["skills", "Skills"],
    ["resume", "Resume"],
  ];
  return `
    <aside class="portfolio-sidebar">
      <div class="portfolio-sidebar-title">
        <img class="portfolio-avatar" src="/assets/images/kim-dong-wook.png" alt="Kim Dong Wook">
        <div class="portfolio-sidebar-person"><strong>Kim Dong Wook</strong><small>Full-Stack AI Engineer</small></div>
      </div>
      <nav class="portfolio-sidebar-nav dos-mobile-tabbar" aria-label="Portfolio sections">
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
  revealActiveNavigation(content);
  content.querySelectorAll("[data-experience-open]").forEach((button) => {
    button.addEventListener("click", () => runtime.launchExperience(Number(button.dataset.experienceOpen)));
  });
  content.querySelectorAll("[data-sidebar-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.sidebarTarget;
      const view = runtime.views.get(target);
      if (view) {
        updateView(runtime, view.content);
        return;
      }
      renderInlineView(target, content, runtime);
    });
  });
  content.querySelectorAll("[data-profile-project]").forEach((button) => {
    button.addEventListener("click", () => {
      runtime.projectBrowse = false;
      runtime.selectedProjectId = Number(button.dataset.profileProject);
      runtime.projectFilter = { type: "all", value: "All" };
      runtime.projectQuery = "";
      runtime.projectChoices = { categories: [], tags: [], sort: "newest" };
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
  };
  const renderer = renderers[target];
  if (!renderer) return;
  updateView(runtime, content, renderer);
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

