"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fa } from "@/components/sites/lienstore/shared/icons";
import { useCart } from "@/components/sites/lienstore/shop/CartProvider";
import { cn } from "@/lib/utils";

export interface HeaderCategory {
  name: string;
  slug: string;
  count: number;
  image: string | null;
}

export interface HeaderLink {
  label: string;
  href: string;
}

interface Header2Props {
  logo: { src: string; width: number; height: number; alt: string };
  categories: HeaderCategory[];
  supportLinks: HeaderLink[];
  aboutHref: string;
  newsHref: string;
  contactHref: string;
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-lien-sale px-1 text-[11px] font-bold leading-none text-white">
      {n}
    </span>
  );
}

/**
 * Main header (sesofoods-style): logo · inline menu with "Danh mục" mega dropdown · pill search · account/wishlist/cart.
 * Collapses to a hamburger + drawer below 992px. Becomes compact and sticky after scrolling.
 */
export function Header2({ logo, categories, supportLinks, aboutHref, newsHref, contactHref }: Header2Props) {
  const { items, wishlist, hydrated } = useCart();
  const cartCount = hydrated ? items.reduce((s, i) => s + i.quantity, 0) : 0;
  const wishCount = hydrated ? wishlist.length : 0;
  const [open, setOpen] = useState<null | "cat" | "support">(null);
  const [drawer, setDrawer] = useState(false);
  const [stuck, setStuck] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const topCats = [...categories].sort((a, b) => b.count - a.count);
  const navItem = "inline-flex h-[44px] items-center gap-1 px-3 text-[14px] font-semibold uppercase tracking-[0.2px] text-lien-heading no-underline hover:text-lien-blue";

  return (
    <header className={cn("sticky top-0 z-[9000] border-b border-lien-line bg-white shadow-[0_1px_0_0_#eee] transition-shadow", stuck && "shadow-[0_4px_16px_-8px_rgba(0,0,0,0.25)]")}>
      <div className="mx-auto flex max-w-[1300px] items-center gap-4 px-4 py-2 lg:gap-6" ref={navRef}>
        <button type="button" onClick={() => setDrawer(true)} aria-label="Mở menu" className="flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-lien-heading hover:bg-lien-cream lg:hidden">
          <Fa name="bars" />
        </button>

        <Link href="/" className="shrink-0" aria-label="LienStore">
          <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} priority unoptimized className={cn("h-auto w-[150px] transition-[width] sm:w-[190px]", stuck && "sm:w-[160px]")} />
        </Link>

        <nav aria-label="Menu chính" className="hidden items-center lg:flex">
          <div className="relative">
            <button type="button" onClick={() => setOpen(open === "cat" ? null : "cat")} className={cn(navItem, open === "cat" && "text-lien-blue")} aria-expanded={open === "cat"}>
              <Fa name="th-large" className="mr-1 text-[13px]" />
              Danh mục
              <Fa name="angle-down" className="text-[12px]" />
              <span className="ml-1 rounded-full bg-lien-sale px-1.5 py-px text-[9px] font-bold uppercase text-white">Sale</span>
            </button>
            {open === "cat" ? (
              <div className="absolute top-full left-0 z-50 mt-1 w-[720px] rounded-md border border-lien-line bg-white p-4 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)]">
                <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                  {topCats.map((c) => (
                    <Link key={c.slug} href={`/product-category/${c.slug}/`} className="flex items-center gap-2 rounded px-2 py-1.5 text-[13px] leading-5 text-lien-text no-underline hover:bg-lien-blue-soft hover:text-lien-blue">
                      <Fa name="angle-right" className="text-[11px] text-lien-blue" />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-[12px] text-lien-muted">({c.count})</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-lien-line pt-3 text-[13px]">
                  <Link href="/shop/" className="font-semibold text-lien-blue no-underline hover:underline">
                    Xem tất cả sản phẩm →
                  </Link>
                  <Link href="/shop/?orderby=date" className="text-lien-muted no-underline hover:text-lien-blue">
                    Hàng mới về
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button type="button" onClick={() => setOpen(open === "support" ? null : "support")} className={cn(navItem, open === "support" && "text-lien-blue")} aria-expanded={open === "support"}>
              Hỗ trợ
              <Fa name="angle-down" className="text-[12px]" />
            </button>
            {open === "support" ? (
              <div className="absolute top-full left-0 z-50 mt-1 w-[240px] rounded-md border border-lien-line bg-white py-2 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)]">
                {supportLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="block px-4 py-2 text-[13px] leading-5 text-lien-text no-underline hover:bg-lien-blue-soft hover:text-lien-blue">
                    {l.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link href={newsHref} className={navItem}>
            Tin tức
            <span className="ml-1 rounded-full bg-lien-info px-1.5 py-px text-[9px] font-bold uppercase text-white">New</span>
          </Link>
          <Link href={aboutHref} className={navItem}>
            <Fa name="user-circle" className="mr-1 text-[13px]" />
            Về chúng tôi
          </Link>
          <Link href={contactHref} className={navItem}>
            Liên hệ
          </Link>
        </nav>

        <form action="/shop/" method="get" role="search" className="ml-auto hidden h-[42px] w-[280px] items-center overflow-hidden rounded-full border border-lien-line bg-lien-cream/60 focus-within:border-lien-blue focus-within:bg-white md:flex xl:w-[320px]">
          <input name="s" placeholder="Tìm kiếm sản phẩm" aria-label="Tìm kiếm sản phẩm" className="h-full flex-1 bg-transparent pl-4 text-[14px] text-lien-text outline-none placeholder:text-lien-muted" />
          <button type="submit" aria-label="Tìm" className="flex h-full w-11 items-center justify-center text-[16px] text-lien-heading hover:text-lien-blue">
            <Fa name="search" />
          </button>
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/my-account/" aria-label="Tài khoản" className="flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-lien-heading no-underline hover:bg-lien-cream hover:text-lien-blue">
            <Fa name="user" />
          </Link>
          <Link href="/wishlist/" aria-label="Yêu thích" className="relative flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-lien-heading no-underline hover:bg-lien-cream hover:text-lien-blue">
            <Fa name="heart-o" />
            {wishCount ? <Badge n={wishCount} /> : null}
          </Link>
          <Link href="/cart/" aria-label="Giỏ hàng" className="relative flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-lien-heading no-underline hover:bg-lien-cream hover:text-lien-blue" data-cart-count={cartCount}>
            <Fa name="shopping-cart" />
            <Badge n={cartCount} />
          </Link>
        </div>
      </div>

      {/* mobile search row */}
      <form action="/shop/" method="get" role="search" className="mx-4 mb-2 flex h-[40px] items-center overflow-hidden rounded-full border border-lien-line bg-lien-cream/60 md:hidden">
        <input name="s" placeholder="Tìm kiếm sản phẩm" aria-label="Tìm kiếm sản phẩm" className="h-full flex-1 bg-transparent pl-4 text-[14px] text-lien-text outline-none placeholder:text-lien-muted" />
        <button type="submit" aria-label="Tìm" className="flex h-full w-11 items-center justify-center text-[16px] text-lien-heading">
          <Fa name="search" />
        </button>
      </form>

      {/* mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-[9500] lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="Đóng menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/40" />
          <div className="absolute top-0 left-0 flex h-full w-[86%] max-w-[360px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-lien-line px-4 py-3">
              <span className="text-[15px] font-semibold uppercase text-lien-heading">Menu</span>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Đóng" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-lien-cream">
                <Fa name="times" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-lien-line px-4 py-3">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-lien-muted">Danh mục</p>
                <ul className="m-0 list-none p-0">
                  {topCats.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/product-category/${c.slug}/`} className="flex items-center justify-between py-2 text-[14px] text-lien-text no-underline">
                        <span>{c.name}</span>
                        <span className="text-[12px] text-lien-muted">{c.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-4 py-3">
                {[{ label: "Tất cả sản phẩm", href: "/shop/" }, ...supportLinks, { label: "Tin tức", href: newsHref }, { label: "Về chúng tôi", href: aboutHref }, { label: "Liên hệ", href: contactHref }, { label: "Tài khoản", href: "/my-account/" }].map((l) => (
                  <Link key={l.href + l.label} href={l.href} className="block py-2 text-[14px] font-medium text-lien-heading no-underline">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
