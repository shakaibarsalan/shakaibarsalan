// Shared helpers: fonts turned into SVG paths (so the images look the same on every
// machine, no web fonts needed), text measuring and wrapping, and the two colour themes.
import * as ot from "opentype.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const opentype = ot.default || ot;
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const load = (name) => opentype.loadSync(path.join(ROOT, "assets", "fonts", name));
export const fonts = {
  sans500: load("inter-tight-latin-500-normal.woff"),
  sans600: load("inter-tight-latin-600-normal.woff"),
  sans700: load("inter-tight-latin-700-normal.woff"),
  mono400: load("ibm-plex-mono-latin-400-normal.woff"),
  mono500: load("ibm-plex-mono-latin-500-normal.woff"),
};

export const themes = {
  dark: {
    name: "dark", bg: "#0B1220", panel: "#0E1726", border: "#1F2B3D", text: "#EEF2F6",
    muted: "#A9B4C2", dim: "#7D8A9C", faint: "#33435A", dot: "#1B283A",
    accent: "#34D399", ridge: "#55667C", glow: 0.18, soft: 0.12,
  },
  light: {
    name: "light", bg: "#F7F9FB", panel: "#FFFFFF", border: "#DDE3EA", text: "#0B1220",
    muted: "#475467", dim: "#667085", faint: "#C3CCD6", dot: "#D5DDE6",
    accent: "#0A7A50", ridge: "#9AA8B8", glow: 0.12, soft: 0.09,
  },
};

const scale = (font, size) => size / font.unitsPerEm;

// Pen positions after each character, so a clip rect can "type" text one letter at a time.
export function stops(str, font, size, ls = 0) {
  const g = font.stringToGlyphs(str);
  const k = scale(font, size);
  const out = [];
  let x = 0;
  for (let i = 0; i < g.length; i++) {
    x += g[i].advanceWidth * k;
    out.push(x);
    if (i < g.length - 1) x += font.getKerningValue(g[i], g[i + 1]) * k + ls;
  }
  return out;
}

export const measure = (str, font, size, ls = 0) => (str ? stops(str, font, size, ls).at(-1) : 0);

// Each glyph is stored once per SVG in <defs> and placed with <use>, which keeps the
// files small. svg() writes the collected glyphs and starts a fresh set.
Object.entries(fonts).forEach(([k], i) => (fonts[k]._id = "abcdefgh"[i]));
let glyphs = new Map();

function glyphRef(font, g) {
  const id = font._id + g.index;
  if (!glyphs.has(id)) glyphs.set(id, g.getPath(0, 0, font.unitsPerEm).toPathData(0));
  return id;
}

// Text placed as glyph references. anchor: start | middle | end.
// .el(fill, attrs) returns the markup; attrs (e.g. a clip-path) go on an outer group so
// they use page coordinates, not the scaled glyph space.
export function text(str, font, size, x, y, { ls = 0, anchor = "start" } = {}) {
  const w = measure(str, font, size, ls);
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const g = font.stringToGlyphs(str);
  const k = scale(font, size);
  const lsU = ls / k;
  let u = 0;
  let uses = "";
  for (let i = 0; i < g.length; i++) {
    if (g[i].path && g[i].path.commands && g[i].path.commands.length) uses += `<use href="#${glyphRef(font, g[i])}" x="${Math.round(u)}"/>`;
    u += g[i].advanceWidth;
    if (i < g.length - 1) u += font.getKerningValue(g[i], g[i + 1]) + lsU;
  }
  const el = (fill, attrs = "") =>
    `<g fill="${fill}" ${attrs}><g transform="translate(${+x0.toFixed(2)} ${+y.toFixed(2)}) scale(${+k.toFixed(6)})">${uses}</g></g>`;
  return { w, x: x0, el };
}

export function wrap(str, font, size, maxW) {
  const lines = [];
  let line = "";
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next, font, size) > maxW && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function svg(w, h, label, body) {
  const defs = [...glyphs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join("");
  glyphs = new Map();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><defs>${defs}</defs>${body}</svg>\n`;
}

export function write(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

// Small line icons drawn in a 46x46 box. Stroke colour comes from the caller.
export const icons = {
  fingerprint: `<path d="M15 30c-1.5-3-2-6-1-9a10 10 0 0 1 19 1c.6 3 .4 6-.4 9"/><path d="M18.5 32c-1.2-2.6-1.6-5.4-.9-8a5.6 5.6 0 0 1 10.8.6c.5 2.6.3 5.2-.5 7.6"/><path d="M23 23.5c.6 3 .4 6-.6 9"/>`,
  chip: `<rect x="14" y="14" width="18" height="18" rx="3"/><rect x="19.5" y="19.5" width="7" height="7" rx="1.5"/><path d="M19 10v4M27 10v4M19 32v4M27 32v4M10 19h4M10 27h4M32 19h4M32 27h4"/>`,
  hanger: `<path d="M20 16.5a3 3 0 1 1 3 3v2.5"/><path d="M23 22l12 8.5c.9.7.4 2-.7 2H11.7c-1.1 0-1.6-1.3-.7-2L23 22z"/>`,
  briefcase: `<rect x="11" y="17" width="24" height="17" rx="3"/><path d="M19 17v-2.5a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 1.5 1.5V17M11 25h24M23 23.5v3"/>`,
  nodes: `<circle cx="14" cy="23" r="3.2"/><circle cx="32" cy="14" r="3.2"/><circle cx="32" cy="32" r="3.2"/><path d="M17 21.5l12-6M17 24.5l12 6M32 17.2v11.6"/>`,
  facescan: `<path d="M12 18v-3a3 3 0 0 1 3-3h3M28 12h3a3 3 0 0 1 3 3v3M34 28v3a3 3 0 0 1-3 3h-3M18 34h-3a3 3 0 0 1-3-3v-3"/><path d="M19 20.5v1.5M27 20.5v1.5M18.5 27c2.6 2.6 6.4 2.6 9 0"/>`,
  ferry: `<circle cx="15" cy="31" r="4"/><circle cx="31" cy="15" r="4"/><path d="M18 28l10-10"/>`,
  wave: `<path d="M11 21v4M15 17v12M19 13v20M23 19v8M27 15v16M31 18v10M35 21v4"/>`,
  boxes: `<rect x="11.5" y="23.5" width="10" height="10" rx="1.5"/><rect x="24.5" y="23.5" width="10" height="10" rx="1.5"/><rect x="18" y="12" width="10" height="10" rx="1.5"/>`,
  search: `<circle cx="21" cy="21" r="7.5"/><path d="M26.5 26.5l7 7"/>`,
  server: `<rect x="12" y="12" width="22" height="9" rx="2.5"/><rect x="12" y="25" width="22" height="9" rx="2.5"/><path d="M16.5 16.5h.01M16.5 29.5h.01M21 16.5h8M21 29.5h8"/>`,
  mic: `<rect x="18" y="10" width="10" height="17" rx="5"/><path d="M13 23a10 10 0 0 0 20 0M23 33v3.5M18.5 36.5h9"/>`,
  drone: `<rect x="19" y="19" width="8" height="8" rx="2"/><path d="M19 19l-4-4M27 19l4-4M19 27l-4 4M27 27l4 4"/><circle cx="13" cy="13" r="3.5"/><circle cx="33" cy="13" r="3.5"/><circle cx="13" cy="33" r="3.5"/><circle cx="33" cy="33" r="3.5"/>`,
  rtl: `<path d="M34 15H16M34 21H12M34 27H19M34 33H14"/>`,
  chart: `<path d="M12 34h22"/><rect x="14" y="23" width="4.5" height="11" rx="1"/><rect x="21" y="15" width="4.5" height="19" rx="1"/><rect x="28" y="26" width="4.5" height="8" rx="1"/>`,
};
