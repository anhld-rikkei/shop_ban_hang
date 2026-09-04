// Asset downloader for https://j86store.com/ (site j86store-com-95a496e4, page root-8a5edab2)
// Reads recon JSON produced during reconnaissance and downloads every image,
// background image and favicon into the namespaced public asset root.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const SITE = "j86store-com-95a496e4";
const PAGE = "root-8a5edab2";
const root = process.cwd();
const art = path.join(root, "docs", "research", SITE, PAGE);
const outDir = path.join(root, "public", "sites", SITE, PAGE, "images");
const cssDir = path.join(art, "css");
await mkdir(outDir, { recursive: true });
await mkdir(cssDir, { recursive: true });

const urls = new Map(); // url -> kind

function largestFromSrcset(srcset) {
  if (!srcset) return null;
  let best = null;
  for (const part of srcset.split(",")) {
    const [u, d] = part.trim().split(/\s+/);
    const n = d ? parseFloat(d) : 0;
    if (!best || n > best.n) best = { u, n };
  }
  return best?.u ?? null;
}

for (const file of ["recon-desktop.json", "recon-mobile-390.json", "recon-tablet-768.json"]) {
  let json;
  try {
    json = JSON.parse(await readFile(path.join(art, file), "utf8"));
  } catch {
    continue;
  }
  for (const img of json.imgs ?? []) {
    if (img.src && img.src.startsWith("http")) urls.set(img.src, "img");
    const big = largestFromSrcset(img.srcset);
    if (big && big.startsWith("http")) urls.set(big, "img");
  }
  for (const bg of json.bgs ?? []) {
    for (const m of bg.url.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      if (m[1].startsWith("http")) urls.set(m[1], "bg");
    }
  }
  for (const f of json.favicons ?? []) if (f.href) urls.set(f.href, "favicon");
  for (const s of json.stylesheets ?? []) if (s && /j86store\.com/.test(s)) urls.set(s, "css");
}

// Strip WordPress size suffixes so we fetch the original upload too.
for (const [u, kind] of [...urls]) {
  if (kind !== "img") continue;
  const orig = u.replace(/-\d{2,4}x\d{2,4}(\.[a-z]+)$/i, "$1");
  if (orig !== u) urls.set(orig, "img-original");
}

function localName(u) {
  const clean = u.split("?")[0];
  let base = decodeURIComponent(path.basename(clean)).replace(/[^\w.\-]+/g, "_");
  const hash = createHash("sha256").update(clean).digest("hex").slice(0, 6);
  const ext = path.extname(base);
  base = base.slice(0, base.length - ext.length).slice(0, 60);
  return `${base}-${hash}${ext || ".bin"}`;
}

const manifest = [];
const list = [...urls];
console.log(`Downloading ${list.length} assets...`);
let i = 0;
async function worker() {
  while (i < list.length) {
    const [u, kind] = list[i++];
    const name = localName(u);
    const dest = kind === "css" ? path.join(cssDir, name.replace(/\.bin$/, ".css")) : path.join(outDir, name);
    try {
      const res = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      manifest.push({ url: u, kind, local: path.relative(root, dest).replace(/\\/g, "/"), bytes: buf.length, type: res.headers.get("content-type") });
    } catch (e) {
      manifest.push({ url: u, kind, error: String(e.message ?? e) });
    }
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
manifest.sort((a, b) => a.url.localeCompare(b.url));
await writeFile(path.join(art, "ASSET_MANIFEST.json"), JSON.stringify(manifest, null, 1));
const ok = manifest.filter((m) => !m.error);
const failed = manifest.filter((m) => m.error);
console.log(`OK ${ok.length}, failed ${failed.length}, total ${(ok.reduce((s, m) => s + m.bytes, 0) / 1024 / 1024).toFixed(1)} MB`);
for (const f of failed) console.log("FAIL", f.url, f.error);
