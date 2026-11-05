import { escapeAttr as html } from "./utils/html.js";
import { renderDropdown, mountDropdown } from "./dropdown.js";
import { revealActiveNavigation, sidebarIcon } from "./navigation-icons.js";
import { EXPERIENCE_APPS, experienceContent } from "./experience-content.js";

export function renderExperienceApp(content, runtime, id, state) {
  state.disposeDropdown?.();
  const app = experienceContent(runtime, id);
  const ko = runtime.locale === "ko";
  const copy = ko ? {
    overview: "둘러보기", projects: "프로젝트", gallery: "자료실", role: "기여와 성과", change: "다른 경력 앱 열기",
    work: "주요 작업", views: "화면과 자료", scope: "담당 범위", stack: "사용 기술", more: "프로젝트 살펴보기",
    responsibility: "어떤 일을 했나요", media: "화면 크게 보기", links: "관련 링크", deck: "발표 자료", close: "닫기", previous: "이전 이미지", next: "다음 이미지",
  } : {
    overview: "Showcase", projects: "Projects", gallery: "Media", role: "Impact", change: "Open another experience app",
    work: "Selected work", views: "Screens & materials", scope: "Scope of work", stack: "Technologies", more: "Explore projects",
    responsibility: "My responsibilities", media: "Enlarge image", links: "Related links", deck: "Presentation", close: "Close image", previous: "Previous image", next: "Next image",
  };
  const tabs = ["role", "overview", ...(app.projects.length ? ["projects"] : []), ...(app.media.length ? ["gallery"] : [])];
  if (!tabs.includes(state.tab)) state.tab = tabs[0];
  const selected = app.projects.find((project) => project.id === state.projectId) || app.projects[0];
  const images = (projectId) => app.media.map((media, index) => ({ ...media, index })).filter((media) => !projectId || media.projectId === projectId);
  const gallery = (items, className = "") => items.length ? `<div class="experience-gallery ${className}">${items.map((media) => `
    <figure>
      <button type="button" class="experience-image-button" data-experience-image="${media.index}" aria-label="${html(`${copy.media}: ${media.caption}`)}">
        <img src="${html(media.src)}" alt="${html(media.caption)}" loading="lazy"><span aria-hidden="true">↗</span>
      </button>
      <figcaption><strong>${html(media.caption)}</strong><span>${html(media.kind)}</span></figcaption>
    </figure>`).join("")}</div>` : "";
  const projectButton = (project) => {
    const media = app.media.find((item) => item.projectId === project.id);
    return `<button type="button" class="experience-project-choice" data-experience-project="${project.id}" aria-pressed="${state.projectId === project.id}">
      ${media ? `<img src="${html(media.src)}" alt="" loading="lazy">` : `<span class="experience-project-initial" aria-hidden="true">${html(project.title.slice(0, 2))}</span>`}
      <span><strong>${html(project.title)}</strong><small>${html(project.role)}</small></span><span aria-hidden="true">↗</span>
    </button>`;
  };
  let body = "";
  if (state.tab === "overview") {
    body = `<section class="experience-intro">
      <div><h2>${html(app.summary)}</h2><p>${html(app.experience.description[0])}</p>
        <button type="button" class="experience-primary" data-experience-tab="${app.projects.length ? "projects" : "role"}">${app.projects.length ? copy.more : copy.role} <span aria-hidden="true">↗</span></button>
      </div>
      ${gallery(images().slice(0, 1), "experience-hero-media")}
    </section>
    <div class="experience-focus" aria-label="${copy.scope}">${app.focus.map((focus, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><strong>${html(focus)}</strong></div>`).join("")}</div>
    ${app.projects.length ? `<section class="experience-section"><div class="experience-section-heading"><h2>${copy.work}</h2><span>${app.projects.length} ${ko ? "프로젝트" : "projects"}</span></div>
      <div class="experience-project-grid">${app.projects.map(projectButton).join("")}</div>
    </section>` : `<section class="experience-section"><h2>${copy.responsibility}</h2><ul class="experience-work-list">${app.experience.description.map(line => `<li>${html(line)}</li>`).join("")}</ul></section>`}
    ${app.media.length > 1 ? `<section class="experience-section"><div class="experience-section-heading"><h2>${copy.views}</h2><button type="button" data-experience-tab="gallery">${copy.gallery} ↗</button></div>${gallery(images().slice(1, 3))}</section>` : ""}`;
  } else if (state.tab === "projects") {
    body = `<section class="experience-section experience-section--first"><h2>${copy.work}</h2>
      <div class="experience-project-grid">${app.projects.map(projectButton).join("")}</div>
    </section>
    <article class="experience-case-study" data-experience-case="${selected.id}">
      <header><span>${html(selected.role)}</span><h2>${html(selected.title)}</h2><p>${html(selected.description.join(" "))}</p></header>
      <div class="experience-tags" aria-label="${copy.stack}">${[...selected.languages, ...selected.techStacks].map((tag) => `<span>${html(tag)}</span>`).join("")}</div>
      ${gallery(images(selected.id))}
      <section class="experience-section"><h3>${copy.scope}</h3><ul class="experience-work-list">${selected.extraDescription.map((line) => `<li>${html(line)}</li>`).join("")}</ul></section>
      ${selected.links.length || selected.deck ? `<nav class="experience-links" aria-label="${copy.links}">${selected.links.map((link) => `<a href="${html(link.url)}" target="_blank" rel="noreferrer">${html(link.name)} ↗</a>`).join("")}${selected.deck ? `<a href="/assets/presentations/${html(selected.deck.file)}" target="_blank" rel="noreferrer">${copy.deck} ↗</a>` : ""}</nav>` : ""}
    </article>`;
  } else if (state.tab === "gallery") {
    body = `<section class="experience-section experience-section--first"><div class="experience-section-heading"><h2>${copy.views}</h2><span>${app.media.length} ${ko ? "개 자료" : "items"}</span></div>${gallery(images())}</section>`;
  } else {
    body = `<section class="experience-contributions" aria-label="${copy.role}">
      <div class="experience-responsibilities">${app.experience.description.map((line, index) => `<article>${app.experience.descriptionTitles?.[index] ? `<h2>${html(app.experience.descriptionTitles[index])}</h2><ul>${line.split("\n").map(item => `<li>${html(item)}</li>`).join("")}</ul>` : `<p>${html(line)}</p>`}</article>`).join("")}</div>
      <h2>${copy.work}</h2><ul class="experience-work-list">${app.experience.projects.map((name) => `<li>${html(name)}</li>`).join("")}</ul>
    </section>`;
  }
  content.innerHTML = `<section class="portfolio-os-app experience-app" data-experience-app="${id}" data-experience-tab-active="${state.tab}">
    <aside class="experience-sidebar">
      <div class="experience-identity"><img src="${html(app.icon)}" alt=""><strong>${html(app.name)}</strong><span>${html(app.experience.period)}</span></div>
      <nav class="portfolio-sidebar-nav dos-mobile-tabbar" aria-label="Experience sections">${tabs.map((tab) => `<button type="button" data-experience-tab="${tab}" ${state.tab === tab ? 'aria-current="page"' : ""}>${sidebarIcon(tab)}<span>${copy[tab]}</span><small>${tab === "projects" ? app.projects.length : tab === "gallery" ? app.media.length : ""}</small></button>`).join("")}</nav>
      <div class="experience-switch"><span>${copy.change}</span>${renderDropdown({
        id: `experience-switch-${id}`, label: copy.change, value: String(id),
        options: EXPERIENCE_APPS.map(entry => ({ value: String(entry.id), label: `${entry.name}.app`, icon: entry.icon || `/assets/experience-icons/${entry.name}-official.svg` })),
      })}</div>
    </aside>
    <main class="experience-main">
      <header class="experience-app-header"><div><h1>${html(app.experience.groupName)}</h1><p>${html(app.experience.position)}</p></div><span>${html(app.experience.period)}</span></header>
      ${body}
    </main>
    <dialog class="experience-lightbox" aria-label="${copy.views}"><div class="experience-lightbox-toolbar"><p data-lightbox-caption></p><button type="button" data-lightbox-close aria-label="${copy.close}">${copy.close} ×</button></div><img data-lightbox-image alt=""><div class="experience-lightbox-controls"><button type="button" data-lightbox-previous>${copy.previous}</button><span data-lightbox-count></span><button type="button" data-lightbox-next>${copy.next}</button></div></dialog>
  </section>`;

  revealActiveNavigation(content);
  const render = () => renderExperienceApp(content, runtime, id, state);
  content.querySelectorAll("[data-experience-tab]").forEach((button) => button.addEventListener("click", () => {
    state.tab = button.dataset.experienceTab;
    render();
    content.querySelector(`nav [data-experience-tab="${state.tab}"]`).focus({ preventScroll: true });
  }));
  content.querySelectorAll("[data-experience-project]").forEach((button) => button.addEventListener("click", () => {
    state.tab = "projects";
    state.projectId = Number(button.dataset.experienceProject);
    render();
    content.querySelector(`[data-experience-project="${state.projectId}"]`).focus({ preventScroll: true });
  }));
  state.disposeDropdown = mountDropdown(content.querySelector("[data-dropdown]"), value => runtime.launchExperience(Number(value)));

  const dialog = content.querySelector("dialog");
  let imageIndex = 0;
  let opener;
  const updateImage = () => {
    const media = app.media[imageIndex];
    const image = dialog.querySelector("[data-lightbox-image]");
    image.src = media.src;
    image.alt = media.caption;
    dialog.querySelector("[data-lightbox-caption]").textContent = `${media.caption} · ${media.kind}`;
    dialog.querySelector("[data-lightbox-count]").textContent = `${imageIndex + 1} / ${app.media.length}`;
  };
  const moveImage = (direction) => { imageIndex = (imageIndex + direction + app.media.length) % app.media.length; updateImage(); };
  content.querySelectorAll("[data-experience-image]").forEach((button) => button.addEventListener("click", () => {
    opener = button;
    imageIndex = Number(button.dataset.experienceImage);
    updateImage();
    dialog.showModal();
    dialog.querySelector("[data-lightbox-close]").focus();
  }));
  dialog.querySelector("[data-lightbox-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-lightbox-previous]").addEventListener("click", () => moveImage(-1));
  dialog.querySelector("[data-lightbox-next]").addEventListener("click", () => moveImage(1));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveImage(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  dialog.addEventListener("close", () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  return () => state.disposeDropdown?.();
}
