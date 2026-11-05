import { currentData, CONTACT_LINKS } from "./portfolio-data.js";
import { unique } from "./utils/values.js";

export function buildPortfolioFileSystem(runtime) {
  const ko = runtime.datasets.ko;
  const en = runtime.datasets.en;
  const active = currentData(runtime);

  return {
    "/etc/motd": [
      "Welcome to DindbOS Portfolio.",
      "Portfolio data is available as OS files and apps.",
      "Try: ls /home/kimdongwook, cat /home/kimdongwook/profile.md, ls /mnt/portfolio/ko/projects",
    ].join("\n"),
    "/home/kimdongwook/readme.md": readmeMarkdown(active),
    "/home/kimdongwook/profile.md": profileMarkdown(active.introduce),
    "/home/kimdongwook/experience.md": experienceMarkdown(active.experiences),
    "/home/kimdongwook/skills.md": skillsMarkdown(active.projects),
    "/home/kimdongwook/contact.url": CONTACT_LINKS.map((link) => `${link.label}: ${link.href}`).join("\n"),
    "/home/kimdongwook/Desktop/README.md": "symlink:/home/kimdongwook/readme.md",
    "/mnt/portfolio/presentations.json": `${JSON.stringify(runtime.presentations, null, 2)}\n`,
    ...localeFileSystem("ko", ko),
    ...localeFileSystem("en", en),
    ...projectMarkdownFiles("/home/kimdongwook/projects", active.projects),
  };
}

function localeFileSystem(locale, data) {
  return {
    [`/mnt/portfolio/${locale}/projects.json`]: `${JSON.stringify(data.raw.projects, null, 2)}\n`,
    [`/mnt/portfolio/${locale}/introduce.json`]: `${JSON.stringify(data.raw.introduce, null, 2)}\n`,
    [`/mnt/portfolio/${locale}/experiences.json`]: `${JSON.stringify(data.raw.experiences, null, 2)}\n`,
    ...projectMarkdownFiles(`/mnt/portfolio/${locale}/projects`, data.projects),
  };
}

function projectMarkdownFiles(basePath, projects) {
  return Object.fromEntries(projects.map((project) => [
    `${basePath}/${safeFileName(`${String(project.id).padStart(2, "0")}-${project.title}`)}.md`,
    projectMarkdown(project),
  ]));
}

function readmeMarkdown(data) {
  const profile = data.introduce?.profile || {};
  return [
    "# Kim Dong Wook Portfolio",
    "",
    `${profile.role || "Full-Stack AI Engineer"} · ${profile.subtitle || ""}`.trim(),
    "",
    "This site boots as a DindbOS runtime and exposes the portfolio as real apps and files.",
    "",
    "- `/home/kimdongwook/profile.md`",
    "- `/home/kimdongwook/experience.md`",
    "- `/home/kimdongwook/projects/*.md`",
    "- `/mnt/portfolio/ko/*`",
    "- `/mnt/portfolio/en/*`",
  ].filter(Boolean).join("\n");
}

function profileMarkdown(introduce) {
  const profile = introduce?.profile || {};
  return [
    `# ${profile.nameEn || "Kim Dong Wook"}`,
    "",
    profile.nameKo || "",
    profile.role || "",
    profile.subtitle || "",
    "",
    ...(profile.intro || []),
    "",
    ...(introduce?.details || []),
  ].filter(Boolean).join("\n");
}

function experienceMarkdown(experiences) {
  return experiences.map((experience) => [
    `# ${experience.groupName || experience.title || "Experience"}`,
    "",
    `Position: ${experience.position || experience.role || "-"}`,
    `Period: ${experience.period || "-"}`,
    "",
    ...(experience.description || []),
    "",
    "Projects:",
    ...(experience.projects || []).map((project) => `- ${project}`),
  ].filter(Boolean).join("\n")).join("\n\n");
}

function skillsMarkdown(projects) {
  const languages = unique(projects.flatMap((project) => project.languages));
  const techStacks = unique(projects.flatMap((project) => project.techStacks));
  const categories = unique(projects.flatMap((project) => project.categories));
  return [
    "# Skills",
    "",
    "## Languages",
    ...languages.map((name) => `- ${name}`),
    "",
    "## Tech Stacks",
    ...techStacks.map((name) => `- ${name}`),
    "",
    "## Interests",
    ...categories.map((name) => `- ${name}`),
  ].join("\n");
}

function projectMarkdown(project) {
  return [
    `# ${project.title}`,
    "",
    `Role: ${project.role || "-"}`,
    `Categories: ${project.categories.join(", ") || "-"}`,
    `Languages: ${project.languages.join(", ") || "-"}`,
    `Tech: ${project.techStacks.join(", ") || "-"}`,
    "",
    "## Description",
    ...project.description.map((line) => `- ${line}`),
    "",
    "## Details",
    ...project.extraDescription.map((line) => `- ${line}`),
    "",
    "## Links",
    ...project.links.map((link) => `- [${link.name || "Open"}](${link.url})`),
    project.deck ? `- [Presentation](/assets/presentations/${project.deck.file})` : "",
    "",
    "## Media",
    ...project.media.map((item) => `- ${item.src}`),
  ].filter(Boolean).join("\n");
}

function safeFileName(value) {
  return String(value || "project")
    .replace(/[^\p{Letter}\p{Number}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "project";
}
