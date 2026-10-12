// Builds every static image the profile README uses, in a dark and a light version.
// Run: npm install && npm run assets   (writes into ../assets)
import { fonts, themes, text, stops, measure, wrap, svg, write, icons } from "./lib.mjs";
import { cards } from "./cards.mjs";

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
  const W = 1280, H = 400, X = 76;
  const defs = [];
  const body = [];

  // fingerprint frame on the right
  const fx = 972, fy = 54, fw = 236, fh = 292;
  const cx = fx + fw / 2, cy = fy + fh / 2;

  defs.push(
    `<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${t.dot}"/></pattern>`,
    `<radialGradient id="glow"><stop offset="0" stop-color="${t.accent}" stop-opacity="${t.glow}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="trail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.accent}" stop-opacity="0"/><stop offset="1" stop-color="${t.accent}" stop-opacity=".22"/></linearGradient>`,
    `<clipPath id="card"><rect width="${W}" height="${H}" rx="24"/></clipPath>`,
    `<clipPath id="fp"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="20"/></clipPath>`,
  );

  body.push(`<rect width="${W}" height="${H}" fill="${t.bg}"/>`, `<rect width="${W}" height="${H}" fill="url(#dots)"/>`);
  body.push(`<circle cx="${cx}" cy="${cy}" r="250" fill="url(#glow)"><animate attributeName="r" values="230;290;230" dur="9s" repeatCount="indefinite"/></circle>`);

  // kicker, typed
  const kStr = "AI ENGINEER  ·  FULL-STACK DEVELOPER";
  const kY = 110;
  const k = text(kStr, fonts.mono500, 17, X, kY, { ls: 2.6 });
  const kt = typeWidths(stops(kStr, fonts.mono500, 17, 2.6), 0.2, 0.03);
  defs.push(`<clipPath id="kclip"><rect x="${X}" y="${kY - 18}" width="${f(k.w + 3)}" height="26"><animate attributeName="width" calcMode="discrete" values="${kt.values}" keyTimes="${kt.keyTimes}" dur="${kt.dur}s" fill="freeze"/></rect></clipPath>`);
  body.push(`${k.el(t.accent, `clip-path="url(#kclip)"`)}`);

  // name and tagline rise in
  const name = text("Muhammad Shakaib Arsalan", fonts.sans700, 60, X - 3, 184);
  body.push(`<g>${appear(0.45)}<g>${rise(0.45)}${name.el(t.text)}</g></g>`);
  const tag1 = text("I build AI products ", fonts.sans600, 30, X, 234);
  const tag2 = text("end to end.", fonts.sans600, 30, X + tag1.w, 234);
  body.push(`<g>${appear(0.75)}<g>${rise(0.75)}${tag1.el(t.muted)}${tag2.el(t.accent)}</g></g>`);

  // rotating line: types a phrase, holds, erases, next phrase
  const pY = 292;
  const prompt = text("$", fonts.mono500, 20, X, pY);
  const px = X + prompt.w + 12;
  const phrases = [
    "voice agents that pick up real phone calls",
    "RAG search over tens of millions of products",
    "fingerprint scans from a plain phone camera",
    "and the auth, billing and deploys around them",
  ];
  const lead = 1.3, slot = 4.6, T = lead + phrases.length * slot;
  const cursorPts = [[0, 0]];
  phrases.forEach((p, i) => {
    const st = stops(p, fonts.mono400, 20);
    const t0 = lead + i * slot;
    const pts = [[0, 0]];
    st.forEach((w, j) => pts.push([t0 + j * 0.032, w + 2]));
    const eraseAt = t0 + slot - 0.85;
    const steps = 8;
    for (let s = 1; s <= steps; s++) pts.push([eraseAt + s * 0.05, (st.at(-1) + 2) * (1 - s / steps)]);
    pts.push([t0 + slot - 0.2, 0]);
    cursorPts.push(...pts.slice(1));
    const vals = pts.map((q) => f(q[1])).join(";");
    const kts = pts.map((q) => f(q[0] / T)).join(";");
    const ph = text(p, fonts.mono400, 20, px, pY);
    defs.push(`<clipPath id="ph${i}"><rect x="${px}" y="${pY - 22}" height="30" width="${i === 0 ? f(ph.w + 2) : 0}"><animate attributeName="width" calcMode="discrete" values="${vals}" keyTimes="${kts}" dur="${f(T)}s" repeatCount="indefinite"/></rect></clipPath>`);
    body.push(`${ph.el(t.text, `clip-path="url(#ph${i})"`)}`);
  });
  body.push(`${prompt.el(t.accent)}`);
  const cv = cursorPts.map((q) => f(px + q[1] + 2)).join(";");
  const ck = cursorPts.map((q) => f(q[0] / T)).join(";");
  body.push(`<rect y="${pY - 16}" width="11" height="21" fill="${t.accent}" x="${px + measure(phrases[0], fonts.mono400, 20) + 4}"><animate attributeName="x" calcMode="discrete" values="${cv}" keyTimes="${ck}" dur="${f(T)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" calcMode="discrete" dur="1.05s" repeatCount="indefinite"/></rect>`);

  // status row
  const sY = 350;
  body.push(`<g>${appear(1.1)}`);
  body.push(`<circle cx="${X + 7}" cy="${sY - 7}" r="5.5" fill="${t.accent}"/><circle cx="${X + 7}" cy="${sY - 7}" r="5" fill="none" stroke="${t.accent}" stroke-width="2"><animate attributeName="r" values="5;15" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2s" repeatCount="indefinite"/></circle>`);
  const open = text("Open to work", fonts.sans600, 20, X + 26, sY);
  const where = text("Lahore  ·  Islamabad  ·  remote", fonts.mono400, 16, X + 26 + open.w + 20, sY);
  const site = text("shakaib.vercel.app", fonts.mono500, 16, where.x + where.w + 30, sY);
  body.push(`${open.el(t.text)}${where.el(t.dim)}`);
  body.push(`<rect x="${where.x + where.w + 14}" y="${sY - 14}" width="1.5" height="17" fill="${t.faint}"/>${site.el(t.text)}</g>`);

  // fingerprint: loop ridges that draw themselves, then a scan line and a "verified" chip
  const ridges = [];
  for (let r = 0; r < 16; r++) {
    const base = 7 + r * 7.4;
    const n = 40 + r * 3;
    const a0 = Math.PI * 0.555, a1 = Math.PI * 2.445;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      const wob = 1 + 0.028 * (Math.sin(i * 0.42 + r * 1.7) + Math.sin(i * 0.17 + r * 0.6));
      const x = cx + base * 0.84 * wob * Math.cos(a);
      const y = cy - 16 + base * 1.16 * wob * Math.sin(a);
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    const b = 0.55 + r * 0.085, dur = 0.55;
    const col = r % 4 === 3 ? t.accent : t.ridge;
    ridges.push(`<path d="${d}" stroke="${col}" pathLength="1" stroke-dasharray="1 1"><animate attributeName="stroke-dashoffset" values="1;1;0" keyTimes="0;${f(b / (b + dur))};1" dur="${f(b + dur)}s" fill="freeze"/></path>`);
  }
  body.push(`<g clip-path="url(#fp)" fill="none" stroke-width="2.3" stroke-linecap="round" opacity=".95">${ridges.join("")}</g>`);

  // scan sweep, hidden below the frame between passes
  const off = fh + 44;
  body.push(`<g clip-path="url(#fp)"><g transform="translate(0 ${off})"><rect x="${fx}" y="${fy - 42}" width="${fw}" height="42" fill="url(#trail)"/><rect x="${fx}" y="${fy - 1.5}" width="${fw}" height="2.5" fill="${t.accent}"/><animateTransform attributeName="transform" type="translate" values="0 0;0 ${off};0 ${off}" keyTimes="0;.55;1" dur="3.2s" begin="2.2s" repeatCount="indefinite"/></g></g>`);

  // corner brackets
  const L = 26, R = 14, s = `stroke="${t.accent}" stroke-width="3" fill="none" stroke-linecap="round"`;
  const x0 = fx, y0 = fy, x1 = fx + fw, y1 = fy + fh;
  body.push(`<path ${s} d="M${x0} ${y0 + L}V${y0 + R}Q${x0} ${y0} ${x0 + R} ${y0}H${x0 + L}M${x1 - L} ${y0}H${x1 - R}Q${x1} ${y0} ${x1} ${y0 + R}V${y0 + L}M${x1} ${y1 - L}V${y1 - R}Q${x1} ${y1} ${x1 - R} ${y1}H${x1 - L}M${x0 + L} ${y1}H${x0 + R}Q${x0} ${y1} ${x0} ${y1 - R}V${y1 - L}"/>`);

  // verified chip
  const vt = text("verified", fonts.mono500, 13, 0, 0);
  const cw = 30 + vt.w + 16, chx = cx - cw / 2, chy = y1 - 16;
  const label = text("verified", fonts.mono500, 13, chx + 30, chy + 4.5);
  body.push(`<g>${appear(3.4, 0.4)}<g>${rise(3.4, 0.5, 8)}<rect x="${f(chx)}" y="${chy - 14}" width="${f(cw)}" height="28" rx="14" fill="${t.bg}" stroke="${t.accent}" stroke-width="1.5"/><path d="M${f(chx + 11)} ${chy}l4 4l7-8" stroke="${t.accent}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${label.el(t.accent)}</g></g>`);

  body.push(`<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="23.5" fill="none" stroke="${t.border}" stroke-width="1.5"/>`);

  return svg(W, H, "Muhammad Shakaib Arsalan. AI engineer and full-stack developer. I build AI products end to end. Open to work in Lahore, Islamabad or remote.",
    `<defs>${defs.join("")}</defs><g clip-path="url(#card)">${body.join("")}</g>`);
}

function card(c, t) {
  const W = 520, H = 232, P = 22;
  const out = [];
  out.push(`<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="18" fill="${t.panel}" stroke="${t.border}" stroke-width="1.5"/>`);
  out.push(`<rect x="${P}" y="${P}" width="46" height="46" rx="12" fill="${t.accent}" fill-opacity="${t.soft}"/>`);
  out.push(`<g transform="translate(${P} ${P})" fill="none" stroke="${t.accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${icons[c.icon]}</g>`);
  const title = text(c.name, fonts.sans700, 23, P + 62, P + 21);
  out.push(`${title.el(t.text)}`);
  out.push(`${text(c.sub, fonts.mono400, 13, P + 62, P + 42).el(t.dim)}`);

  // tag chip, top right
  const tg = text(c.tag, fonts.mono500, 11, 0, 0, { ls: 1.4 });
  const live = c.tag === "LIVE" || c.tag === "NOW";
  const tw = tg.w + 22 + (live ? 14 : 0), tx = W - P - tw;
  out.push(`<rect x="${f(tx)}" y="${P}" width="${f(tw)}" height="24" rx="12" fill="${t.accent}" fill-opacity="${t.soft}" stroke="${t.accent}" stroke-opacity=".35"/>`);
  if (live) out.push(`<circle cx="${f(tx + 14)}" cy="${P + 12}" r="3.5" fill="${t.accent}"><animate attributeName="opacity" values="1;.25;1" dur="2s" repeatCount="indefinite"/></circle>`);
  out.push(`${text(c.tag, fonts.mono500, 11, tx + 11 + (live ? 14 : 0), P + 16, { ls: 1.4 }).el(t.accent)}`);

  // description, up to three lines
  const lines = wrap(c.desc, fonts.sans500, 16, W - 2 * P);
  if (lines.length > 3) throw new Error(`card "${c.name}": description needs ${lines.length} lines, max 3`);
  lines.forEach((ln, i) => out.push(`${text(ln, fonts.sans500, 16, P, 110 + i * 23).el(t.muted)}`));

  // tech chips along the bottom
  let x = P;
  const y = H - P - 24;
  for (const chip of c.chips) {
    const cw = measure(chip, fonts.mono400, 12) + 18;
    if (x + cw > W - P) break;
    out.push(`<rect x="${f(x)}" y="${y}" width="${f(cw)}" height="24" rx="7" fill="none" stroke="${t.border}" stroke-width="1.2"/>`);
    out.push(`${text(chip, fonts.mono400, 12, x + 9, y + 16).el(t.dim)}`);
    x += cw + 7;
  }
  return svg(W, H, `${c.name}: ${c.desc}`, out.join(""));
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
  for (const c of cards) write(`assets/cards/${c.slug}-${t.name}.svg`, card(c, t));
}
const pills = { portfolio: ["Portfolio", "globe"], linkedin: ["LinkedIn", "linkedin"], email: ["Email me", "mail"], live: ["Live site", "live"], source: ["Source code", "code"] };
for (const [k, [label, icon]] of Object.entries(pills)) write(`assets/buttons/${k}.svg`, pill(label, icon));
console.log("built header, stack,", cards.length, "cards x 2 themes,", Object.keys(pills).length, "buttons");
