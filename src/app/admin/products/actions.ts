"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { deleteProduct, getProductById, saveProduct, slugExists } from "@/lib/db";
import { slugify } from "@/lib/format";
import type { CatalogProduct } from "@/types/shop";

export type ProductFormState = { error?: string; fields?: Record<string, string> } | null;

function parseIntField(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

export async function saveProductAction(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  if (!(await isAdmin())) return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const fields: Record<string, string> = {};

  const idRaw = get("id");
  const id = idRaw ? Number.parseInt(idRaw, 10) : undefined;
  const existing = id ? await getProductById(id) : null;
  if (id && !existing) return { error: "Sản phẩm không tồn tại." };

  const name = get("name");
  if (!name) fields.name = "Tên sản phẩm là bắt buộc.";

  let slug = slugify(get("slug") || name);
  if (!slug) fields.slug = "Đường dẫn không hợp lệ.";
  else if (await slugExists(slug, id)) fields.slug = "Đường dẫn đã tồn tại, hãy chọn đường dẫn khác.";

  const price = parseIntField(get("price"));
  if (price === null || price < 0) fields.price = "Giá phải là số nguyên ≥ 0.";

  const regularRaw = get("regularPrice");
  const regularPrice = regularRaw ? parseIntField(regularRaw) : null;
  if (regularRaw && regularPrice === null) fields.regularPrice = "Giá gốc không hợp lệ.";

  const stockRaw = get("stock");
  const stock = stockRaw === "" ? null : parseIntField(stockRaw);
  if (stockRaw !== "" && (stock === null || stock < 0)) fields.stock = "Tồn kho phải là số nguyên ≥ 0 hoặc để trống.";

  const categories = formData.getAll("categories").map(String).filter(Boolean);
  if (categories.length === 0) fields.categories = "Chọn ít nhất một danh mục.";

  const images = get("images")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const thumb = get("thumb") || images[0] || "";
  if (!thumb) fields.images = "Cần ít nhất một ảnh (đường dẫn /sites/... hoặc https://...).";

  const tags = get("tags")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const status: CatalogProduct["status"] = get("status") === "draft" ? "draft" : "publish";
  const outOfStock = formData.get("out_of_stock") === "on" || stock === 0;

  if (Object.keys(fields).length > 0) return { error: "Vui lòng kiểm tra lại các trường được đánh dấu.", fields };

  slug = slug || `san-pham-${Date.now()}`;
  const saved = await saveProduct({
    id,
    slug,
    name,
    price: price ?? 0,
    regularPrice: regularPrice && regularPrice > (price ?? 0) ? regularPrice : null,
    currency: existing?.currency ?? "VNĐ",
    sku: get("sku") || null,
    stock,
    stockStatus: outOfStock ? "outofstock" : "instock",
    categories,
    tags,
    images: images.length ? images : [thumb],
    thumb,
    shortDescription: get("shortDescription"),
    description: get("description"),
    related: existing?.related ?? [],
    rating: existing?.rating ?? null,
    reviewCount: existing?.reviewCount ?? 0,
    status,
  });

  revalidatePath("/", "layout");
  redirect(`/admin/products/?saved=${saved.id}`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login/");
  const id = Number.parseInt(String(formData.get("id") ?? ""), 10);
  if (Number.isInteger(id)) {
    await deleteProduct(id);
    revalidatePath("/", "layout");
  }
  redirect("/admin/products/?deleted=1");
}
