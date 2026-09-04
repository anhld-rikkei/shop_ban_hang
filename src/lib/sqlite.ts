import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

/**
 * SQLite connection + schema migrations for LienStore.
 *
 * - Uses Node's built-in `node:sqlite` (Node ≥ 22.13 / 24), so the Docker image needs no native build step.
 * - The database is a single file (`LIEN_DB_PATH`, default `data/lienstore.db`) — mount `/app/data` as a volume
 *   in production to keep orders/customers across container upgrades.
 * - Schema changes are appended to `MIGRATIONS`; each entry runs once, in order, inside a transaction.
 * - On an empty database the catalogue is imported from the seed JSON (`LIEN_SEED_PATH`, default `data/seed.json`).
 */

export const DB_PATH = process.env.LIEN_DB_PATH ?? path.join(process.cwd(), "data", "lienstore.db");
export const SEED_PATH = process.env.LIEN_SEED_PATH ?? path.join(process.cwd(), "data", "seed.json");

interface Migration {
  version: number;
  name: string;
  up: string[];
}

/** Append new entries here — never edit an already-shipped one. */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "initial-schema",
    up: [
      `CREATE TABLE settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
      `CREATE TABLE categories (
        slug        TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        image       TEXT,
        sort_order  INTEGER NOT NULL DEFAULT 0
      )`,
      `CREATE TABLE products (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        slug              TEXT NOT NULL UNIQUE,
        name              TEXT NOT NULL,
        price             INTEGER NOT NULL,
        regular_price     INTEGER,
        currency          TEXT NOT NULL DEFAULT 'VNĐ',
        sku               TEXT,
        stock             INTEGER,
        stock_status      TEXT NOT NULL DEFAULT 'instock' CHECK (stock_status IN ('instock','outofstock')),
        tags              TEXT NOT NULL DEFAULT '[]',   -- JSON string[]
        images            TEXT NOT NULL DEFAULT '[]',   -- JSON string[]
        thumb             TEXT NOT NULL DEFAULT '',
        short_description TEXT NOT NULL DEFAULT '',
        description       TEXT NOT NULL DEFAULT '',
        related           TEXT NOT NULL DEFAULT '[]',   -- JSON string[] of product slugs
        rating            REAL,
        review_count      INTEGER NOT NULL DEFAULT 0,
        status            TEXT NOT NULL DEFAULT 'publish' CHECK (status IN ('publish','draft')),
        created_at        TEXT NOT NULL,
        updated_at        TEXT NOT NULL
      )`,
      `CREATE INDEX idx_products_status ON products(status)`,
      `CREATE TABLE product_categories (
        product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        category_slug TEXT NOT NULL,
        position      INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (product_id, category_slug)
      )`,
      `CREATE INDEX idx_product_categories_slug ON product_categories(category_slug)`,
      `CREATE TABLE customers (
        id            TEXT PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        salt          TEXT NOT NULL,
        first_name    TEXT NOT NULL DEFAULT '',
        last_name     TEXT NOT NULL DEFAULT '',
        phone         TEXT NOT NULL DEFAULT '',
        address       TEXT NOT NULL DEFAULT '',
        created_at    TEXT NOT NULL,
        updated_at    TEXT NOT NULL
      )`,
      `CREATE TABLE orders (
        id             TEXT PRIMARY KEY,
        number         INTEGER NOT NULL UNIQUE,
        customer_id    TEXT REFERENCES customers(id) ON DELETE SET NULL,
        status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','cancelled')),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('bacs','cod')),
        first_name     TEXT NOT NULL DEFAULT '',
        last_name      TEXT NOT NULL DEFAULT '',
        address        TEXT NOT NULL DEFAULT '',
        phone          TEXT NOT NULL DEFAULT '',
        email          TEXT NOT NULL DEFAULT '',
        note           TEXT NOT NULL DEFAULT '',
        subtotal       INTEGER NOT NULL,
        total          INTEGER NOT NULL,
        currency       TEXT NOT NULL DEFAULT 'VNĐ',
        created_at     TEXT NOT NULL,
        updated_at     TEXT NOT NULL
      )`,
      `CREATE INDEX idx_orders_status ON orders(status)`,
      `CREATE INDEX idx_orders_customer ON orders(customer_id)`,
      `CREATE INDEX idx_orders_email ON orders(email)`,
      `CREATE TABLE order_items (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        slug       TEXT NOT NULL,
        name       TEXT NOT NULL,
        price      INTEGER NOT NULL,
        image      TEXT NOT NULL DEFAULT '',
        quantity   INTEGER NOT NULL CHECK (quantity > 0)
      )`,
      `CREATE INDEX idx_order_items_order ON order_items(order_id)`,
      `CREATE TABLE pages (
        slug    TEXT PRIMARY KEY,
        title   TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        date    TEXT NOT NULL
      )`,
      `CREATE TABLE posts (
        slug    TEXT PRIMARY KEY,
        title   TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        excerpt TEXT NOT NULL DEFAULT '',
        date    TEXT NOT NULL
      )`,
      `INSERT INTO settings (key, value) VALUES ('next_order_number', '1001')`,
    ],
  },
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

/** Shape of `data/seed.json` (also what `npm run db:export` writes). */
export interface SeedFile {
  products?: Array<Record<string, unknown> & { id: number; slug: string; categories?: string[] }>;
  categories?: Array<{ slug: string; name: string; description?: string; image?: string | null }>;
  customers?: Array<Record<string, unknown> & { id: string; email: string }>;
  orders?: Array<Record<string, unknown> & { id: string; number: number; items?: Array<Record<string, unknown>> }>;
  pages?: Array<{ slug: string; title: string; content: string; date: string }>;
  posts?: Array<{ slug: string; title: string; content: string; excerpt: string; date: string }>;
  meta?: { nextOrderNumber?: number };
}

type SqliteModule = typeof import("node:sqlite");

function loadSqlite(): SqliteModule {
  // `process.getBuiltinModule` bypasses the bundler so Next.js never tries to resolve `node:sqlite` itself.
  const mod = process.getBuiltinModule("node:sqlite") as SqliteModule | undefined;
  if (!mod) throw new Error("node:sqlite is not available — LienStore requires Node.js 22.13+ (Node 24 recommended).");
  return mod;
}

const globalRef = globalThis as unknown as { __lienDb?: DatabaseSync };

function open(): DatabaseSync {
  const { DatabaseSync } = loadSqlite();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA synchronous = NORMAL");
  migrate(db);
  seedIfEmpty(db);
  return db;
}

/** Process-wide connection (kept on globalThis so Next.js dev HMR does not leak handles). */
export function getDb(): DatabaseSync {
  if (!globalRef.__lienDb) globalRef.__lienDb = open();
  return globalRef.__lienDb;
}

export function withTransaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

function migrate(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version    INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    applied_at TEXT NOT NULL
  )`);
  const applied = new Set(
    (db.prepare("SELECT version FROM schema_migrations").all() as Array<{ version: number }>).map((r) => r.version),
  );
  for (const m of MIGRATIONS) {
    if (applied.has(m.version)) continue;
    withTransaction(db, () => {
      for (const sql of m.up) db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)").run(
        m.version,
        m.name,
        new Date().toISOString(),
      );
    });
    console.info(`[db] applied migration ${m.version} (${m.name})`);
  }
}

export function getSetting(db: DatabaseSync, key: string): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(db: DatabaseSync, key: string, value: string) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

function seedIfEmpty(db: DatabaseSync) {
  if (getSetting(db, "seeded_at")) return;
  if (!fs.existsSync(SEED_PATH)) {
    console.warn(`[db] empty database and no seed file at ${SEED_PATH} — starting with an empty catalogue`);
    setSetting(db, "seeded_at", new Date().toISOString());
    return;
  }
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8")) as SeedFile;
  importSeed(db, seed);
  console.info(`[db] seeded ${seed.products?.length ?? 0} products, ${seed.categories?.length ?? 0} categories from ${SEED_PATH}`);
}

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback: number | null = null): number | null => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const arr = (v: unknown): string => JSON.stringify(Array.isArray(v) ? v : []);

/** Import a seed/export file into an (assumed empty) database. */
export function importSeed(db: DatabaseSync, seed: SeedFile) {
  withTransaction(db, () => {
    const insCat = db.prepare("INSERT OR REPLACE INTO categories (slug, name, description, image, sort_order) VALUES (?, ?, ?, ?, ?)");
    (seed.categories ?? []).forEach((c, i) => insCat.run(c.slug, c.name, c.description ?? "", c.image ?? null, i));

    const insProd = db.prepare(`INSERT OR REPLACE INTO products
      (id, slug, name, price, regular_price, currency, sku, stock, stock_status, tags, images, thumb, short_description, description,
       related, rating, review_count, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insPC = db.prepare("INSERT OR REPLACE INTO product_categories (product_id, category_slug, position) VALUES (?, ?, ?)");
    const now = new Date().toISOString();
    for (const p of seed.products ?? []) {
      insProd.run(
        p.id,
        p.slug,
        str(p.name),
        num(p.price, 0),
        num(p.regularPrice),
        str(p.currency, "VNĐ"),
        typeof p.sku === "string" ? p.sku : null,
        num(p.stock),
        p.stockStatus === "outofstock" ? "outofstock" : "instock",
        arr(p.tags),
        arr(p.images),
        str(p.thumb),
        str(p.shortDescription),
        str(p.description),
        arr(p.related),
        num(p.rating),
        num(p.reviewCount, 0),
        p.status === "draft" ? "draft" : "publish",
        str(p.createdAt, now),
        str(p.updatedAt, now),
      );
      (p.categories ?? []).forEach((slug, i) => insPC.run(p.id, slug, i));
    }

    const insCust = db.prepare(`INSERT OR REPLACE INTO customers
      (id, email, password_hash, salt, first_name, last_name, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const c of seed.customers ?? []) {
      insCust.run(c.id, c.email, str(c.passwordHash), str(c.salt), str(c.firstName), str(c.lastName), str(c.phone), str(c.address), str(c.createdAt, now), str(c.updatedAt, now));
    }

    const insOrder = db.prepare(`INSERT OR REPLACE INTO orders
      (id, number, customer_id, status, payment_method, first_name, last_name, address, phone, email, note, subtotal, total, currency, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insItem = db.prepare("INSERT INTO order_items (order_id, product_id, slug, name, price, image, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)");
    for (const o of seed.orders ?? []) {
      const cust = (o.customer ?? {}) as Record<string, unknown>;
      insOrder.run(
        o.id,
        o.number,
        typeof o.customerId === "string" ? o.customerId : null,
        str(o.status, "pending"),
        str(o.paymentMethod, "cod"),
        str(cust.firstName),
        str(cust.lastName),
        str(cust.address),
        str(cust.phone),
        str(cust.email),
        str(cust.note),
        num(o.subtotal, 0),
        num(o.total, 0),
        str(o.currency, "VNĐ"),
        str(o.createdAt, now),
        str(o.updatedAt, now),
      );
      for (const it of o.items ?? []) {
        insItem.run(o.id, num(it.productId, 0), str(it.slug), str(it.name), num(it.price, 0), str(it.image), Math.max(1, num(it.quantity, 1) ?? 1));
      }
    }

    const insPage = db.prepare("INSERT OR REPLACE INTO pages (slug, title, content, date) VALUES (?, ?, ?, ?)");
    for (const p of seed.pages ?? []) insPage.run(p.slug, p.title, p.content, p.date);
    const insPost = db.prepare("INSERT OR REPLACE INTO posts (slug, title, content, excerpt, date) VALUES (?, ?, ?, ?, ?)");
    for (const p of seed.posts ?? []) insPost.run(p.slug, p.title, p.content, p.excerpt, p.date);

    const maxOrder = (db.prepare("SELECT COALESCE(MAX(number), 1000) AS n FROM orders").get() as { n: number }).n;
    setSetting(db, "next_order_number", String(Math.max(seed.meta?.nextOrderNumber ?? 1001, maxOrder + 1)));
    setSetting(db, "seeded_at", now);
  });
}

/** Version info for /api/health. */
export function getSchemaInfo(db: DatabaseSync) {
  const row = db.prepare("SELECT MAX(version) AS v FROM schema_migrations").get() as { v: number | null };
  return { schemaVersion: row.v ?? 0, latest: SCHEMA_VERSION, path: DB_PATH };
}
