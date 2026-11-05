export function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function firstText(value) {
  if (Array.isArray(value)) return String(value.find(Boolean) || "");
  return String(value || "");
}
