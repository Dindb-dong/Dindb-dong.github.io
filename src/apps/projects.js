import { renderSearchableSelect, mountSearchableSelect } from "dindbos";
import { renderDropdown, mountDropdown } from "../dropdown.js";
import { filteredProjects } from "../project-filters.js";
import { currentData } from "../portfolio-data.js";
import { unique, firstText } from "../utils/values.js";
import { escapeHtml, escapeAttr } from "../utils/html.js";
import { renderEmphasis } from "../utils/emphasis.js";
import { CONTENT_EMPHASIS } from "../content-emphasis.js";

export function renderProjectBrowser(content, runtime, navigation) {
  const { renderAppSidebar, wireSidebar } = navigation;
  const data = currentData(runtime);
  const choices = runtime.projectChoices ||= { categories: [], tags: [], sort: "newest" };
  if (runtime.projectFilter?.type !== "all") {
    const filter = runtime.projectFilter;
    choices.categories = filter.type === "category" ? [filter.value] : [];
    choices.tags = ["language", "tech"].includes(filter.type) ? [filter.value] : [];
    runtime.projectFilter = { type: "all", value: "All" };
  }
  let projects = filteredProjects(data.projects, runtime.projectFilter, runtime.projectQuery, choices);
  const selected = projects.find(project => project.id === runtime.selectedProjectId) || projects[0];
  runtime.selectedProjectId = selected?.id || null;
  const ko = runtime.locale === "ko";
  const copy = ko ? {
    search: "프로젝트 검색", placeholder: "제목, 역할, 기술 검색", empty: "검색 결과 없음", all: "전체 보기",
    filter: "필터", sort: "정렬", newest: "최신 등록순", oldest: "오래된 등록순", title: "이름순",
    category: "카테고리", tags: "기술 태그 · 모두 포함", reset: "초기화", close: "닫기",
  } : {
    search: "Search projects", placeholder: "Search title, role, or technology", empty: "No matching projects", all: "View all",
    filter: "Filters", sort: "Sort", newest: "Newest registered", oldest: "Oldest registered", title: "Name",
    category: "Categories", tags: "Technology tags · match all", reset: "Reset", close: "Close",
  };
  const prefix = content.closest("[data-window-id]")?.dataset.windowId || "portfolio";
  const popupId = `${prefix}-project-filters`;
  const categories = unique(data.projects.flatMap(project => project.categories));
  const tags = unique(data.projects.flatMap(project => [...project.languages, ...project.techStacks]));
  const checks = (values, type) => values.map((value, index) => `<label><input id="${escapeAttr(`${prefix}-${type}-${index}`)}" type="checkbox" data-project-choice="${type}" value="${escapeAttr(value)}" ${choices[type].includes(value) ? "checked" : ""}><span>${escapeHtml(value)}</span></label>`).join("");
  const activeFilters = choices.categories.length + choices.tags.length + Number(runtime.projectFilter?.type !== "all");
  content.innerHTML = `
    <section class="portfolio-os-app portfolio-projects" data-locale="${escapeAttr(runtime.locale)}">
      ${renderAppSidebar("projects", runtime)}
      <main class="portfolio-main-pane portfolio-finder">
        <div class="portfolio-project-controls" role="search" aria-label="${copy.search}">
          ${renderSearchableSelect({ id: `${prefix}-project-picker`, label: copy.search, placeholder: copy.placeholder })}
          <button type="button" class="portfolio-filter-trigger" data-project-filters popovertarget="${escapeAttr(popupId)}" aria-label="${copy.filter}" aria-haspopup="dialog" aria-expanded="false" data-filter-active="${activeFilters > 0}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/></svg></button>
        </div>
        <section class="portfolio-finder-layout ${runtime.projectBrowse ? "is-browsing" : ""}">
          <div class="portfolio-project-list" role="listbox" aria-label="Projects">${projects.length ? projects.map(project => renderProjectRow(project, runtime.projectBrowse ? null : selected.id)).join("") : renderProjectListEmpty(runtime)}</div>
          <article class="portfolio-detail-pane">${selected ? renderProjectDetail(selected, runtime) : renderEmptyDetail(runtime)}</article>
        </section>
        <div id="${escapeAttr(popupId)}" class="portfolio-filter-popover" popover="auto" role="dialog" aria-label="${copy.filter}">
          <header><strong>${copy.filter}</strong><button type="button" data-filter-close>${copy.close}</button></header>
          <div class="portfolio-sort-field"><span>${copy.sort}</span>${renderDropdown({ id: `${prefix}-sort`, label: copy.sort, value: choices.sort, options: ["newest", "oldest", "title"].map(value => ({ value, label: copy[value] })) })}</div>
          <fieldset><legend>${copy.category}</legend><div class="portfolio-filter-options">${checks(categories, "categories")}</div></fieldset>
          <fieldset><legend>${copy.tags}</legend><div class="portfolio-filter-options portfolio-filter-tags">${checks(tags, "tags")}</div></fieldset>
          <button type="button" data-project-reset>${copy.reset}</button>
        </div>
      </main>
    </section>`;
  const selectProject = id => {
    runtime.projectBrowse = false;
    content.querySelector(".portfolio-finder-layout").classList.remove("is-browsing");
    runtime.selectedProjectId = Number(id);
    content.querySelectorAll("[data-project-id]").forEach(row => {
      const selected = Number(row.dataset.projectId) === runtime.selectedProjectId;
      row.setAttribute("aria-selected", String(selected));
      row.classList.toggle("is-selected", selected);
    });
    const project = projects.find(project => project.id === runtime.selectedProjectId);
    const detail = content.querySelector(".portfolio-detail-pane");
    detail.innerHTML = renderProjectDetail(project, runtime);
    detail.scrollTop = 0;
    content.querySelector(".portfolio-finder-layout").scrollTop = 0;
  };
  const renderResults = () => {
    projects = filteredProjects(data.projects, runtime.projectFilter, runtime.projectQuery, choices);
    const selected = projects.find(project => project.id === runtime.selectedProjectId) || projects[0];
    runtime.selectedProjectId = selected?.id || null;
    content.querySelector(".portfolio-finder-layout").classList.toggle("is-browsing", Boolean(runtime.projectBrowse));
    content.querySelector(".portfolio-project-list").innerHTML = projects.length ? projects.map(project => renderProjectRow(project, runtime.projectBrowse ? null : selected.id)).join("") : renderProjectListEmpty(runtime);
    const detail = content.querySelector(".portfolio-detail-pane");
    detail.innerHTML = selected ? renderProjectDetail(selected, runtime) : renderEmptyDetail(runtime);
    detail.scrollTop = 0;
    content.querySelector(".portfolio-finder-layout").scrollTop = 0;
  };
  const picker = mountSearchableSelect(content.querySelector("[data-dos-searchable-select]"), {
    options: [{ value: "all", label: copy.all, pinned: true }, ...filteredProjects(data.projects, runtime.projectFilter, "", choices).map(project => ({ value: String(project.id), label: project.title, searchText: [project.title, project.role, ...project.categories, ...project.languages, ...project.techStacks, ...project.description].join(" ") }))],
    value: runtime.projectBrowse ? "all" : String(selected?.id), query: runtime.projectQuery, empty: copy.empty,
    onSearch: query => { runtime.projectQuery = query; runtime.projectBrowse = true; picker.setValue("all"); renderResults(); },
    onSelect: value => {
      const hadQuery = Boolean(runtime.projectQuery);
      runtime.projectQuery = "";
      if (value === "all") { runtime.projectBrowse = true; renderResults(); return; }
      runtime.selectedProjectId = Number(value);
      if (hadQuery) renderResults();
      selectProject(value);
    },
  });
  content.querySelector(".portfolio-project-list").addEventListener("click", event => {
    const button = event.target.closest("[data-project-id]");
    if (button) picker.select(button.dataset.projectId);
  });
  const popup = content.querySelector(".portfolio-filter-popover");
  const trigger = content.querySelector("[data-project-filters]");
  const lifetime = new AbortController();
  trigger.addEventListener("click", () => picker.select("all"));
  const position = () => {
    if (!popup.matches(":popover-open")) return;
    const rect = trigger.getBoundingClientRect();
    popup.style.left = `${Math.max(12, Math.min(rect.right - popup.offsetWidth, innerWidth - popup.offsetWidth - 12))}px`;
    popup.style.top = `${Math.max(12, Math.min(rect.bottom + 8, innerHeight - popup.offsetHeight - 12))}px`;
  };
  popup.addEventListener("toggle", () => {
    trigger.setAttribute("aria-expanded", String(popup.matches(":popover-open")));
    position();
  });
  window.addEventListener("resize", position, { signal: lifetime.signal });
  content.querySelector("[data-filter-close]").addEventListener("click", () => { popup.hidePopover(); trigger.focus({ preventScroll: true }); });
  const rerenderFilters = focusId => {
    const scroll = popup.scrollTop;
    const tagsScroll = content.querySelector(".portfolio-filter-tags").scrollTop;
    navigation.rerender();
    content.querySelector("[data-project-filters]").click();
    content.querySelector(".portfolio-filter-popover").scrollTop = scroll;
    content.querySelector(".portfolio-filter-tags").scrollTop = tagsScroll;
    content.querySelector(`#${CSS.escape(focusId)}`)?.focus({ preventScroll: true });
  };
  content.querySelectorAll("[data-project-choice]").forEach(input => input.addEventListener("change", () => {
    choices[input.dataset.projectChoice] = [...content.querySelectorAll(`[data-project-choice="${input.dataset.projectChoice}"]:checked`)].map(input => input.value);
    runtime.projectFilter = { type: "all", value: "All" };
    runtime.projectQuery = "";
    runtime.projectBrowse = true;
    rerenderFilters(input.id);
  }));
  const disposeSort = mountDropdown(content.querySelector(".portfolio-sort-field [data-dropdown]"), value => { choices.sort = value; runtime.projectBrowse = true; rerenderFilters(`${prefix}-sort-trigger`); });
  content.addEventListener("click", event => {
    if (!event.target.closest("[data-project-reset]")) return;
    runtime.projectQuery = "";
    runtime.projectFilter = { type: "all", value: "All" };
    runtime.projectChoices = { categories: [], tags: [], sort: "newest" };
    runtime.projectBrowse = true;
    navigation.rerender();
    content.querySelector("[data-project-filters]").focus({ preventScroll: true });
  }, { signal: lifetime.signal });
  wireSidebar(content, runtime);
  return () => { picker.destroy(); disposeSort(); lifetime.abort(); };
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
  const emphasize = text => renderEmphasis(text, CONTENT_EMPHASIS[runtime.locale]?.projects[project.id]);
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
      <p>${renderEmphasis(project.role, { bold: [project.role] })}</p>
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
      ${project.description.map((line) => `<p>${emphasize(line)}</p>`).join("")}
    </section>
    <section class="portfolio-detail-section">
      <h3>${copy.details}</h3>
      <ul>
        ${project.extraDescription.map((line) => `<li>${emphasize(line)}</li>`).join("")}
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
