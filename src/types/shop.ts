// Shop / commerce types for the linconnn.io.vn clone.

export type StockStatus = "instock" | "outofstock";

export interface CatalogProduct {
  id: number;
  slug: string;
  name: string;
  /** Price in VND (integer, e.g. 890000). */
  price: number;
  regularPrice: number | null;
  /** Purchase/cost price in VND used for profit reporting in admin; null = unknown. */
  costPrice: number | null;
  currency: string;
  sku: string | null;
  /** Units in stock; null = not tracked. */
  stock: number | null;
  stockStatus: StockStatus;
  /** Category slugs. */
  categories: string[];
  tags: string[];
  /** Full-size gallery image paths (local). */
  images: string[];
  /** 300×300 listing thumbnail path (local). */
  thumb: string;
  shortDescription: string;
  /** Sanitised HTML from the original product page. */
  description: string;
  /** Slugs of related products. */
  related: string[];
  rating: number | null;
  reviewCount: number;
  status: "publish" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface ShopCategory {
  slug: string;
  name: string;
  count: number;
  image: string | null;
  description: string;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export type PaymentMethod = "bacs" | "cod";

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  note: string;
}

export interface Customer {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  number: number;
  /** Set when the order was placed by a logged-in customer. */
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: string;
}

export interface StaticPage {
  slug: string;
  title: string;
  content: string;
  date: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
}

export interface Database {
  products: CatalogProduct[];
  categories: ShopCategory[];
  orders: Order[];
  customers: Customer[];
  pages: StaticPage[];
  posts: BlogPost[];
  meta: { nextOrderNumber: number; seededAt: string };
}

export type ProductOrderBy = "popularity" | "rating" | "date" | "price" | "price-desc";

export interface ProductQuery {
  category?: string;
  tag?: string;
  search?: string;
  orderby?: ProductOrderBy;
  page?: number;
  perPage?: number;
  includeDrafts?: boolean;
}

export interface ProductQueryResult {
  items: CatalogProduct[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
