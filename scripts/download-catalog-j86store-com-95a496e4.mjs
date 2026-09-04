// Downloads full-size gallery images (+ 300x300 thumbnails when available) for every
// product in docs/research/j86store-com-95a496e4/catalog/catalog-raw.json into
// public/sites/j86store-com-95a496e4/shared/products/.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const SITE = "j86store-com-95a496e4";
const root = process.cwd();
const catalogPath = path.join(root, "docs/research", SITE, "catalog/catalog-raw.json");
const outDir = path.join(root, "public/sites", SITE, "shared/products");
await mkdir(outDir, { recursive: true });
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128" };
function localName(u) {
  const clean = u.split("?")[0];
  const ext = path.extname(clean);
  const base = decodeURIComponent(path.basename(clean, ext)).replace(/[^\w.\-]+/g, "_").slice(0, 60);
  return `${base}-${createHash("sha256").update(clean).digest("hex").slice(0, 6)}${ext || ".bin"}`;
}
const jobs = [];
for (const p of catalog.products) {
  for (const img of p.images) {
    jobs.push({ url: img, kind: "full" });
    jobs.push({ url: img.replace(/(\.[a-z]+)$/i, "-300x300$1"), kind: "thumb", optional: true });
  }
}
const seen = new Map();
let i = 0;
const results = [];
async function worker() {
  while (i < jobs.length) {
    const j = jobs[i++];
    if (seen.has(j.url)) continue;
    seen.set(j.url, true);
    const dest = path.join(outDir, localName(j.url));
    try {
      const res = await fetch(j.url, { headers: UA });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      results.push({ url: j.url, kind: j.kind, local: "/" + path.relative(path.join(root, "public"), dest).split(path.sep).join("/"), bytes: buf.length });
    } catch (e) {
      results.push({ url: j.url, kind: j.kind, error: String(e.message), optional: !!j.optional });
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
await writeFile(path.join(root, "docs/research", SITE, "catalog/image-map.json"), JSON.stringify(results, null, 1));
const ok = results.filter((r) => !r.error);
console.log(`ok ${ok.length}, failed ${results.length - ok.length} (optional thumbs missing: ${results.filter((r) => r.error && r.optional).length}), ${(ok.reduce((s, r) => s + r.bytes, 0) / 1048576).toFixed(1)} MB`);
console.log("hard failures:", results.filter((r) => r.error && !r.optional).slice(0, 5));
