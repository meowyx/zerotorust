// Adds a frosted-glass zoom panel to each companion guide in public/notes/.
//
// The guides are print-first static HTML (likely exported from the video
// workspace). This layers a screen-only zoom control on top without touching
// the content. On phones the panel docks to the bottom-center as a horizontal
// bar, and zooming compensates the doc width so text reflows instead of
// overflowing sideways. IDEMPOTENT: re-run safely after regenerating.
//
//   bun scripts/add-zoom-panel.ts

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const NOTES_DIR = "public/notes";
const MARKER = "data-zoom-panel"; // presence = already injected

const CSS = `
/* frosted-glass zoom panel: screen only */
.zoom-panel{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:60;display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:16px;background:rgba(255,255,255,0.55);-webkit-backdrop-filter:blur(14px) saturate(1.3);backdrop-filter:blur(14px) saturate(1.3);border:1px solid rgba(255,255,255,0.7);box-shadow:0 10px 30px rgba(28,30,34,0.18),inset 0 1px 0 rgba(255,255,255,0.65);font-family:var(--sans);}
.zoom-panel button{width:40px;height:40px;border:none;cursor:pointer;border-radius:11px;background:rgba(255,255,255,0.5);color:var(--ink);font-size:19px;font-weight:700;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .15s,transform .1s;}
.zoom-panel button:hover{background:rgba(255,255,255,0.95);}
.zoom-panel button:active{transform:scale(0.93);}
.zoom-level{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--soft);text-align:center;padding:3px 0;cursor:pointer;user-select:none;letter-spacing:0.02em;border-radius:8px;}
.zoom-level:hover{color:var(--rust);background:rgba(255,255,255,0.5);}
.zoom-mbar-bg{display:none;}
/* phones: sticky bottom toolbar holding zoom (left) + Save as PDF (right) */
@media (max-width:640px){.zoom-mbar-bg{display:block;position:fixed;left:0;right:0;bottom:0;height:58px;background:rgba(255,255,255,0.55);-webkit-backdrop-filter:blur(16px) saturate(1.4);backdrop-filter:blur(16px) saturate(1.4);border-top:1px solid rgba(255,255,255,0.7);box-shadow:0 -8px 30px rgba(28,30,34,0.12);z-index:59;}.zoom-panel{left:14px;right:auto;top:auto;bottom:10px;transform:none;flex-direction:row-reverse;background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none;border:none;box-shadow:none;padding:0;}.zoom-panel button{width:38px;height:38px;background:rgba(0,0,0,0.05);color:var(--ink);}.zoom-panel button:hover{background:rgba(0,0,0,0.1);}.zoom-level{color:var(--soft);}.zoom-level:hover{color:var(--rust);background:transparent;}.save-pdf{right:14px !important;bottom:10px !important;z-index:60 !important;}body{padding-bottom:70px;}}
@media print{.zoom-panel{display:none !important;}.doc{zoom:1 !important;width:auto !important;}}
`;

const PANEL = `
<div class="zoom-mbar-bg" aria-hidden="true"></div>
<div class="zoom-panel" ${MARKER} aria-label="Zoom controls">
  <button type="button" class="zoom-in" aria-label="Zoom in" title="Zoom in">+</button>
  <div class="zoom-level" role="button" tabindex="0" title="Reset zoom" aria-label="Reset zoom">100%</div>
  <button type="button" class="zoom-out" aria-label="Zoom out" title="Zoom out">−</button>
</div>
<script>
(function(){
  var doc=document.querySelector('.doc');
  var panel=document.querySelector('[${MARKER}]');
  if(!doc||!panel)return;
  var label=panel.querySelector('.zoom-level');
  var KEY='rfz_notes_zoom',MIN=0.5,MAX=2,STEP=0.1,z=1;
  try{var s=parseFloat(localStorage.getItem(KEY));if(s>=MIN&&s<=MAX)z=s;}catch(e){}
  function clamp(v){return Math.min(MAX,Math.max(MIN,Math.round(v*100)/100));}
  function isMobile(){return window.matchMedia&&window.matchMedia('(max-width:640px)').matches;}
  function apply(){var m=isMobile()&&z!==1;doc.style.zoom=z;doc.style.width=m?('calc(100% / '+z+')'):'';doc.style.maxWidth=m?'none':'';label.textContent=Math.round(z*100)+'%';try{localStorage.setItem(KEY,String(z));}catch(e){}}
  panel.querySelector('.zoom-in').addEventListener('click',function(){z=clamp(z+STEP);apply();});
  panel.querySelector('.zoom-out').addEventListener('click',function(){z=clamp(z-STEP);apply();});
  function reset(){z=1;apply();}
  label.addEventListener('click',reset);
  label.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();reset();}});
  window.addEventListener('resize',apply);
  apply();
})();
<\/script>
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
    continue;
  }
  if (html.includes(MARKER)) {
    skipped++;
    continue;
  }
  if (!html.includes("</style>") || !html.includes("</body>")) {
    console.warn(`! anchors missing, skipped: ${file}`);
    continue;
  }
  html = html.replace("</style>", `${CSS}</style>`);
  html = html.replace("</body>", `${PANEL}</body>`);
  await writeFile(file, html);
  console.log(`+ zoom panel added: ${file}`);
  changed++;
}

console.log(`\ndone. added=${changed}  already-had-it=${skipped}`);
