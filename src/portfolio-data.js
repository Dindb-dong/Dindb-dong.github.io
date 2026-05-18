const LEGACY_BASE = "/legacy/public";
const PRESENTATIONS_MANIFEST = "/assets/presentations/manifest.json";
const LANGUAGE_STORAGE_KEYS = ["dindbos-language", "portfolio-language"];
const SUPPORTED_LOCALES = ["ko", "en"];

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
  14: ["proj_14_1.png", "proj_14_2.png"],
  15: ["proj_15_1.png"],
  16: [
    "proj_16_0.png",
    "proj_16_7.png",
    "proj_16_1.jpeg",
    "proj_16_2.png",
    "proj_16_3.png",
    "proj_16_4.png",
    "proj_16_5.png",
    "proj_16_6.png",
  ],
};

export const CONTACT_LINKS = [
  { label: "GitHub", href: "https://github.com/Dindb-dong" },
  { label: "Email", href: "mailto:dongwook443@yonsei.ac.kr" },
];

export const SKILLS = {
  languages: ["JavaScript", "TypeScript", "Python", "R", "C++", "C#", "Java", "Dart"],
  techStacks: [
    "React",
    "React Native",
    "Flutter",
    "Node.js",
    "Docker",
    "Kubernetes",
    "AWS",
    "MongoDB",
    "Supabase",
    "PyTorch",
    "TensorFlow",
    "Qiskit",
  ],
  interests: ["AI", "Computer Science", "Data Science", "Quantum Computing", "Web", "Mobile", "Game"],
};

export async function loadPortfolioRuntime() {
  const [ko, en, presentations, browserConfig] = await Promise.all([
    loadLocaleData("ko"),
    loadLocaleData("en").catch(() => loadLocaleData("ko")),
    fetchJson(PRESENTATIONS_MANIFEST).catch(() => []),
    fetchJson("/remote-browser.config.json").catch(() => ({})),
  ]);
  const datasets = {
    ko: attachPresentations(ko, presentations),
    en: attachPresentations(en, presentations),
  };

  return {
    browserConfig,
    datasets,
    locale: loadLocale(),
    presentations,
    selectedProjectId: datasets.ko.projects[0]?.id || 1,
    projectFilter: { type: "all", value: "All" },
    views: new Map(),
  };
}

export function currentData(runtime) {
  return runtime.datasets[runtime.locale] || runtime.datasets.ko;
}

export function loadLocale() {
  for (const key of LANGUAGE_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (SUPPORTED_LOCALES.includes(value)) return value;
  }
  return "ko";
}

export function persistLocale(locale) {
  const nextLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "ko";
  for (const key of LANGUAGE_STORAGE_KEYS) {
    localStorage.setItem(key, nextLocale);
  }
  return nextLocale;
}

export function portfolioDataForBuiltin(data) {
  const profile = data.introduce?.profile || {};
  return {
    name: profile.nameEn || "Kim Dong Wook",
    summary: [
      profile.role || "Full-Stack AI Engineer",
      profile.subtitle || "",
      `${data.projects.length} restored projects`,
      "Mounted as a real DindbOS browser runtime.",
    ].filter(Boolean).join(" · "),
    projects: data.projects.map((project) => ({
      name: project.title,
      type: [project.role, ...project.categories].filter(Boolean).join(" · "),
      description: firstText(project.description) || firstText(project.extraDescription),
    })),
  };
}

export function buildPortfolioFileSystem(runtime) {
  const ko = runtime.datasets.ko;
  const en = runtime.datasets.en;
  const active = currentData(runtime);

  return {
    "/etc/motd": [
      "Welcome to DindbOS Portfolio.",
      "Legacy portfolio data is restored as OS files and apps.",
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

async function loadLocaleData(locale) {
  const files = LEGACY_FILES[locale];
  const [projectsJson, introduce, experiences] = await Promise.all([
    fetchJson(`${LEGACY_BASE}/${files.projects}`),
    fetchJson(`${LEGACY_BASE}/${files.introduce}`),
    fetchJson(`${LEGACY_BASE}/${files.experiences}`),
  ]);

  return {
    locale,
    introduce,
    experiences: Array.isArray(experiences) ? experiences : [],
    projects: normalizeProjects(projectsJson),
    raw: { projects: projectsJson, introduce, experiences },
  };
}

function attachPresentations(data, presentations) {
  return {
    ...data,
    projects: data.projects.map((project) => ({
      ...project,
      deck: presentations.find((entry) => Number(entry.projectId) === Number(project.id)) || null,
    })),
  };
}

function normalizeProjects(projectsJson) {
  return Object.entries(projectsJson || {}).map(([id, project]) => {
    const projectId = Number(id);
    return {
      id: projectId,
      title: String(project.title || `Project ${projectId}`),
      role: String(project.role || "Project"),
      languages: toArray(project.languages),
      techStacks: toArray(project.techStacks),
      categories: toArray(project.categories),
      description: toArray(project.description),
      extraDescription: toArray(project.extraDescription),
      links: toArray(project.links),
      media: (MEDIA[projectId] || []).map((file) => ({
        file,
        src: `${LEGACY_BASE}/thumbnails/${file}`,
        type: /\.(mp4|mov)$/i.test(file) ? "video" : "image",
      })),
    };
  });
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined).map(String);
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function firstText(value) {
  if (Array.isArray(value)) return String(value.find(Boolean) || "");
  return String(value || "");
}

function safeFileName(value) {
  return String(value || "project")
    .replace(/[^\p{Letter}\p{Number}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "project";
}
