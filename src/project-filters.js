export function filteredProjects(projects, filter, query = "", { categories = [], tags = [], sort = "newest" } = {}) {
  const text = String(query).trim().toLocaleLowerCase();
  return projects.filter(project => {
    if (filter?.type === "category" && !project.categories.includes(filter.value)) return false;
    if (filter?.type === "language" && !project.languages.includes(filter.value)) return false;
    if (filter?.type === "tech" && !project.techStacks.includes(filter.value)) return false;
    if (categories.length && !categories.some(category => project.categories.includes(category))) return false;
    if (!tags.every(tag => [...project.languages, ...project.techStacks].includes(tag))) return false;
    return !text || [project.title, project.role, ...project.categories, ...project.languages, ...project.techStacks, ...project.description].join(" ").toLocaleLowerCase().includes(text);
  }).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? a.id - b.id : b.id - a.id);
}
