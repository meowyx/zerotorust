// Adds a screen-only mobile stylesheet to each companion guide in public/notes/.
//
// The guides are fixed-width print sheets (~688px). Without this, phones show a
// shrunk page you have to pinch-zoom. This injects a screen + max-width media
// query so the sheet goes fluid and the text reflows on small screens. It does
// NOT touch print styles (uses `@media screen`). IDEMPOTENT: re-run safely.
//
// Run with Bun:
//   bun scripts/add-mobile-css.ts

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const NOTES_DIR = "public/notes";
const MARKER = "notes-mobile-css"; // presence = already injected

const CSS = `
/* ${MARKER}: screen-only mobile reflow, print styles left untouched */
@media screen and (max-width: 640px) {
  html, body { background: #fff; }
  .doc { max-width: 100%; margin: 0; padding: 22px 16px; box-shadow: none; }
  .cover { min-height: auto; padding: 6px 0 22px; }
  .cover-title { font-size: 30pt; padding-right: 0; }
  .cover-tagline { font-size: 15pt; }
  .cover-num { font-size: 38pt; top: 6px; }
  .divider-title { font-size: 24pt; }
  .body h3 { font-size: 17pt; }
  .body p, .body li { font-size: 12pt; }
  .body pre { font-size: 8.5pt; padding: 3mm 3.5mm; }
  .ap-title { font-size: 22pt; }
}
`;

const dirs = await readdir(NOTES_DIR, { withFileTypes: true });
let changed = 0;
let skipped = 0;

for (const d of dirs) {
  if (!d.isDirectory()) continue;
  const file = join(NOTES_DIR, d.name, "index.html");
  let html: string;
  try {
    html = await readFile(file, "utf8");
  } catch {
    continue; // no index.html in this folder
  }
  if (html.includes(MARKER)) {
    skipped++;
    continue;
  }
  if (!html.includes("</style>")) {
    console.warn(`! no </style>, skipped: ${file}`);
    continue;
  }
  html = html.replace("</style>", `${CSS}</style>`);
  await writeFile(file, html);
  console.log(`+ mobile css added: ${file}`);
  changed++;
}

console.log(`\ndone. added=${changed}  already-had-it=${skipped}`);
