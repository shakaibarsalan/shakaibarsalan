// Live GitHub stats card: last-12-months contributions, streaks, a heatmap and top
// languages. The workflow in .github/workflows/stats.yml runs this daily and publishes
// stats-dark.svg / stats-light.svg on the `stats` branch.
// Local run: GITHUB_TOKEN=... node stats.mjs   (writes into STATS_OUT, default ../out)
import fs from "node:fs";
import path from "node:path";
import { fonts, themes, text, svg, ROOT } from "./lib.mjs";

const LOGIN = process.env.STATS_LOGIN || "shakaibarsalan";
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = process.env.STATS_OUT || path.join(ROOT, "out");
if (!TOKEN) throw new Error("set GITHUB_TOKEN");

// Notebook JSON, config and SQL migrations would swamp the real languages.
const SKIP = new Set(["Jupyter Notebook", "Dockerfile", "PLpgSQL", "Makefile", "Procfile", "Batchfile"]);

async function gql(query, variables) {
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": "profile-stats" },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors || !j.data) throw new Error(JSON.stringify(j.errors || j).slice(0, 400));
  return j.data;
}

const { user } = await gql(
  `query($l:String!){ user(login:$l){
    repositories(first:100, ownerAffiliations:OWNER, privacy:PUBLIC, isFork:false){
      totalCount nodes{ languages(first:10, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name } } } } }
    contributionsCollection{ contributionCalendar{ totalContributions
      weeks{ contributionDays{ date contributionCount } } } } } }`,
  { l: LOGIN },
);

const cal = user.contributionsCollection.contributionCalendar;
const days = cal.weeks.flatMap((w) => w.contributionDays);

// streaks: today with no contributions yet doesn't break the current streak
let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount) current++;
  else if (i === days.length - 1) continue;
  else break;
}

const bytes = {};
for (const n of user.repositories.nodes)
  for (const e of n.languages.edges) if (!SKIP.has(e.node.name)) bytes[e.node.name] = (bytes[e.node.name] || 0) + e.size;
const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
let langs = Object.entries(bytes).sort((a, b) => b[1] - a[1]).map(([name, b]) => ({ name, pct: (b / total) * 100 }));
if (langs.length > 5) {
  const rest = langs.slice(4).reduce((a, l) => a + l.pct, 0);
  langs = [...langs.slice(0, 4), { name: "Other", pct: rest }];
}

const stats = {
  contributions: cal.totalContributions, current, longest, repos: user.repositories.totalCount,
  langs, days, updated: new Date().toISOString().slice(0, 10),
};

const fmt = (n) => n.toLocaleString("en-US");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function card(t) {
  const W = 1280, H = 296, P = 36;
  const o = [];
  o.push(`<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="22" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>`);
  o.push(text("LAST 12 MONTHS ON GITHUB", fonts.mono500, 14, P + 4, P + 18, { ls: 1.8 }).el(t.accent));
  o.push(text(`updated ${stats.updated} by a GitHub Action`, fonts.mono400, 13, W - P - 4, P + 18, { anchor: "end" }).el(t.dim));

  // four numbers, 2 x 2
  const tiles = [
    [fmt(stats.contributions), "contributions"],
    [`${stats.current} ${stats.current === 1 ? "day" : "days"}`, "current streak"],
    [`${stats.longest} days`, "longest streak"],
    [fmt(stats.repos), "public repos"],
  ];
  tiles.forEach(([num, label], i) => {
    const x = P + 4 + (i % 2) * 236, y = 120 + Math.floor(i / 2) * 104;
    o.push(text(num, fonts.sans700, 44, x, y).el(t.text));
    o.push(text(label.toUpperCase(), fonts.mono400, 12.5, x + 2, y + 28, { ls: 1.4 }).el(t.dim));
  });

  // heatmap, one column per week
  const HX = 560, HY = 92, cell = 10.6, gap = 2.3, step = cell + gap;
  const max = Math.max(1, ...stats.days.map((d) => d.contributionCount));
  const level = (c) => (c === 0 ? 0 : Math.min(4, Math.ceil(Math.sqrt(c / max) * 4)));
  const ops = [0, 0.3, 0.5, 0.75, 1];
  let lastLabel = -99;
  cal.weeks.forEach((w, wi) => {
    const x = HX + wi * step;
    const first = w.contributionDays.find((d) => d.date.endsWith("-01"));
    if (first && x - lastLabel > 34 && wi < cal.weeks.length - 2) {
      o.push(text(MONTHS[+first.date.slice(5, 7) - 1], fonts.mono400, 11.5, x, HY - 10).el(t.dim));
      lastLabel = x;
    }
    for (const d of w.contributionDays) {
      const y = HY + new Date(d.date + "T00:00:00Z").getUTCDay() * step;
      const lv = level(d.contributionCount);
      o.push(lv
        ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell}" height="${cell}" rx="2.4" fill="${t.accent}" fill-opacity="${ops[lv]}"/>`
        : `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell}" height="${cell}" rx="2.4" fill="${t.faint}" fill-opacity="${t.name === "dark" ? 0.45 : 0.4}"/>`);
    }
  });

  // language bar
  const BX = HX, BY = 216, BW = W - P - 4 - HX;
  o.push(text("TOP LANGUAGES IN PUBLIC REPOS", fonts.mono400, 12.5, BX, BY - 12, { ls: 1.4 }).el(t.dim));
  const shades = [1, 0.72, 0.5, 0.32, 0.18];
  o.push(`<clipPath id="bar"><rect x="${BX}" y="${BY}" width="${BW}" height="12" rx="6"/></clipPath><g clip-path="url(#bar)">`);
  let bx = BX;
  stats.langs.forEach((l, i) => {
    const w = (l.pct / 100) * BW;
    o.push(`<rect x="${bx.toFixed(1)}" y="${BY}" width="${(w + 0.5).toFixed(1)}" height="12" fill="${t.accent}" fill-opacity="${shades[i]}"/>`);
    bx += w;
  });
  o.push(`</g>`);
  let lx = BX;
  stats.langs.forEach((l, i) => {
    o.push(`<rect x="${lx}" y="${BY + 30}" width="11" height="11" rx="3" fill="${t.accent}" fill-opacity="${shades[i]}"/>`);
    const name = text(l.name, fonts.sans600, 15, lx + 18, BY + 41);
    o.push(name.el(t.text));
    const pct = text(`${l.pct.toFixed(1)}%`, fonts.mono400, 13, lx + 18 + name.w + 7, BY + 41);
    o.push(pct.el(t.dim));
    lx = pct.x + pct.w + 26;
  });

  return svg(W, H,
    `GitHub, last 12 months: ${fmt(stats.contributions)} contributions, current streak ${stats.current} days, longest streak ${stats.longest} days, ${stats.repos} public repos. Top languages: ${stats.langs.map((l) => `${l.name} ${l.pct.toFixed(0)}%`).join(", ")}.`,
    o.join(""));
}

fs.mkdirSync(OUT, { recursive: true });
for (const t of Object.values(themes)) fs.writeFileSync(path.join(OUT, `stats-${t.name}.svg`), card(t));
const { days: _d, ...summary } = stats;
fs.writeFileSync(path.join(OUT, "stats.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(`contributions ${stats.contributions}, streak ${current}/${longest}, repos ${stats.repos}, langs ${langs.map((l) => l.name).join(" ")}`);
