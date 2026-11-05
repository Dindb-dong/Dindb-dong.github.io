import { escapeHtml } from "./html.js";

export function renderEmphasis(value, { bold = [], mark = [] } = {}) {
  const text = String(value ?? "");
  const phrases = [...mark.map(text => ({ text, marker: true })), ...bold.map(text => ({ text, marker: false }))].filter(({ text }) => text);
  let result = "";
  let cursor = 0;
  while (cursor < text.length) {
    const next = phrases.map(phrase => ({ ...phrase, index: text.indexOf(phrase.text, cursor) }))
      .filter(phrase => phrase.index !== -1)
      .sort((a, b) => a.index - b.index || b.text.length - a.text.length)[0];
    if (!next) return result + escapeHtml(text.slice(cursor));
    result += escapeHtml(text.slice(cursor, next.index));
    result += `<strong class="portfolio-emphasis${next.marker ? " portfolio-highlight" : ""}">${escapeHtml(next.text)}</strong>`;
    cursor = next.index + next.text.length;
  }
  return result;
}
