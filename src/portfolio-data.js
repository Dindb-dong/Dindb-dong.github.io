import { firstText } from "./utils/values.js";

const PORTFOLIO_BASE = "/portfolio";
const PRESENTATIONS_MANIFEST = "/assets/presentations/manifest.json";
const LANGUAGE_STORAGE_KEYS = ["dindbos-language", "portfolio-language"];
const SUPPORTED_LOCALES = ["ko", "en"];

const LOCALE_FILES = {
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
  20: ["proj_20_1.png", "proj_20_2.png"],
  17: ["proj_17_1.png"],
  19: ["proj_19_2.png", "proj_19_1.png"],
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

export async function loadPortfolioRuntime(report = () => {}) {
  const [ko, en, presentations, browserConfig] = await Promise.all([
    loadLocaleData("ko", report),
    loadLocaleData("en", report).catch(() => loadLocaleData("ko", report)),
    fetchJson(PRESENTATIONS_MANIFEST, report).catch(() => []),
    fetchJson("/remote-browser.config.json", report).catch(() => ({})),
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
    projectQuery: "",
    projectBrowse: true,
    views: new Map(),
  };
}

export function currentData(runtime) {
  return runtime.datasets[runtime.locale] || runtime.datasets.ko;
}

export function loadLocale() {
  const requested = new URLSearchParams(globalThis.location?.search).get("ln");
  if (SUPPORTED_LOCALES.includes(requested)) return requested;
  try {
    for (const key of LANGUAGE_STORAGE_KEYS) {
      const value = globalThis.localStorage?.getItem(key);
      if (SUPPORTED_LOCALES.includes(value)) return value;
    }
  } catch { /* Browser language still works when storage is unavailable. */ }
  return globalThis.navigator?.language?.toLowerCase().split("-")[0] === "ko" ? "ko" : "en";
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

async function loadLocaleData(locale, report) {
  const files = LOCALE_FILES[locale];
  const [projectsJson, introduce, experiences] = await Promise.all([
    fetchJson(`${PORTFOLIO_BASE}/data/${files.projects}`, report),
    fetchJson(`${PORTFOLIO_BASE}/data/${files.introduce}`, report),
    fetchJson(`${PORTFOLIO_BASE}/data/${files.experiences}`, report),
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
      links: Array.isArray(project.links) ? project.links.filter((link) => link?.url) : [],
      media: (MEDIA[projectId] || []).map((file) => ({
        file,
        src: `${PORTFOLIO_BASE}/media/${file}`,
        type: /\.(mp4|mov)$/i.test(file) ? "video" : "image",
      })),
    };
  }).sort((left, right) => right.id - left.id);
}

async function fetchJson(path, report) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  const data = await response.json();
  report(`Loaded ${path}`);
  return data;
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined).map(String);
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
}
