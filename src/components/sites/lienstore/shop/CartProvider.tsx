"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/types/shop";

/** Minimal product shape needed to put something in the cart / wishlist / recently viewed. */
export interface CartProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
}

interface LastAdded {
  productId: number;
  name: string;
  at: number;
}

interface CartState {
  items: CartItem[];
  wishlist: CartProduct[];
  recentlyViewed: CartProduct[];
  lastAdded: LastAdded | null;
  hydrated: boolean;
}

interface CartApi extends CartState {
  count: number;
  subtotal: number;
  add: (product: CartProduct, quantity?: number) => void;
  update: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  dismissLastAdded: () => void;
  toggleWishlist: (product: CartProduct) => void;
  removeFromWishlist: (productId: number) => void;
  inWishlist: (productId: number) => boolean;
  trackViewed: (product: CartProduct) => void;
  /** Slide-in mini cart (opened after add-to-cart / header cart icon). */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CART_KEY = "lienstore:cart";
const WISHLIST_KEY = "lienstore:wishlist";
const VIEWED_KEY = "lienstore:viewed";
const MAX_VIEWED = 8;

const CartContext = createContext<CartApi | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep in-memory state only */
  }
}

const EMPTY: CartState = { items: [], wishlist: [], recentlyViewed: [], lastAdded: null, hydrated: false };

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    // Hydrate from localStorage after mount (deferred so the first client render matches the server).
    const timer = window.setTimeout(() => {
      setState((s) => ({
        ...s,
        items: load<CartItem[]>(CART_KEY, []),
        wishlist: load<CartProduct[]>(WISHLIST_KEY, []),
        recentlyViewed: load<CartProduct[]>(VIEWED_KEY, []),
        hydrated: true,
      }));
    }, 0);
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY || e.key === WISHLIST_KEY || e.key === VIEWED_KEY) {
        setState((s) => ({
          ...s,
          items: load<CartItem[]>(CART_KEY, []),
          wishlist: load<CartProduct[]>(WISHLIST_KEY, []),
          recentlyViewed: load<CartProduct[]>(VIEWED_KEY, []),
        }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setItems = useCallback((updater: (items: CartItem[]) => CartItem[], lastAdded?: LastAdded) => {
    setState((s) => {
      const items = updater(s.items);
      if (items === s.items && !lastAdded) return s;
      if (items !== s.items) persist(CART_KEY, items);
      return { ...s, items, lastAdded: lastAdded ?? s.lastAdded };
    });
  }, []);

  const setWishlist = useCallback((updater: (w: CartProduct[]) => CartProduct[]) => {
    setState((s) => {
      const wishlist = updater(s.wishlist);
      if (wishlist === s.wishlist) return s;
      persist(WISHLIST_KEY, wishlist);
      return { ...s, wishlist };
    });
  }, []);

  const add = useCallback<CartApi["add"]>(
    (product, quantity = 1) =>
      setItems(
        (items) => {
          const qty = Math.max(1, Math.floor(quantity));
          const existing = items.find((it) => it.productId === product.id);
          if (existing) return items.map((it) => (it.productId === product.id ? { ...it, quantity: it.quantity + qty } : it));
          return [...items, { productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, quantity: qty }];
        },
        { productId: product.id, name: product.name, at: Date.now() },
      ),
    [setItems],
  );
  const update = useCallback<CartApi["update"]>(
    (productId, quantity) =>
      setItems((items) =>
        quantity <= 0
          ? items.filter((it) => it.productId !== productId)
          : items.map((it) => (it.productId === productId ? { ...it, quantity: Math.floor(quantity) } : it)),
      ),
    [setItems],
  );
  const remove = useCallback<CartApi["remove"]>((productId) => setItems((items) => items.filter((it) => it.productId !== productId)), [setItems]);
  const clear = useCallback<CartApi["clear"]>(() => setItems((items) => (items.length === 0 ? items : [])), [setItems]);
  const dismissLastAdded = useCallback(() => setState((s) => (s.lastAdded ? { ...s, lastAdded: null } : s)), []);
  const toggleWishlist = useCallback<CartApi["toggleWishlist"]>(
    (product) => setWishlist((w) => (w.some((p) => p.id === product.id) ? w.filter((p) => p.id !== product.id) : [...w, product])),
    [setWishlist],
  );
  const removeFromWishlist = useCallback<CartApi["removeFromWishlist"]>((productId) => setWishlist((w) => w.filter((p) => p.id !== productId)), [setWishlist]);
  const trackViewed = useCallback<CartApi["trackViewed"]>((product) => {
    setState((s) => {
      if (s.recentlyViewed[0]?.id === product.id) return s;
      const recentlyViewed = [product, ...s.recentlyViewed.filter((p) => p.id !== product.id)].slice(0, MAX_VIEWED);
      persist(VIEWED_KEY, recentlyViewed);
      return { ...s, recentlyViewed };
    });
  }, []);

  const api = useMemo<CartApi>(() => {
    const count = state.items.reduce((n, it) => n + it.quantity, 0);
    const subtotal = state.items.reduce((n, it) => n + it.price * it.quantity, 0);
    return {
      ...state,
      count,
      subtotal,
      add,
      update,
      remove,
      clear,
      dismissLastAdded,
      toggleWishlist,
      removeFromWishlist,
      inWishlist: (productId) => state.wishlist.some((p) => p.id === productId),
      trackViewed,
      drawerOpen,
      openDrawer,
      closeDrawer,
    };
  }, [state, add, update, remove, clear, dismissLastAdded, toggleWishlist, removeFromWishlist, trackViewed, drawerOpen, openDrawer, closeDrawer]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
