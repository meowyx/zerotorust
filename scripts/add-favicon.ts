// Adds a favicon <link> to each companion guide in public/notes/.
//
// The guides are standalone static HTML served by the same app, so they don't
// pick up Next's metadata favicon. This points them at the app's generated
// /icon route (same origin). IDEMPOTENT: re-run safely after regenerating.
//
//   bun scripts/add-favicon.ts

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const NOTES_DIR = "public/notes";
const LINK = '<link rel="icon" type="image/png" href="/icon" />';

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
    continue;
  }
  if (html.includes('rel="icon"')) {
    skipped++;
    continue;
  }
  if (!html.includes("</head>")) {
    console.warn(`! no </head>, skipped: ${file}`);
    continue;
  }
  html = html.replace("</head>", `${LINK}\n</head>`);
  await writeFile(file, html);
  console.log(`+ favicon link added: ${file}`);
  changed++;
}

console.log(`\ndone. added=${changed}  already-had-it=${skipped}`);
