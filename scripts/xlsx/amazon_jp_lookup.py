"""Look up Japanese retail price + main image on Amazon.co.jp for every product row that has a Japanese name.

    python scripts/xlsx/amazon_jp_lookup.py workbook.xlsx            # report only → sheet "Amazon tra cứu"
    python scripts/xlsx/amazon_jp_lookup.py workbook.xlsx --apply    # also fill "Giá Nhật (JPY)", "Link tham khảo",
                                                                      #   prepend the Amazon image URL to the image column
    python scripts/xlsx/amazon_jp_lookup.py --names "DHC ディープクレンジングオイル 70ml|キャベジンコーワα 300錠"   # ad-hoc test

Rules
  • Row needs "Tên tiếng Nhật"; rows that already have "Giá Nhật (JPY)" are skipped unless --force.
  • If "Link tham khảo" already points to amazon.co.jp/dp/<ASIN>, that page is read directly (no search).
  • Otherwise the Japanese name is searched; candidates that are bundles (セット / まとめ買い / ×N / 個) are dropped unless the
    name itself asks for a bundle; a candidate whose title contains the pack-size token of the name (70ml, 300錠, 20包 …)
    is preferred; sponsored results are ignored. Top 3 candidates are written to the report sheet for review.
  • The workbook must be closed in Excel when using --apply (a .bak copy is written first).
Requires: pip install -r scripts/xlsx/requirements.txt  +  playwright (pip install playwright && playwright install chromium)
"""
import argparse, os, re, shutil, sys, time
from urllib.parse import quote
import openpyxl
from openpyxl.styles import Font, PatternFill
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("xlsx", nargs="?")
ap.add_argument("--sheet", default="Sản phẩm mới")
ap.add_argument("--apply", action="store_true")
ap.add_argument("--force", action="store_true", help="re-lookup rows that already have a JPY price")
ap.add_argument("--limit", type=int, default=0)
ap.add_argument("--names", help="ad-hoc: '|'-separated Japanese names, print candidates and exit")
args = ap.parse_args()

# "×3" / "(×5)" / "2個セット" mean a multi-pack; "2g×20包" / "500ml×2本" is just the pack description, so an "×N"
# directly followed by a content unit does not count as a bundle.
BUNDLE = re.compile(r"(セット|まとめ買い|\d+\s?(個|本|袋|箱)セット|[×x]\s?\d+(?!\s?(包|袋|錠|粒|g|ml|mL|枚|回|カプセル|本入|個入)))", re.I)
SIZE = re.compile(r"(\d+(?:\.\d+)?)\s?(ml|mL|g|kg|錠|粒|包|袋|枚|本|回分|カプセル|日分|個)", re.I)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"

def yen(s):
    m = re.search(r"([\d,]+)", s or "")
    return int(m.group(1).replace(",", "")) if m else None

UNIT_FAMILY = {"ml": "vol", "g": "vol", "kg": "vol", "錠": "cnt", "粒": "cnt", "カプセル": "cnt", "包": "pack", "袋": "pack", "個": "pack",
               "本": "pack", "枚": "pack", "回分": "pack", "日分": "days"}

def size_tokens(name):
    """(number, unit-family) pairs so that 20包 == 20袋 and 70ml == 70mL. Full-width digits are normalised."""
    text = (name or "").translate(str.maketrans("０１２３４５６７８９ｍｌｇ", "0123456789mlg"))
    out = set()
    for a, b in SIZE.findall(text):
        num = a[:-2] if a.endswith(".0") else a
        out.add((num, UNIT_FAMILY.get(b.lower(), b.lower())))
    return out

def search(pg, q):
    pg.goto(f"https://www.amazon.co.jp/s?k={quote(q)}", wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(2000)
    items = pg.eval_on_selector_all("div.s-result-item[data-asin]:not([data-asin=''])", """els => els.slice(0, 12).map(e => ({
        asin: e.getAttribute('data-asin'),
        title: (e.querySelector('h2')?.innerText || '').trim(),
        price: (e.querySelector('.a-price .a-offscreen')?.innerText || ''),
        img: e.querySelector('img.s-image')?.src || '',
        sponsored: !!e.querySelector('[aria-label*="スポンサー"], .puis-sponsored-label-text, .s-sponsored-label-text')
    }))""")
    return [it for it in items if it["title"] and not it["sponsored"]]

def rank(cands, name):
    want_bundle = bool(BUNDLE.search(name))
    toks = size_tokens(name)
    scored = []
    for it in cands:
        t = it["title"]
        if not want_bundle and BUNDLE.search(t): continue
        score = 0
        if toks and toks & size_tokens(t): score += 10
        elif toks: score -= 20          # wrong pack size must never win just because it shows a price
        if it["price"]: score += 3
        if "医薬品" in t and "医薬品" in name: score += 1
        scored.append((score, it))
    scored.sort(key=lambda x: -x[0])
    return [it for _, it in scored]

def product_page(pg, asin):
    pg.goto(f"https://www.amazon.co.jp/dp/{asin}", wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(2000)
    title = (pg.locator("#productTitle").first.inner_text().strip() if pg.locator("#productTitle").count() else pg.title())
    price = ""
    for sel in ("#corePrice_feature_div .a-price .a-offscreen", "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen", ".a-price .a-offscreen"):
        loc = pg.locator(sel).first
        if loc.count(): price = loc.inner_text(); break
    img = ""
    for sel in ("#landingImage", "#imgTagWrapperId img", "#main-image"):
        loc = pg.locator(sel).first
        if loc.count():
            img = loc.get_attribute("data-old-hires") or loc.get_attribute("src") or ""; break
    return {"asin": asin, "title": title, "price": price, "img": big(img), "sponsored": False}

def big(url):
    # search thumbnails look like ..._AC_UL320_.jpg → strip the size modifier for the full image
    return re.sub(r"\._[A-Z0-9_,]+_\.", ".", url or "")

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(locale="ja-JP", user_agent=UA, viewport={"width": 1280, "height": 900})
    pg = ctx.new_page()

    if args.names:
        for q in args.names.split("|"):
            print(f"\n== {q}")
            for i, it in enumerate(rank(search(pg, q), q)[:3]):
                if i == 0 and not it["price"]:
                    d = product_page(pg, it["asin"]); it = {**it, "price": d["price"] or "(no price)"}
                print(f"   {it['asin']}  {it['price'] or '(no price)':>8}  {it['title'][:70]}  {big(it['img'])}")
        b.close(); sys.exit(0)

    if not args.xlsx: sys.exit("workbook path required")
    if args.apply:
        shutil.copy2(args.xlsx, args.xlsx + ".bak")
    wb = openpyxl.load_workbook(args.xlsx)              # keep formulas
    ws = wb[args.sheet]
    rows = list(ws.iter_rows(min_row=1, max_row=8, values_only=True))
    hdr_row = next(i for i, r in enumerate(rows, 1) if any(str(x or "").startswith("Tên sản phẩm") for x in r))
    H = {str(c.value or "").strip(): c.column for c in ws[hdr_row] if c.value}
    def colof(prefix):
        return next((c for h, c in H.items() if h.startswith(prefix)), None)
    C = {"stt": colof("STT") or colof("ID"), "name": colof("Tên sản phẩm"), "jp": colof("Tên tiếng Nhật"), "jpy": colof("Giá Nhật"),
         "link": colof("Link tham khảo"), "img": colof("Danh sách ảnh") or colof("Ảnh"), "note": colof("Ghi chú")}
    missing = [k for k, v in C.items() if v is None and k in ("name", "jp", "jpy", "link")]
    if missing: sys.exit(f"missing columns {missing}; found headers: {list(H)}")

    rep = wb["Amazon tra cứu"] if "Amazon tra cứu" in wb.sheetnames else wb.create_sheet("Amazon tra cứu")
    if rep.max_row <= 1:
        rep.append(["Dòng", "STT", "Tên sản phẩm", "Tên tiếng Nhật", "ASIN chọn", "Tiêu đề Amazon", "Giá (JPY)", "Link", "Ảnh", "Khớp quy cách", "Ứng viên 2", "Ứng viên 3", "Ghi chú"])
        for c in rep[1]: c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="1C7F9E")
        for col, w in zip("ABCDEFGHIJKLM", (6, 6, 40, 40, 13, 60, 10, 44, 60, 12, 50, 50, 40)): rep.column_dimensions[col].width = w
    done_rows = {r[0] for r in rep.iter_rows(min_row=2, values_only=True) if r and r[0]}

    n = 0; filled = 0; nomatch = 0
    for r in range(hdr_row + 1, ws.max_row + 1):
        name = ws.cell(r, C["name"]).value; jp = ws.cell(r, C["jp"]).value
        if not name or not jp: continue
        if ws.cell(r, C["jpy"]).value and not args.force: continue
        if r in done_rows and not args.force: continue
        if args.limit and n >= args.limit: break
        n += 1
        link = str(ws.cell(r, C["link"]).value or "")
        m = re.search(r"amazon\.co\.jp/(?:.*?/)?dp/([A-Z0-9]{10})", link)
        try:
            if m:
                best = product_page(pg, m.group(1)); cands = [best]
            else:
                cands = rank(search(pg, str(jp)), str(jp)); best = cands[0] if cands else None
                if best and not best["price"]:
                    detail = product_page(pg, best["asin"])
                    if detail["price"]: best = {**best, "price": detail["price"], "img": detail["img"] or best["img"]}
        except Exception as e:
            best, cands = None, []; print(f"  row {r}: ERROR {str(e)[:80]}")
        toks = size_tokens(str(jp))
        fit = "có" if best and toks and (toks & size_tokens(best["title"])) else ("?" if best else "")
        price = yen(best["price"]) if best else None
        alt = [f"{c['asin']} | {c['price']} | {c['title'][:60]}" for c in cands[1:3]]
        rep.append([r, ws.cell(r, C["stt"]).value if C["stt"] else None, str(name)[:80], str(jp), best["asin"] if best else "", best["title"][:120] if best else "",
                    price, f"https://www.amazon.co.jp/dp/{best['asin']}" if best else "", big(best["img"]) if best else "", fit,
                    alt[0] if alt else "", alt[1] if len(alt) > 1 else "", "" if best else "không tìm thấy"])
        if best and price:
            filled += 1
            print(f"  row {r}: {best['asin']} ¥{price:,} fit={fit} {best['title'][:50]}")
            if args.apply:
                ws.cell(r, C["jpy"]).value = price
                if not m: ws.cell(r, C["link"]).value = f"https://www.amazon.co.jp/dp/{best['asin']}"
                if C["img"] and best["img"]:
                    cur = str(ws.cell(r, C["img"]).value or "")
                    if best["img"] not in cur: ws.cell(r, C["img"]).value = (big(best["img"]) + ("\n" + cur if cur else ""))
                if C["note"]:
                    note = str(ws.cell(r, C["note"]).value or "")
                    tag = f"Amazon JP ¥{price:,} ({time.strftime('%d/%m/%Y')}, ASIN {best['asin']}, khớp quy cách: {fit})"
                    ws.cell(r, C["note"]).value = (note + "; " if note else "") + tag
        else:
            nomatch += 1; print(f"  row {r}: no match for {jp}")
        time.sleep(1.2)
    b.close()

out = args.xlsx if args.apply else re.sub(r"\.xlsx$", "-amazon.xlsx", args.xlsx)
wb.save(out)
print(f"\nlooked up {n} rows: {filled} with price, {nomatch} without. Report sheet 'Amazon tra cứu' → {out}" + (" (values applied)" if args.apply else " (report only; use --apply to fill the sheet)"))
