// Builds every static image the profile README uses, in a dark and a light version.
// Run: npm install && npm run assets   (writes into ../assets)
import { fonts, themes, text, stops, measure, svg, write, icons } from "./lib.mjs";

const f = (n) => +n.toFixed(3);

// SMIL helpers. Every animation starts at 0s and holds its "before" value until its own
// begin time, so a viewer that ignores animation still sees the finished image.
const appear = (begin, dur = 0.6) =>
  `<animate attributeName="opacity" values="0;0;1" keyTimes="0;${f(begin / (begin + dur))};1" dur="${f(begin + dur)}s" fill="freeze"/>`;
const rise = (begin, dur = 0.7, dy = 14) =>
  `<animateTransform attributeName="transform" type="translate" values="0 ${dy};0 ${dy};0 0" keyTimes="0;${f(begin / (begin + dur))};1" calcMode="spline" keySplines="0 0 1 1;.2 .7 .2 1" dur="${f(begin + dur)}s" fill="freeze"/>`;

// Discrete width steps that reveal text one character at a time.
function typeWidths(st, begin, perChar) {
  const dur = begin + st.length * perChar;
  const values = [0, ...st.map((w) => f(w + 3))];
  const keyTimes = [0, ...st.map((_, i) => f((begin + i * perChar) / dur))];
  return { dur: f(dur), values: values.join(";"), keyTimes: keyTimes.join(";") };
}

function header(t) {
  const W = 1280, H = 380, C = W / 2;
  const defs = [];
  const body = [];

  defs.push(
    `<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${t.dot}"/></pattern>`,
    `<radialGradient id="glow"><stop offset="0" stop-color="${t.accent}" stop-opacity="${t.glow}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>`,
    `<clipPath id="card"><rect width="${W}" height="${H}" rx="24"/></clipPath>`,
  );

  body.push(`<rect width="${W}" height="${H}" fill="${t.bg}"/>`, `<rect width="${W}" height="${H}" fill="url(#dots)"/>`);
  // two soft glows in opposite corners, drifting slowly
  body.push(`<circle cx="170" cy="30" r="310" fill="url(#glow)"><animate attributeName="cx" values="170;270;170" dur="14s" repeatCount="indefinite"/></circle>`);
  body.push(`<circle cx="1110" cy="360" r="330" fill="url(#glow)"><animate attributeName="cx" values="1110;1000;1110" dur="17s" repeatCount="indefinite"/></circle>`);

  // kicker, typed
  const kStr = "AI ENGINEER  ·  FULL-STACK DEVELOPER";
  const kY = 100;
  const kx = C - measure(kStr, fonts.mono500, 17, 2.6) / 2;
  const k = text(kStr, fonts.mono500, 17, kx, kY, { ls: 2.6 });
  const kt = typeWidths(stops(kStr, fonts.mono500, 17, 2.6), 0.2, 0.03);
  defs.push(`<clipPath id="kclip"><rect x="${f(kx)}" y="${kY - 18}" width="${f(k.w + 3)}" height="26"><animate attributeName="width" calcMode="discrete" values="${kt.values}" keyTimes="${kt.keyTimes}" dur="${kt.dur}s" fill="freeze"/></rect></clipPath>`);
  body.push(k.el(t.accent, `clip-path="url(#kclip)"`));

  // name and tagline rise in
  const name = text("Muhammad Shakaib Arsalan", fonts.sans700, 64, C, 176, { anchor: "middle" });
  body.push(`<g>${appear(0.45)}<g>${rise(0.45)}${name.el(t.text)}</g></g>`);
  const w1 = measure("I build AI products ", fonts.sans600, 30), w2 = measure("end to end.", fonts.sans600, 30);
  const tag1 = text("I build AI products ", fonts.sans600, 30, C - (w1 + w2) / 2, 228);
  const tag2 = text("end to end.", fonts.sans600, 30, C - (w1 + w2) / 2 + w1, 228);
  body.push(`<g>${appear(0.75)}<g>${rise(0.75)}${tag1.el(t.muted)}${tag2.el(t.accent)}</g></g>`);

  // rotating line: each phrase is centred with its own "$" prompt, typed, held, erased
  const pY = 286, FS = 20, gap = 12;
  const pw = measure("$", fonts.mono500, FS);
  const phrases = [
    "voice agents that pick up real phone calls",
    "RAG search over tens of millions of products",
    "fingerprint scans from a plain phone camera",
    "and the auth, billing and deploys around them",
  ];
  const lead = 1.3, slot = 4.6, T = lead + phrases.length * slot;
  const cursorPts = [];
  let cursor0 = 0;
  phrases.forEach((p, i) => {
    const st = stops(p, fonts.mono400, FS);
    const sx = C - (pw + gap + st.at(-1) + 14) / 2;
    const base = pw + gap;
    const full = base + st.at(-1) + 2;
    const t0 = lead + i * slot;
    const pts = [[0, 0], [t0, base]];
    st.forEach((w, j) => pts.push([t0 + (j + 1) * 0.032, base + w + 2]));
    const eraseAt = t0 + slot - 0.85, steps = 8;
    for (let s = 1; s <= steps; s++) pts.push([eraseAt + s * 0.05, base + (full - base) * (1 - s / steps)]);
    pts.push([t0 + slot - 0.2, 0]);
    if (i === 0) { cursorPts.push([0, sx + base + 2]); cursor0 = sx + full + 2; }
    for (const [tt, r] of pts.slice(1)) cursorPts.push([tt, sx + Math.max(r, base) + 2]);
    const vals = pts.map((q) => f(q[1])).join(";");
    const kts = pts.map((q) => f(q[0] / T)).join(";");
    defs.push(`<clipPath id="ph${i}"><rect x="${f(sx)}" y="${pY - 22}" height="30" width="${i === 0 ? f(full) : 0}"><animate attributeName="width" calcMode="discrete" values="${vals}" keyTimes="${kts}" dur="${f(T)}s" repeatCount="indefinite"/></rect></clipPath>`);
    body.push(`<g clip-path="url(#ph${i})">${text("$", fonts.mono500, FS, sx, pY).el(t.accent)}${text(p, fonts.mono400, FS, sx + base, pY).el(t.text)}</g>`);
  });
  const cv = cursorPts.map((q) => f(q[1])).join(";");
  const ck = cursorPts.map((q) => f(q[0] / T)).join(";");
  body.push(`<rect y="${pY - 16}" width="11" height="21" fill="${t.accent}" x="${f(cursor0)}"><animate attributeName="x" calcMode="discrete" values="${cv}" keyTimes="${ck}" dur="${f(T)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" calcMode="discrete" dur="1.05s" repeatCount="indefinite"/></rect>`);

  // status row, centred
  const sY = 340;
  const openW = measure("Open to work", fonts.sans600, 20);
  const whereS = "Lahore  ·  Islamabad  ·  remote", whereW = measure(whereS, fonts.mono400, 16);
  const siteW = measure("shakaib.vercel.app", fonts.mono500, 16);
  const sx = C - (26 + openW + 20 + whereW + 30 + siteW) / 2;
  body.push(`<g>${appear(1.1)}`);
  body.push(`<circle cx="${f(sx + 7)}" cy="${sY - 7}" r="5.5" fill="${t.accent}"/><circle cx="${f(sx + 7)}" cy="${sY - 7}" r="5" fill="none" stroke="${t.accent}" stroke-width="2"><animate attributeName="r" values="5;15" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2s" repeatCount="indefinite"/></circle>`);
  const open = text("Open to work", fonts.sans600, 20, sx + 26, sY);
  const where = text(whereS, fonts.mono400, 16, sx + 26 + openW + 20, sY);
  const site = text("shakaib.vercel.app", fonts.mono500, 16, where.x + whereW + 30, sY);
  body.push(open.el(t.text) + where.el(t.dim));
  body.push(`<rect x="${f(where.x + whereW + 14)}" y="${sY - 14}" width="1.5" height="17" fill="${t.faint}"/>${site.el(t.text)}</g>`);

  body.push(`<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="23.5" fill="none" stroke="${t.border}" stroke-width="1.5"/>`);

  return svg(W, H, "Muhammad Shakaib Arsalan. AI engineer and full-stack developer. I build AI products end to end. Open to work in Lahore, Islamabad or remote.",
    `<defs>${defs.join("")}</defs><g clip-path="url(#card)">${body.join("")}</g>`);
}

// Project logos for the README tables: navy tile, green line icon. Like the buttons,
// one version works on both GitHub themes.
const projectIcons = {
  attendify: "fingerprint", nexalm: "chip", tryon: "hanger", "linkedin-job-agent": "briefcase",
  "n8n-client-hunt": "nodes", "face-liveness-detection": "facescan", ferry: "ferry",
  xaibridge: "server", sandstorms: "wave", govava: "search", invento: "boxes",
};

function iconTile(name, icon) {
  const S = 64;
  return svg(S, S, name,
    `<rect x=".75" y=".75" width="${S - 1.5}" height="${S - 1.5}" rx="16" fill="#0B1220" stroke="#2A3A50" stroke-width="1.5"/>` +
    `<g transform="scale(${f(S / 46)})" fill="none" stroke="#34D399" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${icons[icon]}</g>`);
}

const pillIcons = {
  globe: `<circle cx="9" cy="9" r="7.5"/><path d="M1.5 9h15M9 1.5c2.2 2.1 3.3 4.6 3.3 7.5S11.2 14.4 9 16.5C6.8 14.4 5.7 11.9 5.7 9S6.8 3.6 9 1.5z"/>`,
  linkedin: `<rect x="1.5" y="1.5" width="15" height="15" rx="3"/><path d="M5.5 8v5M5.5 5.2v.01M8.6 13V8M8.6 10.2c0-1.4.9-2.3 2.1-2.3s1.9.8 1.9 2.3V13"/>`,
  mail: `<rect x="1.5" y="3.5" width="15" height="11" rx="2.5"/><path d="M2.5 5l6.5 5 6.5-5"/>`,
  code: `<path d="M6 4.5L1.5 9 6 13.5M12 4.5L16.5 9 12 13.5M10.2 3l-2.4 12"/>`,
  live: `<circle cx="9" cy="9" r="3.2" fill="currentColor"/><circle cx="9" cy="9" r="7"/>`,
  file: `<path d="M4 1.5h6.5L14.5 5.5V16a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z"/><path d="M10 1.5V6h4.5M6.5 10h5M6.5 13h5"/>`,
};

// Buttons sit on GitHub's own page background, so one navy version works in both themes.
function pill(label, icon) {
  const H = 46;
  const tw = measure(label, fonts.sans600, 16);
  const W = Math.round(20 + 18 + 11 + tw + 22);
  return svg(W, H, label,
    `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="${H / 2 - 0.75}" fill="#0B1220" stroke="#2A3A50" stroke-width="1.5"/>` +
    `<g transform="translate(20 14)" fill="none" stroke="#34D399" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" color="#34D399">${pillIcons[icon]}</g>` +
    `${text(label, fonts.sans600, 16, 49, 29).el("#EEF2F6")}`);
}

const stack = [
  ["AI and ML", ["LLMs", "RAG", "pgvector", "AWS Bedrock", "Gemini", "Llama on Groq", "Whisper", "Deepgram", "ElevenLabs", "MediaPipe", "OpenCV", "InsightFace", "PyTorch", "scikit-learn", "n8n"]],
  ["Backend", ["Python", "FastAPI", "Django", "Node.js", "Express", "Fastify", "PostgreSQL", "MySQL", "Redis", "Socket.IO", "Twilio", "Asterisk"]],
  ["Frontend", ["TypeScript", "React", "Next.js", "Vite", "Tailwind CSS", "Streamlit", "Chrome extensions"]],
  ["Cloud and ops", ["AWS", "Cloudflare Workers", "Docker", "Vercel", "Supabase", "GitHub Actions", "nginx", "Linux servers"]],
];

function stackCard(t) {
  const W = 1280, P = 36, LX = 250, CH = 38, GAP = 10, ROWGAP = 12, FS = 17;
  const out = [];
  let y = P;
  for (const [label, items] of stack) {
    out.push(`${text(label.toUpperCase(), fonts.mono500, 14, P + 6, y + 25, { ls: 1.8 }).el(t.accent)}`);
    let x = LX;
    for (const it of items) {
      const w = measure(it, fonts.sans500, FS) + 30;
      if (x + w > W - P) { x = LX; y += CH + GAP; }
      out.push(`<rect x="${f(x)}" y="${y}" width="${f(w)}" height="${CH}" rx="10" fill="${t.panel}" stroke="${t.border}" stroke-width="1.3"/>`);
      out.push(`${text(it, fonts.sans500, FS, x + 15, y + 25).el(t.text)}`);
      x += w + GAP;
    }
    y += CH + GAP + ROWGAP;
  }
  const H = y - GAP - ROWGAP + P;
  return svg(W, H, "Stack. " + stack.map(([l, i]) => `${l}: ${i.join(", ")}`).join(". "),
    `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="22" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>` + out.join(""));
}

for (const t of Object.values(themes)) {
  write(`assets/header-${t.name}.svg`, header(t));
  write(`assets/stack-${t.name}.svg`, stackCard(t));
}
const pills = { portfolio: ["Portfolio", "globe"], linkedin: ["LinkedIn", "linkedin"], email: ["Email me", "mail"], live: ["Live site", "live"], source: ["Source code", "code"] };
for (const [k, [label, icon]] of Object.entries(pills)) write(`assets/buttons/${k}.svg`, pill(label, icon));
for (const [slug, icon] of Object.entries(projectIcons)) write(`assets/icons/${slug}.svg`, iconTile(slug, icon));
console.log("built header and stack x 2 themes,", Object.keys(projectIcons).length, "icons,", Object.keys(pills).length, "buttons");
