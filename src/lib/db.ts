import "server-only";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type {
  CartItem,
  CatalogProduct,
  Customer,
  Order,
  OrderCustomer,
  OrderStatus,
  PaymentMethod,
  ProductQuery,
  ProductQueryResult,
  ShopCategory,
  StaticPage,
  BlogPost,
} from "@/types/shop";
import { getDb, getSchemaInfo, getSetting, setSetting, withTransaction } from "./sqlite";

/**
 * Data-access layer on top of SQLite (see `sqlite.ts` for schema + migrations).
 * Every function is async so callers do not change if the backend moves to Postgres later.
 */

// ---------- Row mappers ----------

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  price: number;
  regular_price: number | null;
  cost_price: number | null;
  currency: string;
  sku: string | null;
  stock: number | null;
  stock_status: "instock" | "outofstock";
  tags: string;
  images: string;
  thumb: string;
  short_description: string;
  description: string;
  related: string;
  rating: number | null;
  review_count: number;
  status: "publish" | "draft";
  created_at: string;
  updated_at: string;
  categories: string | null;
}

const PRODUCT_SELECT = `SELECT p.*,
  (SELECT json_group_array(category_slug) FROM (SELECT category_slug FROM product_categories WHERE product_id = p.id ORDER BY position)) AS categories
  FROM products p`;

function parseArr(s: string | null): string[] {
  try {
    const v = JSON.parse(s ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function rowToProduct(r: ProductRow): CatalogProduct {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    price: r.price,
    regularPrice: r.regular_price,
    costPrice: r.cost_price ?? null,
    currency: r.currency,
    sku: r.sku,
    stock: r.stock,
    stockStatus: r.stock_status,
    categories: parseArr(r.categories),
    tags: parseArr(r.tags),
    images: parseArr(r.images),
    thumb: r.thumb,
    shortDescription: r.short_description,
    description: r.description,
    related: parseArr(r.related),
    rating: r.rating,
    reviewCount: r.review_count,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

interface CategoryRow {
  slug: string;
  name: string;
  description: string;
  image: string | null;
  count: number;
}

const CATEGORY_SELECT = `SELECT c.slug, c.name, c.description, c.image,
  (SELECT COUNT(*) FROM product_categories pc JOIN products p ON p.id = pc.product_id
    WHERE pc.category_slug = c.slug AND p.status = 'publish') AS count
  FROM categories c`;

const rowToCategory = (r: CategoryRow): ShopCategory => ({ slug: r.slug, name: r.name, description: r.description, image: r.image, count: r.count });

interface OrderRow {
  id: string;
  number: number;
  customer_id: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  email: string;
  note: string;
  subtotal: number;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  order_id: string;
  product_id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

function hydrateOrders(rows: OrderRow[]): Order[] {
  if (rows.length === 0) return [];
  const db = getDb();
  const placeholders = rows.map(() => "?").join(",");
  const items = db
    .prepare(`SELECT order_id, product_id, slug, name, price, image, quantity FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id`)
    .all(...rows.map((r) => r.id)) as unknown as OrderItemRow[];
  const byOrder = new Map<string, CartItem[]>();
  for (const it of items) {
    const list = byOrder.get(it.order_id) ?? [];
    list.push({ productId: it.product_id, slug: it.slug, name: it.name, price: it.price, image: it.image, quantity: it.quantity });
    byOrder.set(it.order_id, list);
  }
  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    ...(r.customer_id ? { customerId: r.customer_id } : {}),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    status: r.status,
    paymentMethod: r.payment_method,
    customer: { firstName: r.first_name, lastName: r.last_name, address: r.address, phone: r.phone, email: r.email, note: r.note },
    items: byOrder.get(r.id) ?? [],
    subtotal: r.subtotal,
    total: r.total,
    currency: r.currency,
  }));
}

interface CustomerRow {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

const rowToCustomer = (r: CustomerRow): Customer => ({
  id: r.id,
  email: r.email,
  passwordHash: r.password_hash,
  salt: r.salt,
  firstName: r.first_name,
  lastName: r.last_name,
  phone: r.phone,
  address: r.address,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

// ---------- Products ----------

export async function getAllProducts(includeDrafts = false): Promise<CatalogProduct[]> {
  const db = getDb();
  const sql = includeDrafts ? `${PRODUCT_SELECT} ORDER BY p.id` : `${PRODUCT_SELECT} WHERE p.status = 'publish' ORDER BY p.id`;
  return (db.prepare(sql).all() as unknown as ProductRow[]).map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const row = getDb().prepare(`${PRODUCT_SELECT} WHERE p.slug = ?`).get(slug) as ProductRow | undefined;
  return row ? rowToProduct(row) : null;
}

export async function getProductById(id: number): Promise<CatalogProduct | null> {
  const row = getDb().prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id) as ProductRow | undefined;
  return row ? rowToProduct(row) : null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<CatalogProduct[]> {
  if (slugs.length === 0) return [];
  const placeholders = slugs.map(() => "?").join(",");
  const rows = getDb().prepare(`${PRODUCT_SELECT} WHERE p.status = 'publish' AND p.slug IN (${placeholders})`).all(...slugs) as unknown as ProductRow[];
  const bySlug = new Map(rows.map((r) => [r.slug, rowToProduct(r)] as const));
  return slugs.map((s) => bySlug.get(s)).filter((p): p is CatalogProduct => !!p);
}

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

/**
 * Listing query. Filtering/sorting happens in JS after a single SELECT: the catalogue is small (hundreds of rows)
 * and Vietnamese accent-insensitive search is simpler here than in SQL. Move to FTS5 when the catalogue grows.
 */
export async function queryProducts(q: ProductQuery = {}): Promise<ProductQueryResult> {
  const perPage = q.perPage ?? 32;
  const page = Math.max(1, q.page ?? 1);
  let items = await getAllProducts(q.includeDrafts);
  if (q.category) items = items.filter((p) => p.categories.includes(q.category as string));
  if (q.tag) {
    const tag = normalise(q.tag).replace(/-/g, " ");
    items = items.filter((p) => p.tags.some((t) => normalise(t) === tag));
  }
  if (q.search) {
    const terms = normalise(q.search).split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const hay = normalise(`${p.name} ${p.tags.join(" ")} ${p.shortDescription}`);
      return terms.every((t) => hay.includes(t));
    });
  }
  switch (q.orderby) {
    case "price":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case "date":
      items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "rating":
      items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    default:
      // "popularity": the original lists newest ids first
      items = [...items].sort((a, b) => b.id - a.id);
  }
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  return { items: items.slice(start, start + perPage), total, page, perPage, totalPages };
}

export async function getRelatedProducts(product: CatalogProduct, limit = 4): Promise<CatalogProduct[]> {
  const explicit = await getProductsBySlugs(product.related);
  if (explicit.length >= limit) return explicit.slice(0, limit);
  const all = await getAllProducts();
  const sameCat = all.filter(
    (p) => p.id !== product.id && !explicit.some((e) => e.id === p.id) && p.categories.some((c) => product.categories.includes(c)),
  );
  return [...explicit, ...sameCat].slice(0, limit);
}

export type ProductInput = Omit<CatalogProduct, "id" | "createdAt" | "updatedAt"> & { id?: number };

export async function saveProduct(input: ProductInput): Promise<CatalogProduct> {
  const db = getDb();
  return withTransaction(db, () => {
    const now = new Date().toISOString();
    let id = input.id;
    if (id) {
      const exists = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
      if (!exists) throw new Error(`Product ${id} not found`);
      db.prepare(`UPDATE products SET slug = ?, name = ?, price = ?, regular_price = ?, cost_price = ?, currency = ?, sku = ?, stock = ?, stock_status = ?,
        tags = ?, images = ?, thumb = ?, short_description = ?, description = ?, related = ?, rating = ?, review_count = ?, status = ?, updated_at = ?
        WHERE id = ?`).run(
        input.slug,
        input.name,
        input.price,
        input.regularPrice,
        input.costPrice,
        input.currency,
        input.sku,
        input.stock,
        input.stockStatus,
        JSON.stringify(input.tags),
        JSON.stringify(input.images),
        input.thumb,
        input.shortDescription,
        input.description,
        JSON.stringify(input.related),
        input.rating,
        input.reviewCount,
        input.status,
        now,
        id,
      );
      db.prepare("DELETE FROM product_categories WHERE product_id = ?").run(id);
    } else {
      const res = db.prepare(`INSERT INTO products (slug, name, price, regular_price, cost_price, currency, sku, stock, stock_status, tags, images, thumb,
        short_description, description, related, rating, review_count, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        input.slug,
        input.name,
        input.price,
        input.regularPrice,
        input.costPrice,
        input.currency,
        input.sku,
        input.stock,
        input.stockStatus,
        JSON.stringify(input.tags),
        JSON.stringify(input.images),
        input.thumb,
        input.shortDescription,
        input.description,
        JSON.stringify(input.related),
        input.rating,
        input.reviewCount,
        input.status,
        now,
        now,
      );
      id = Number(res.lastInsertRowid);
    }
    const insPC = db.prepare("INSERT OR IGNORE INTO product_categories (product_id, category_slug, position) VALUES (?, ?, ?)");
    input.categories.forEach((slug, i) => insPC.run(id, slug, i));
    const row = db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id) as unknown as ProductRow;
    return rowToProduct(row);
  });
}

export async function deleteProduct(id: number): Promise<boolean> {
  const res = getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
  return Number(res.changes) > 0;
}

export async function slugExists(slug: string, exceptId?: number): Promise<boolean> {
  const row = getDb()
    .prepare("SELECT 1 FROM products WHERE slug = ? AND id IS NOT ?")
    .get(slug, exceptId ?? null);
  return !!row;
}

// ---------- Categories ----------

export async function getCategories(): Promise<ShopCategory[]> {
  const rows = getDb().prepare(CATEGORY_SELECT).all() as unknown as CategoryRow[];
  return rows.map(rowToCategory).sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export interface CategoryInput {
  slug: string;
  name: string;
  description: string;
  image: string | null;
  /** Slug of the category being edited (omit when creating). */
  originalSlug?: string;
}

export async function categorySlugExists(slug: string, except?: string): Promise<boolean> {
  const row = getDb().prepare("SELECT 1 FROM categories WHERE slug = ? AND slug IS NOT ?").get(slug, except ?? null);
  return !!row;
}

export async function saveCategory(input: CategoryInput): Promise<ShopCategory> {
  const db = getDb();
  return withTransaction(db, () => {
    if (input.originalSlug) {
      const cat = db.prepare("SELECT slug FROM categories WHERE slug = ?").get(input.originalSlug) as { slug: string } | undefined;
      if (!cat) throw new Error("Danh mục không tồn tại.");
      if (input.slug !== cat.slug) {
        if (db.prepare("SELECT 1 FROM categories WHERE slug = ?").get(input.slug)) throw new Error("Đường dẫn đã tồn tại.");
        db.prepare("UPDATE product_categories SET category_slug = ? WHERE category_slug = ?").run(input.slug, cat.slug);
      }
      db.prepare("UPDATE categories SET slug = ?, name = ?, description = ?, image = ? WHERE slug = ?").run(
        input.slug,
        input.name,
        input.description,
        input.image,
        cat.slug,
      );
    } else {
      if (db.prepare("SELECT 1 FROM categories WHERE slug = ?").get(input.slug)) throw new Error("Đường dẫn đã tồn tại.");
      const next = (db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM categories").get() as { n: number }).n;
      db.prepare("INSERT INTO categories (slug, name, description, image, sort_order) VALUES (?, ?, ?, ?, ?)").run(
        input.slug,
        input.name,
        input.description,
        input.image,
        next,
      );
    }
    const row = db.prepare(`${CATEGORY_SELECT} WHERE c.slug = ?`).get(input.slug) as unknown as CategoryRow;
    return rowToCategory(row);
  });
}

/** Deletes a category and detaches it from every product. */
export async function deleteCategory(slug: string): Promise<boolean> {
  const db = getDb();
  return withTransaction(db, () => {
    const res = db.prepare("DELETE FROM categories WHERE slug = ?").run(slug);
    db.prepare("DELETE FROM product_categories WHERE category_slug = ?").run(slug);
    return Number(res.changes) > 0;
  });
}

export async function getCategoryBySlug(slug: string): Promise<ShopCategory | null> {
  const row = getDb().prepare(`${CATEGORY_SELECT} WHERE c.slug = ?`).get(slug) as CategoryRow | undefined;
  return row ? rowToCategory(row) : null;
}

// ---------- Orders ----------

export interface CreateOrderInput {
  customer: OrderCustomer;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  customerId?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const db = getDb();
  return withTransaction(db, () => {
    const now = new Date().toISOString();
    // Re-price items from the catalogue so the client cannot tamper with prices.
    const items: CartItem[] = [];
    for (const it of input.items) {
      const row = db.prepare("SELECT id, slug, name, price, thumb FROM products WHERE id = ? AND status = 'publish'").get(it.productId) as
        | { id: number; slug: string; name: string; price: number; thumb: string }
        | undefined;
      if (!row) continue;
      items.push({ productId: row.id, slug: row.slug, name: row.name, price: row.price, image: row.thumb, quantity: Math.max(1, Math.floor(it.quantity)) });
    }
    if (items.length === 0) throw new Error("Giỏ hàng trống");
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const number = Number(getSetting(db, "next_order_number") ?? "1001");
    setSetting(db, "next_order_number", String(number + 1));
    const id = randomUUID();
    const c = input.customer;
    db.prepare(`INSERT INTO orders (id, number, customer_id, status, payment_method, first_name, last_name, address, phone, email, note,
      subtotal, total, currency, created_at, updated_at) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VNĐ', ?, ?)`).run(
      id,
      number,
      input.customerId ?? null,
      input.paymentMethod,
      c.firstName,
      c.lastName,
      c.address,
      c.phone,
      c.email,
      c.note,
      subtotal,
      subtotal,
      now,
      now,
    );
    const insItem = db.prepare("INSERT INTO order_items (order_id, product_id, slug, name, price, image, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const decStock = db.prepare(`UPDATE products SET stock = MAX(0, stock - ?),
      stock_status = CASE WHEN MAX(0, stock - ?) = 0 THEN 'outofstock' ELSE 'instock' END, updated_at = ?
      WHERE id = ? AND stock IS NOT NULL`);
    for (const it of items) {
      insItem.run(id, it.productId, it.slug, it.name, it.price, it.image, it.quantity);
      decStock.run(it.quantity, it.quantity, now, it.productId);
    }
    return {
      id,
      number,
      ...(input.customerId ? { customerId: input.customerId } : {}),
      createdAt: now,
      updatedAt: now,
      status: "pending",
      paymentMethod: input.paymentMethod,
      customer: c,
      items,
      subtotal,
      total: subtotal,
      currency: "VNĐ",
    };
  });
}

const ORDER_ORDER = "ORDER BY created_at DESC, number DESC";

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const db = getDb();
  const rows = (status
    ? db.prepare(`SELECT * FROM orders WHERE status = ? ${ORDER_ORDER}`).all(status)
    : db.prepare(`SELECT * FROM orders ${ORDER_ORDER}`).all()) as unknown as OrderRow[];
  return hydrateOrders(rows);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const row = getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? hydrateOrders([row])[0] : null;
}

export async function findOrder(number: number, phone: string): Promise<Order | null> {
  const digits = phone.replace(/\D/g, "");
  const row = getDb().prepare("SELECT * FROM orders WHERE number = ?").get(number) as OrderRow | undefined;
  if (!row || row.phone.replace(/\D/g, "") !== digits) return null;
  return hydrateOrders([row])[0];
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const res = getDb().prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), id);
  return Number(res.changes) > 0 ? getOrderById(id) : null;
}

// ---------- Customers ----------

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export type PublicCustomer = Omit<Customer, "passwordHash" | "salt">;

export function toPublicCustomer(c: Customer): PublicCustomer {
  const { passwordHash: _hash, salt: _salt, ...rest } = c;
  void _hash;
  void _salt;
  return rest;
}

export interface CreateCustomerInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const row = getDb().prepare("SELECT * FROM customers WHERE email = ?").get(email.trim().toLowerCase()) as CustomerRow | undefined;
  return row ? rowToCustomer(row) : null;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const row = getDb().prepare("SELECT * FROM customers WHERE id = ?").get(id) as CustomerRow | undefined;
  return row ? rowToCustomer(row) : null;
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  if (db.prepare("SELECT 1 FROM customers WHERE email = ?").get(email)) throw new Error("Email này đã được đăng ký. Vui lòng đăng nhập.");
  const salt = randomBytes(16).toString("hex");
  const now = new Date().toISOString();
  const customer: Customer = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(input.password, salt),
    salt,
    firstName: input.firstName ?? "",
    lastName: input.lastName ?? "",
    phone: input.phone ?? "",
    address: input.address ?? "",
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(`INSERT INTO customers (id, email, password_hash, salt, first_name, last_name, phone, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    customer.id,
    customer.email,
    customer.passwordHash,
    customer.salt,
    customer.firstName,
    customer.lastName,
    customer.phone,
    customer.address,
    now,
    now,
  );
  return customer;
}

export async function verifyCustomer(email: string, password: string): Promise<Customer | null> {
  const c = await findCustomerByEmail(email);
  if (!c) return null;
  const a = Buffer.from(hashPassword(password, c.salt), "hex");
  const b = Buffer.from(c.passwordHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b) ? c : null;
}

export async function updateCustomer(
  id: string,
  patch: Partial<Pick<Customer, "firstName" | "lastName" | "phone" | "address">> & { password?: string },
): Promise<Customer | null> {
  const db = getDb();
  return withTransaction(db, () => {
    const row = db.prepare("SELECT * FROM customers WHERE id = ?").get(id) as CustomerRow | undefined;
    if (!row) return null;
    const c = rowToCustomer(row);
    if (patch.firstName !== undefined) c.firstName = patch.firstName;
    if (patch.lastName !== undefined) c.lastName = patch.lastName;
    if (patch.phone !== undefined) c.phone = patch.phone;
    if (patch.address !== undefined) c.address = patch.address;
    if (patch.password) {
      c.salt = randomBytes(16).toString("hex");
      c.passwordHash = hashPassword(patch.password, c.salt);
    }
    c.updatedAt = new Date().toISOString();
    db.prepare(`UPDATE customers SET first_name = ?, last_name = ?, phone = ?, address = ?, password_hash = ?, salt = ?, updated_at = ? WHERE id = ?`).run(
      c.firstName,
      c.lastName,
      c.phone,
      c.address,
      c.passwordHash,
      c.salt,
      c.updatedAt,
      id,
    );
    return c;
  });
}

export async function getOrdersForCustomer(customer: Pick<Customer, "id" | "email">): Promise<Order[]> {
  const rows = getDb()
    .prepare(`SELECT * FROM orders WHERE customer_id = ? OR LOWER(TRIM(email)) = ? ${ORDER_ORDER}`)
    .all(customer.id, customer.email.toLowerCase()) as unknown as OrderRow[];
  return hydrateOrders(rows);
}

// ---------- Pages & posts ----------

export async function getPageBySlug(slug: string): Promise<StaticPage | null> {
  return (getDb().prepare("SELECT slug, title, content, date FROM pages WHERE slug = ?").get(slug) as StaticPage | undefined) ?? null;
}

export async function getPosts(): Promise<BlogPost[]> {
  return getDb().prepare("SELECT slug, title, content, excerpt, date FROM posts ORDER BY date DESC").all() as unknown as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return (getDb().prepare("SELECT slug, title, content, excerpt, date FROM posts WHERE slug = ?").get(slug) as BlogPost | undefined) ?? null;
}

// ---------- Stats / health ----------

export async function getStats() {
  const db = getDb();
  const one = <T>(sql: string) => db.prepare(sql).get() as T;
  return {
    customers: one<{ n: number }>("SELECT COUNT(*) AS n FROM customers").n,
    products: one<{ n: number }>("SELECT COUNT(*) AS n FROM products").n,
    published: one<{ n: number }>("SELECT COUNT(*) AS n FROM products WHERE status = 'publish'").n,
    outOfStock: one<{ n: number }>("SELECT COUNT(*) AS n FROM products WHERE stock_status = 'outofstock'").n,
    orders: one<{ n: number }>("SELECT COUNT(*) AS n FROM orders").n,
    pending: one<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'").n,
    revenue: one<{ n: number | null }>("SELECT SUM(total) AS n FROM orders WHERE status != 'cancelled'").n ?? 0,
    schema: getSchemaInfo(db),
  };
}
