// Generate a teaching slide deck (slides.html) from each episode's companion
// guide (index.html). The guides share one structure: a cover section, then
// scenes and chapter dividers interleaved, a pull-quote, and a cheatsheet
// appendix. We parse those sections in document order and emit a deck whose
// shell (CSS + nav JS) is identical to the hand-built lesson 1 deck, with the
// per-episode content injected as JSON.
//
// Run with:  bun scripts/build-slides.ts
//
// rust-intro (EP.01) is intentionally skipped: its deck was hand-tuned and
// already reviewed. Add it to EPISODES if you ever want it regenerated too.

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Resolved from the project root, like the other scripts (run via `bun run notes`).
const NOTES = "public/notes";

const EPISODES = [
  "rust-ownership",
  "rust-structs-enums",
  "rust-collections",
  "rust-error-handling",
  "rust-generics-traits",
  "rust-closures-iterators",
  "rust-modules-cargo",
  "rust-testing",
  "rust-smart-pointers",
  "rust-concurrency",
  "rust-async",
];

// ---- text helpers -----------------------------------------------------------

// Hard rule: never emit an em dash. Sources are clean today, this is a guard.
// Matched by code point so this file never contains the literal character.
function noDash(s: string): string {
  return s.replace(/\s*—\s*/g, ", ").replace(/–/g, "-");
}

// Keep inline formatting we style (<code>, <b>, <i>, <em>), drop the rest.
function inline(html: string): string {
  return noDash(
    html
      .replace(/<strong>/g, "<b>")
      .replace(/<\/strong>/g, "</b>")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const first = (re: RegExp, s: string): string => s.match(re)?.[1] ?? "";

// ---- per-section extraction -------------------------------------------------

type Slide = {
  type: "cover" | "image" | "divider" | "quote" | "cheatsheet";
  img?: string;
  kicker?: string;
  title?: string;
  notes: string[];
  remember?: string;
  // Pre-rendered card for slides with no still (chapter dividers, the pull
  // quote, or a scene that was never rendered to a frame). The deck shows this
  // instead of a broken <img src="">. Only set when img is empty.
  composed?: string;
};

const imgOf = (inner: string) => first(/<img class="slide"[^>]*src="([^"]+)"/, inner);
const chipOf = (inner: string) => inline(first(/<span class="book-chip">([\s\S]*?)<\/span>/, inner));

// Prose bullets from a scene body: <p> and <li> in order, minus the slide
// image, heading, "Remember" blockquote, and the code/table blocks (those
// already live on the slide image).
function prose(inner: string): string[] {
  const body = inner
    .replace(/<h3>[\s\S]*?<\/h3>/g, "")
    .replace(/<img\b[\s\S]*?>/g, "")
    .replace(/<blockquote>[\s\S]*?<\/blockquote>/g, "")
    .replace(/<table>[\s\S]*?<\/table>/g, "")
    .replace(/<pre>[\s\S]*?<\/pre>/g, "");
  const out: string[] = [];
  const re = /<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const t = inline(m[2]);
    if (t) out.push(t);
  }
  return out;
}

function rememberOf(inner: string): string | undefined {
  const m = inner.match(/<strong>Remember:<\/strong>\s*([\s\S]*?)<\/p>/);
  return m ? inline(m[1]) : undefined;
}

// ---- build one episode ------------------------------------------------------

function buildEpisode(slug: string): { html: string; count: number } {
  const file = join(NOTES, slug, "index.html");
  const src = readFileSync(file, "utf8");
  const main = first(/<main class="doc">([\s\S]*?)<\/main>/, src) || src;

  // cover
  const coverInner = first(/<section class="cover">([\s\S]*?)<\/section>/, main);
  const coverTitle = inline(first(/<h1 class="cover-title">([\s\S]*?)<\/h1>/, coverInner));
  const coverTag = inline(first(/<p class="cover-tagline">([\s\S]*?)<\/p>/, coverInner));
  const coverChip = first(/<div class="cover-chip">([\s\S]*?)<\/div>/, coverInner).trim();
  const ep = (first(/<div class="cover-num">([\s\S]*?)<\/div>/, coverInner).trim()) || "00";
  const titleText = decode(stripTags(coverTitle));
  const chipText = decode(stripTags(coverChip)).replace(/\s+/g, " ").trim();

  const coverHtml =
    '<div class="cv">' +
    '<div class="cv-eyebrow">MeowyTheDev · Rust from Zero</div>' +
    '<h1 class="cv-title">' + coverTitle + "</h1>" +
    '<p class="cv-tag">' + coverTag + "</p>" +
    '<div class="cv-chip">' + coverChip + "</div>" +
    '<div class="cv-foot"><span class="ep">EP.' + ep + "</span><span>companion slides · watch on the Rust from Zero playlist</span></div>" +
    '<div class="cv-num">' + ep + "</div>" +
    "</div>";

  const coverNotes = [
    "<b>Episode " + Number(ep) + ".</b> " + coverTag,
    "<b>Covers:</b> " + chipText,
  ];

  // cheatsheet appendix. The deck card is a fixed 1280x720, which holds about
  // a dozen rows; longer episodes get the recap split across several slides.
  const apInner = first(/<section class="appendix">([\s\S]*?)<\/section>/, main);
  const rowRe = /<td class="ck-scene">([\s\S]*?)<\/td>\s*<td class="ck-text">([\s\S]*?)<\/td>/g;
  const rowCells = [...apInner.matchAll(rowRe)]
    .map((m) => '<tr><td class="idea">' + inline(m[1]) + "</td><td>" + inline(m[2]) + "</td></tr>");
  const ROWS_PER_SLIDE = 11;
  const cheatParts = Math.max(1, Math.ceil(rowCells.length / ROWS_PER_SLIDE));
  const perPart = Math.ceil(rowCells.length / cheatParts);
  const cheatHtmls = Array.from({ length: cheatParts }, (_, i) => {
    const partLabel = cheatParts > 1 ? ' <span class="ck-part">' + (i + 1) + " / " + cheatParts + "</span>" : "";
    return (
      '<div class="ck">' +
      '<h2>Cheatsheet <span class="accent">recap</span>' + partLabel + "</h2>" +
      '<p class="sub">One line per idea, in order. The pause-for-questions slide.</p>' +
      '<table><thead><tr><th>Idea</th><th>Remember</th></tr></thead><tbody>' +
      rowCells.slice(i * perPart, (i + 1) * perPart).join("") +
      "</tbody></table>" +
      "</div>"
    );
  });
  const cheatHtml = cheatHtmls[0];
  const apFoot = first(/<div class="ap-foot">([\s\S]*?)<\/div>/, apInner);
  const footNotes = apFoot
    .split(/<br\s*\/?>/)
    .map((p) => inline(p))
    .filter(Boolean);
  const cheatNotes = [
    "Recap: one line per idea, in order. Good place to pause for questions.",
    ...footNotes,
  ];

  // all sections, in document order
  const slides: Slide[] = [];
  const sectionRe = /<section\b[^>]*\bclass="([^"]*)"[^>]*>([\s\S]*?)<\/section>/g;
  let s: RegExpExecArray | null;
  while ((s = sectionRe.exec(main))) {
    const cls = s[1];
    const inner = s[2];
    if (/\bcover\b/.test(cls)) {
      slides.push({ type: "cover", title: titleText, notes: coverNotes });
    } else if (/\bappendix\b/.test(cls)) {
      cheatHtmls.forEach((html, i) => {
        slides.push({
          type: "cheatsheet",
          title: "Cheatsheet recap" + (cheatHtmls.length > 1 ? " (" + (i + 1) + "/" + cheatHtmls.length + ")" : ""),
          notes: i === 0 ? cheatNotes : ["Recap, continued."],
          composed: html,
        });
      });
    } else if (/\bquote\b/.test(cls)) {
      const bq = inline(first(/<blockquote>([\s\S]*?)<\/blockquote>/, inner).replace(/<\/?p>/g, ""));
      const lead = inner.replace(/<blockquote>[\s\S]*?<\/blockquote>/g, "").replace(/<img\b[\s\S]*?>/g, "");
      const introP = inline(first(/<p>([\s\S]*?)<\/p>/, lead));
      const qimg = imgOf(inner);
      const slide: Slide = {
        type: "quote",
        img: qimg,
        kicker: "Takeaway",
        title: "The big idea",
        notes: [introP, bq].filter(Boolean),
      };
      if (!qimg) {
        slide.composed =
          '<div class="txt txt-quote"><div class="txt-kicker">Takeaway</div>' +
          '<p class="txt-quote-text">' + bq + "</p>" +
          (introP ? '<p class="txt-lead">' + introP + "</p>" : "") +
          "</div>";
      }
      slides.push(slide);
    } else if (/\bdivider\b/.test(cls)) {
      // Keep the title HTML-escaped (entities intact) so a generic param like
      // Box<T> survives into the notes, the title bar, and the composed card.
      const dtitle = inline(first(/<h2 class="divider-title">([\s\S]*?)<\/h2>/, inner));
      const intro = inline(first(/<div class="body divider-intro">[\s\S]*?<p>([\s\S]*?)<\/p>/, inner));
      const dimg = imgOf(inner);
      const slide: Slide = {
        type: "divider",
        img: dimg,
        kicker: "Chapter · " + chipOf(inner),
        title: dtitle,
        notes: ["Chapter break: <b>" + dtitle + "</b>.", intro].filter(Boolean),
      };
      if (!dimg) {
        slide.composed =
          '<div class="txt"><div class="txt-kicker">Chapter</div><h1 class="txt-title">' +
          dtitle + "</h1>" +
          (intro ? '<p class="txt-lead">' + intro + "</p>" : "") +
          "</div>";
      }
      slides.push(slide);
    } else if (/\bscene\b/.test(cls)) {
      const simg = imgOf(inner);
      const stitle = inline(first(/<h3>([\s\S]*?)<\/h3>/, inner));
      const snotes = prose(inner);
      const slide: Slide = {
        type: "image",
        img: simg,
        kicker: chipOf(inner),
        title: stitle,
        notes: snotes,
        remember: rememberOf(inner),
      };
      if (!simg) {
        slide.composed =
          '<div class="txt"><div class="txt-kicker">' + chipOf(inner) + "</div>" +
          '<h1 class="txt-title txt-title-sm">' + stitle + "</h1>" +
          (snotes.length
            ? '<ul class="txt-points">' + snotes.map((n) => "<li>" + n + "</li>").join("") + "</ul>"
            : "") +
          "</div>";
      }
      slides.push(slide);
    }
  }

  const data = { ep, title: titleText, cover: coverHtml, coverBig: coverTitle, cheat: cheatHtml, slides };
  // Escape "<" so the JSON literal can never break out of the <script> tag.
  const dataJson = JSON.stringify(data).replace(/</g, "\\u003c");

  const html = SHELL
    .replace(/__TITLE__/g, () => titleText)
    .replace(/__EP__/g, () => ep)
    .replace("__DATA_JSON__", () => dataJson);

  return { html, count: slides.length };
}

// ---- the shared shell (CSS + nav JS), identical to the lesson 1 deck --------

const SHELL = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>__TITLE__ · Slides (EP.__EP__)</title>
<!-- "Add to Home Screen" on iPhone launches this chromeless, the practical
     way to get a fullscreen-like deck where iOS blocks the Fullscreen API -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Rust EP.__EP__" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
<link rel="icon" type="image/png" href="/icon" />
<style>
:root{
  --ink:#1c1e22; --soft:#43474e; --muted:#888d96; --line:#e3e4e8;
  --rust:#c8542a; --code-bg:#f5f5f4;
  --sans:"Bricolage Grotesque",system-ui,-apple-system,sans-serif;
  --serif:"Instrument Serif",Georgia,serif;
  --mono:"JetBrains Mono",ui-monospace,monospace;
  --stage:#0e0f12; --panel:#16181d; --sline:#26282e; --sink:#e8e6e2; --smuted:#9a9aaa;
}
*{box-sizing:border-box;}
html,body{margin:0;height:100%;background:var(--stage);color:var(--sink);font-family:var(--sans);overflow:hidden;}
button{font-family:inherit;}

.app{display:flex;flex-direction:column;height:100vh;height:100dvh;}

.progress{flex:none;height:3px;background:#1d1f24;}
.progress > i{display:block;height:100%;background:var(--rust);width:0;transition:width .25s ease;}

.topbar{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 18px;}
.brand{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--sink);}
.brand svg{display:block;}
.brand .sep{color:#4a4d55;font-weight:400;}
.brand .ep{font-family:var(--mono);color:var(--rust);font-weight:700;letter-spacing:.08em;}
.hint{font-family:var(--mono);font-size:11px;color:#6b6e76;white-space:nowrap;}
.hint b{color:#9a9aaa;font-weight:700;}

.middle{flex:1;display:flex;min-height:0;min-width:0;}
.viewport{flex:1;display:grid;place-items:center;min-width:0;min-height:0;position:relative;overflow:hidden;}

/* sized in JS to the scaled deck size so grid centering uses the real footprint */
.scaler{position:relative;flex:none;}
.deck{position:absolute;top:0;left:0;width:1280px;height:720px;transform-origin:top left;border-radius:14px;overflow:hidden;background:#fff;
  box-shadow:0 30px 90px -30px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.05);cursor:pointer;}
.deck img.full{display:block;width:100%;height:100%;object-fit:contain;background:#fff;}

/* composed: cover */
.cv{width:100%;height:100%;padding:78px 86px;display:flex;flex-direction:column;justify-content:center;position:relative;color:var(--ink);}
.cv-eyebrow{font-family:var(--mono);font-size:17px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
.cv-title{font-size:96px;line-height:1.04;font-weight:800;color:#16181d;margin:18px 0 0;letter-spacing:-0.01em;}
.cv-title .accent{font-family:var(--serif);font-style:italic;color:var(--rust);font-weight:400;}
.cv-tag{font-family:var(--serif);font-style:italic;font-size:34px;color:var(--soft);margin:26px 0 0;max-width:760px;line-height:1.32;}
.cv-chip{margin-top:40px;align-self:flex-start;font-family:var(--mono);font-size:16px;color:var(--soft);background:#fff;border:1px solid var(--line);padding:9px 16px;border-radius:8px;}
.cv-foot{position:absolute;left:86px;right:86px;bottom:54px;display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--line);padding-top:18px;font-size:15px;color:var(--muted);}
.cv-foot .ep{font-family:var(--mono);font-weight:700;color:var(--rust);letter-spacing:.12em;}
.cv-num{position:absolute;top:54px;right:86px;font-family:var(--mono);font-weight:800;font-size:120px;color:#e6e7ec;line-height:1;}

/* composed: cheatsheet */
.ck{width:100%;height:100%;padding:56px 70px;display:flex;flex-direction:column;color:var(--ink);}
.ck h2{font-size:48px;font-weight:800;color:#16181d;margin:0 0 4px;letter-spacing:-0.01em;}
.ck h2 .accent{font-family:var(--serif);font-style:italic;color:var(--rust);font-weight:400;}
.ck h2 .ck-part{font-family:var(--mono);font-size:20px;font-weight:700;color:var(--muted);letter-spacing:.06em;vertical-align:middle;margin-left:10px;}
.ck .sub{font-size:17px;color:var(--soft);margin:0 0 18px;}
.ck table{width:100%;border-collapse:collapse;font-size:16.5px;}
.ck th{text-align:left;background:#f3f3f4;color:var(--ink);font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.04em;padding:8px 12px;border:1px solid var(--line);}
.ck td{padding:7px 12px;border:1px solid var(--line);color:var(--soft);vertical-align:top;}
.ck td.idea{font-weight:700;color:#16181d;width:38%;}
.ck code{font-family:var(--mono);font-size:.9em;background:var(--code-bg);padding:.06em .3em;border-radius:4px;color:#9a3a18;}

/* composed: text card for slides with no still (divider / pull-quote / image-less scene) */
.txt{width:100%;height:100%;padding:64px 78px;display:flex;flex-direction:column;justify-content:center;color:var(--ink);}
.txt-kicker{font-family:var(--mono);font-size:17px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:18px;}
.txt-title{font-size:74px;line-height:1.04;font-weight:800;color:#16181d;margin:0;letter-spacing:-0.01em;}
.txt-title.txt-title-sm{font-size:50px;}
.txt-title .accent{font-family:var(--serif);font-style:italic;color:var(--rust);font-weight:400;}
.txt-lead{font-family:var(--serif);font-style:italic;font-size:30px;line-height:1.4;color:var(--soft);margin:26px 0 0;max-width:880px;}
.txt-points{margin:26px 0 0;padding-left:24px;max-width:900px;}
.txt-points li{font-size:22px;line-height:1.5;color:var(--soft);margin:0 0 12px;}
.txt-points li b{color:var(--ink);font-weight:700;}
.txt code{font-family:var(--mono);font-size:.9em;background:var(--code-bg);padding:.06em .3em;border-radius:4px;color:#9a3a18;}
.txt-quote{justify-content:center;}
.txt-quote-text{font-family:var(--serif);font-style:italic;font-size:46px;line-height:1.28;color:#16181d;margin:0;max-width:980px;}

/* notes drawer */
.notes{flex:none;width:0;overflow:hidden;background:var(--panel);border-left:1px solid var(--sline);transition:width .18s ease,height .18s ease;}
.notes.open{width:380px;}
.notes-inner{width:380px;height:100%;overflow:auto;padding:24px 24px 40px;}
.n-kicker{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b6e76;margin-bottom:8px;}
.n-title{font-size:23px;font-weight:800;color:var(--sink);margin:0 0 14px;letter-spacing:-0.01em;}
.n-points{margin:0;padding-left:18px;}
.n-points li{font-size:14.5px;line-height:1.6;color:#c4c4cc;margin:0 0 9px;}
.n-points li b{color:#fff;font-weight:700;}
.notes-inner code{font-family:var(--mono);font-size:.86em;background:#22252b;padding:.08em .34em;border-radius:4px;color:#e7a884;}
.n-remember{margin-top:18px;border-left:3px solid var(--rust);background:rgba(200,84,42,.10);border-radius:0 8px 8px 0;padding:12px 14px;font-size:14.5px;line-height:1.55;color:#f0e6df;}
.n-remember span{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--rust);font-weight:700;margin-bottom:5px;}
.n-empty{color:#6b6e76;font-size:14px;font-style:italic;}

/* bottom controls */
.controls{flex:none;display:flex;align-items:center;gap:10px;padding:10px 16px;border-top:1px solid var(--sline);background:#101216;}
.controls .counter{font-family:var(--mono);font-size:13px;color:var(--smuted);min-width:66px;}
.controls .counter b{color:var(--sink);}
.controls .ctitle{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;color:#c4c4cc;}
.btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--sline);background:#1a1c22;color:var(--sink);
  font-size:13px;font-weight:600;border-radius:9px;padding:8px 13px;cursor:pointer;transition:background .14s,border-color .14s,color .14s;}
.btn:hover{background:#23262d;border-color:#3a3d45;}
.btn:disabled{opacity:.38;cursor:not-allowed;}
.btn.icon{padding:8px 12px;font-size:17px;line-height:1;}
.btn.on{background:rgba(200,84,42,.16);border-color:rgba(200,84,42,.55);color:#f0b69e;}
.btn .k{font-family:var(--mono);font-size:10px;color:#7e818a;}

/* grid overview */
.grid{position:fixed;inset:0;z-index:80;background:rgba(8,9,11,.97);overflow:auto;padding:36px 40px 56px;display:none;}
.grid.open{display:block;}
.grid-head{display:flex;align-items:center;justify-content:space-between;max-width:1320px;margin:0 auto 22px;}
.grid-head h2{font-size:20px;margin:0;color:var(--sink);font-weight:800;}
.grid-inner{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;max-width:1320px;margin:0 auto;}
.thumb{position:relative;aspect-ratio:16/9;border-radius:9px;overflow:hidden;border:1px solid var(--sline);background:#fff;cursor:pointer;transition:transform .12s,outline-color .12s;outline:2px solid transparent;}
.thumb:hover{transform:translateY(-2px);}
.thumb.current{outline-color:var(--rust);}
.thumb img{width:100%;height:100%;object-fit:contain;}
.thumb .composed{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--ink);padding:10px;text-align:center;}
.thumb .composed .big{font-size:22px;font-weight:800;color:#16181d;}
.thumb .composed .big .accent{font-family:var(--serif);font-style:italic;color:var(--rust);font-weight:400;}
.thumb .num{position:absolute;top:6px;left:8px;font-family:var(--mono);font-size:11px;font-weight:700;color:#fff;background:rgba(14,15,18,.78);border-radius:5px;padding:2px 6px;}

@media (max-width:760px){
  .hint{display:none;}
  .controls .ctitle{display:none;}
  .controls{flex-wrap:wrap;gap:8px;padding:8px 10px;}
  .btn{padding:9px 12px;}
  .btn .k{display:none;}            /* no keyboard on touch */
  #btnFull{display:none;}           /* fullscreen is niche on phones, unsupported on iOS */
  /* stack the slide on top and slide notes up from the bottom, so the
     control bar stays reachable instead of being covered by an overlay */
  .middle{flex-direction:column;}
  .notes{width:auto;height:0;border-left:none;border-top:1px solid var(--sline);}
  .notes.open{width:auto;height:46vh;}
  .notes-inner{width:auto;}
}
</style>
</head>
<body>
<div class="app">
  <div class="progress"><i id="bar"></i></div>

  <div class="topbar">
    <div class="brand">
      <svg viewBox="0 0 28 20" width="20" height="14" aria-hidden="true"><rect width="28" height="20" rx="5" fill="#FF0033"/><path d="M11 6l7 4-7 4z" fill="#fff"/></svg>
      MeowyTheDev <span class="sep">·</span> Rust from Zero <span class="sep">·</span> <span class="ep">EP.__EP__</span>
    </div>
    <div class="hint"><b>←</b> <b>→</b> move · <b>N</b> notes · <b>G</b> grid · <b>F</b> fullscreen</div>
  </div>

  <div class="middle">
    <div class="viewport" id="viewport">
      <div class="scaler" id="scaler">
        <div class="deck" id="deck" role="group" aria-label="slide"></div>
      </div>
    </div>
    <aside class="notes" id="notes" aria-label="Speaker notes">
      <div class="notes-inner" id="notesInner"></div>
    </aside>
  </div>

  <div class="controls">
    <button class="btn icon" id="prev" title="Previous (left arrow)" aria-label="Previous slide">‹</button>
    <button class="btn icon" id="next" title="Next (right arrow)" aria-label="Next slide">›</button>
    <div class="counter"><b id="cur">1</b> / <span id="total">1</span></div>
    <div class="ctitle" id="ctitle"></div>
    <button class="btn" id="btnNotes" title="Toggle speaker notes (N)">Notes <span class="k">N</span></button>
    <button class="btn" id="btnGrid" title="Slide overview (G)">Grid <span class="k">G</span></button>
    <button class="btn" id="btnFull" title="Fullscreen (F)">Fullscreen <span class="k">F</span></button>
  </div>
</div>

<div class="grid" id="grid">
  <div class="grid-head">
    <h2>All slides</h2>
    <button class="btn" id="gridClose">Close <span class="k">Esc</span></button>
  </div>
  <div class="grid-inner" id="gridInner"></div>
</div>

<script>
(function(){
  "use strict";

  var DATA = __DATA_JSON__;
  var SLIDES = DATA.slides;
  function stripT(s){ return (s || '').replace(/<[^>]+>/g, ''); }

  // ---- element refs ----
  var deck = document.getElementById('deck');
  var scaler = document.getElementById('scaler');
  var viewport = document.getElementById('viewport');
  var bar = document.getElementById('bar');
  var curEl = document.getElementById('cur');
  var totalEl = document.getElementById('total');
  var ctitle = document.getElementById('ctitle');
  var notes = document.getElementById('notes');
  var notesInner = document.getElementById('notesInner');
  var grid = document.getElementById('grid');
  var gridInner = document.getElementById('gridInner');
  var btnNotes = document.getElementById('btnNotes');
  var btnGrid = document.getElementById('btnGrid');
  var btnFull = document.getElementById('btnFull');
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');

  var NOTES_KEY = 'rfz_slides_notes';
  var idx = 0;
  var notesOpen = false;
  try { notesOpen = localStorage.getItem(NOTES_KEY) === '1'; } catch(e){}

  totalEl.textContent = SLIDES.length;

  function bodyHTML(s){
    if (s.type === 'cover') return DATA.cover;
    if (s.type === 'cheatsheet') return s.composed || DATA.cheat;
    if (s.composed) return s.composed;
    return '<img class="full" src="' + s.img + '" alt="' + stripT(s.title) + '" />';
  }

  function notesHTML(s){
    var pts = (s.notes || []).map(function(n){ return '<li>' + n + '</li>'; }).join('');
    var html = '';
    if (s.kicker) html += '<div class="n-kicker">' + s.kicker + '</div>';
    html += '<h2 class="n-title">' + (s.title || '') + '</h2>';
    if (pts) html += '<ul class="n-points">' + pts + '</ul>';
    else html += '<p class="n-empty">No notes for this slide.</p>';
    if (s.remember) html += '<div class="n-remember"><span>Remember</span>' + s.remember + '</div>';
    return html;
  }

  function fit(){
    var availW = viewport.clientWidth;
    var availH = viewport.clientHeight;
    var scale = Math.min(availW / 1280, availH / 720) * 0.955;
    if (!isFinite(scale) || scale <= 0) scale = 0.1;
    deck.style.transform = 'scale(' + scale + ')';
    scaler.style.width = (1280 * scale) + 'px';
    scaler.style.height = (720 * scale) + 'px';
  }

  function render(){
    var s = SLIDES[idx];
    deck.innerHTML = bodyHTML(s);
    notesInner.innerHTML = notesHTML(s);
    curEl.textContent = (idx + 1);
    ctitle.innerHTML = s.title || '';
    bar.style.width = (((idx + 1) / SLIDES.length) * 100) + '%';
    prevBtn.disabled = (idx === 0);
    nextBtn.disabled = (idx === SLIDES.length - 1);
    var hash = '#' + (idx + 1);
    if (location.hash !== hash) {
      try { history.replaceState(null, '', hash); } catch(e){ location.hash = hash; }
    }
    updateGridCurrent();
    fit();
  }

  function go(n){
    var t = Math.max(0, Math.min(SLIDES.length - 1, n));
    if (t === idx) return;
    idx = t;
    render();
  }
  function next(){ go(idx + 1); }
  function prev(){ go(idx - 1); }

  function setNotes(open){
    notesOpen = open;
    notes.classList.toggle('open', open);
    btnNotes.classList.toggle('on', open);
    try { localStorage.setItem(NOTES_KEY, open ? '1' : '0'); } catch(e){}
    setTimeout(fit, 200);
  }
  function toggleNotes(){ setNotes(!notesOpen); }

  function setGrid(open){
    grid.classList.toggle('open', open);
    btnGrid.classList.toggle('on', open);
    if (open) updateGridCurrent();
  }
  function toggleGrid(){ setGrid(!grid.classList.contains('open')); }

  function updateGridCurrent(){
    var kids = gridInner.children;
    for (var i = 0; i < kids.length; i++){
      kids[i].classList.toggle('current', i === idx);
    }
  }

  function buildGrid(){
    var html = '';
    for (var i = 0; i < SLIDES.length; i++){
      var s = SLIDES[i];
      var inner;
      if (s.type === 'cover') inner = '<div class="composed"><div class="big">' + DATA.coverBig + '</div></div>';
      else if (s.type === 'cheatsheet') inner = '<div class="composed"><div class="big">Cheatsheet <span class="accent">recap</span></div></div>';
      else if (s.composed) inner = '<div class="composed"><div class="big">' + (s.title || '') + '</div></div>';
      else inner = '<img src="' + s.img + '" alt="" loading="lazy" />';
      html += '<div class="thumb" data-i="' + i + '" title="' + stripT(s.title) + '">' + inner + '<span class="num">' + (i + 1) + '</span></div>';
    }
    gridInner.innerHTML = html;
  }

  function toggleFull(){
    var el = document.documentElement;
    if (!document.fullscreenElement){
      (el.requestFullscreen || el.webkitRequestFullscreen || function(){}).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function(){}).call(document);
    }
  }

  // ---- events ----
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  btnNotes.addEventListener('click', toggleNotes);
  btnGrid.addEventListener('click', toggleGrid);
  btnFull.addEventListener('click', toggleFull);
  document.getElementById('gridClose').addEventListener('click', function(){ setGrid(false); });

  deck.addEventListener('click', next);

  gridInner.addEventListener('click', function(e){
    var t = e.target.closest('.thumb');
    if (!t) return;
    go(parseInt(t.getAttribute('data-i'), 10));
    setGrid(false);
  });

  document.addEventListener('keydown', function(e){
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Spacebar'){ e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp'){ e.preventDefault(); prev(); }
    else if (k === 'Home'){ e.preventDefault(); go(0); }
    else if (k === 'End'){ e.preventDefault(); go(SLIDES.length - 1); }
    else if (k === 'n' || k === 'N'){ toggleNotes(); }
    else if (k === 'g' || k === 'G'){ toggleGrid(); }
    else if (k === 'f' || k === 'F'){ toggleFull(); }
    else if (k === 'Escape'){ if (grid.classList.contains('open')) setGrid(false); }
  });

  // basic swipe
  var sx = null;
  viewport.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
  viewport.addEventListener('touchend', function(e){
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50){ dx < 0 ? next() : prev(); }
    sx = null;
  }, {passive:true});

  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function(){
    var n = parseInt((location.hash || '').replace('#',''), 10);
    if (!isNaN(n) && (n - 1) !== idx) go(n - 1);
  });

  // ---- init ----
  (function start(){
    var n = parseInt((location.hash || '').replace('#',''), 10);
    if (!isNaN(n)) idx = Math.max(0, Math.min(SLIDES.length - 1, n - 1));
    buildGrid();
    setNotes(notesOpen);
    render();
  })();
})();
</script>
</body>
</html>
`;

// ---- run --------------------------------------------------------------------

for (const slug of EPISODES) {
  const dir = join(NOTES, slug);
  if (!existsSync(join(dir, "index.html"))) {
    console.warn(`skip ${slug}: no index.html`);
    continue;
  }
  const { html, count } = buildEpisode(slug);
  const out = join(dir, "slides.html");
  writeFileSync(out, html, "utf8");
  const dashes = (html.match(/—/g) || []).length;
  console.log(`${slug}: ${count} slides -> slides.html${dashes ? `  !! ${dashes} em dashes` : ""}`);
}
