"use client";

import { useState } from "react";
import Link from "next/link";
import type { MenuLink } from "@/types/lienstore";
import { Fa } from "@/components/sites/lienstore/shared/icons";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/sites/lienstore/shop/SearchModal";

interface MainNavProps {
  categoriesLabel: string;
  categories: MenuLink[];
  items: MenuLink[];
  /** Kept for API compatibility; the nav search icon now opens the search modal. */
  searchHref?: string;
  className?: string;
}

export function MainNav({ categoriesLabel, categories, items, className }: MainNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div id="sticky-nav" className={cn("bg-white", className)}>
      <div className="mx-auto max-w-[1200px] px-[15px]">
        <div className="-mx-[15px] flex items-center">
          <div className="relative w-full px-[15px]">
            <div className="relative z-[9999] text-[15px] leading-[22.5px] sm:z-[3]">
              <nav
                id="site-navigation"
                aria-label="Main menu"
                className={cn("font-oswald tracking-[1px]", open && "toggled-on")}
              >
                {/* Mobile toggle (hidden ≥768) */}
                <button
                  id="main-menu-toggle"
                  type="button"
                  aria-controls="top-menu"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  className={cn(
                    "mx-auto mt-px mb-0.5 block rounded-[2px] border p-[7px] text-center font-arial text-[14px] font-extrabold leading-[21px] transition-[background-color] duration-[400ms] ease-in-out sm:hidden",
                    open ? "border-lien-blue text-lien-blue" : "border-transparent text-lien-toggle",
                  )}
                >
                  <Fa
                    name={open ? "close" : "bars"}
                    className="relative -top-0.5 mr-[7px] inline-block align-middle text-[14px] leading-[14px]"
                  />
                  Menu
                </button>

                <div className="sm:flex sm:justify-center">
                  <ul
                    id="top-menu"
                    className={cn(
                      "m-0 list-none p-0 text-left",
                      /* mobile list */
                      "bg-white px-[3.2px] py-3 text-[16px] leading-[18.4px] sm:bg-transparent sm:p-0",
                      open ? "block" : "hidden",
                      /* desktop inline menu */
                      "sm:flex sm:items-center sm:text-[15px] sm:leading-[22.5px] sm:capitalize",
                    )}
                  >
                    {/* "Product Categories" with hover dropdown — hidden on xs like the original */}
                    <li className="group relative mr-[10px] hidden sm:block">
                      <Link
                        href="/"
                        className="block rounded-t-[8px] bg-lien-blue px-[11.25px] py-3 text-white group-hover:rounded-[1px]"
                      >
                        <Fa name="align-left" className="mr-1.5 text-[15px] leading-[15px] align-[-1px]" />
                        {categoriesLabel}
                      </Link>
                      <ul className="absolute top-full left-[7px] z-[99999] m-0 hidden w-[242px] list-none border border-[#dddddd] bg-white p-0 normal-case tracking-normal shadow-[0_8px_12px_0_rgba(0,0,0,0.2)] group-hover:block">
                        {categories.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className="block px-[18.75px] py-[11.25px] text-[15px] leading-[22.5px] text-lien-nav hover:bg-lien-blue hover:text-white"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>

                    {items.map((item) => (
                      <li key={item.href} className="relative border-b border-lien-line sm:border-0">
                        <Link
                          href={item.href}
                          className="block px-[4.8px] py-2 text-lien-nav sm:px-[11.25px] sm:py-3 sm:hover:rounded-[1px] sm:hover:bg-lien-blue sm:hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}

                    <li className="relative">
                      <SearchModal triggerClassName="block w-full p-[15px] text-left text-lien-search-icon sm:px-3 sm:py-[12.8px] sm:text-[16px] sm:leading-6 sm:hover:rounded-[1px] sm:hover:bg-lien-blue sm:hover:text-white" />
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
