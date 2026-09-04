"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deleteProductAction, saveProductAction, type ProductFormState } from "@/app/admin/products/actions";
import { cn } from "@/lib/utils";
import type { CatalogProduct, ShopCategory } from "@/types/shop";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { adminInput, adminLabel, btnDanger, btnPrimary, btnSecondary, Card, Flash } from "./ui";

interface ProductFormProps {
  product?: CatalogProduct;
  categories: ShopCategory[];
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-[12px] leading-4 text-red-600">{msg}</p> : null;
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProductAction, null);
  const [images, setImages] = useState((product?.images ?? []).join("\n"));
  const fields = state?.fields ?? {};
  const previews = images
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <>
      {state?.error ? <Flash kind="error">{state.error}</Flash> : null}
      <form action={action} className="grid gap-6 lg:grid-cols-3">
        {product ? <input type="hidden" name="id" value={product.id} /> : null}

        <div className="space-y-6 lg:col-span-2">
          <Card title="Thông tin cơ bản">
            <div className="grid gap-4">
              <div>
                <label className={adminLabel} htmlFor="name">
                  Tên sản phẩm *
                </label>
                <input id="name" name="name" defaultValue={product?.name} required className={cn(adminInput, fields.name && "border-red-500")} />
                <FieldError msg={fields.name} />
              </div>
              <div>
                <label className={adminLabel} htmlFor="slug">
                  Đường dẫn (slug)
                </label>
                <input id="slug" name="slug" defaultValue={product?.slug} placeholder="Để trống để tạo tự động từ tên" className={cn(adminInput, fields.slug && "border-red-500")} />
                <FieldError msg={fields.slug} />
              </div>
              <div>
                <label className={adminLabel} htmlFor="shortDescription">
                  Mô tả ngắn (HTML)
                </label>
                <textarea id="shortDescription" name="shortDescription" rows={3} defaultValue={product?.shortDescription} className={adminInput} />
              </div>
              <div>
                <label className={adminLabel} htmlFor="description">
                  Mô tả chi tiết (HTML)
                </label>
                <textarea id="description" name="description" rows={14} defaultValue={product?.description} className={cn(adminInput, "font-mono text-[13px]")} />
              </div>
            </div>
          </Card>

          <Card title="Hình ảnh">
            <label className={adminLabel} htmlFor="images">
              Danh sách ảnh — mỗi dòng một đường dẫn (/sites/… hoặc https://…). Ảnh đầu tiên là ảnh đại diện.
            </label>
            <textarea
              id="images"
              name="images"
              rows={5}
              value={images}
              onChange={(e) => setImages(e.target.value)}
              className={cn(adminInput, "font-mono text-[13px]", fields.images && "border-red-500")}
            />
            <FieldError msg={fields.images} />
            <input type="hidden" name="thumb" value={product?.thumb && (product.images[0] === product.thumb || previews.includes(product.thumb)) ? product.thumb : ""} readOnly />
            {previews.length ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" className="h-20 w-20 rounded border border-[#e5e7eb] object-cover" />
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Bán hàng">
            <div className="grid gap-4">
              <div>
                <label className={adminLabel} htmlFor="price">
                  Giá (VNĐ) *
                </label>
                <input id="price" name="price" inputMode="numeric" defaultValue={product?.price ?? ""} required className={cn(adminInput, fields.price && "border-red-500")} />
                <FieldError msg={fields.price} />
              </div>
              <div>
                <label className={adminLabel} htmlFor="regularPrice">
                  Giá gốc (nếu đang giảm giá)
                </label>
                <input id="regularPrice" name="regularPrice" inputMode="numeric" defaultValue={product?.regularPrice ?? ""} className={cn(adminInput, fields.regularPrice && "border-red-500")} />
                <FieldError msg={fields.regularPrice} />
              </div>
              <div>
                <label className={adminLabel} htmlFor="sku">
                  Mã SKU
                </label>
                <input id="sku" name="sku" defaultValue={product?.sku ?? ""} className={adminInput} />
              </div>
              <div>
                <label className={adminLabel} htmlFor="stock">
                  Tồn kho (để trống = không theo dõi)
                </label>
                <input id="stock" name="stock" inputMode="numeric" defaultValue={product?.stock ?? ""} className={cn(adminInput, fields.stock && "border-red-500")} />
                <FieldError msg={fields.stock} />
              </div>
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" name="out_of_stock" defaultChecked={product?.stockStatus === "outofstock"} className="h-4 w-4" />
                Đánh dấu hết hàng
              </label>
              <div>
                <label className={adminLabel} htmlFor="status">
                  Trạng thái
                </label>
                <select id="status" name="status" defaultValue={product?.status ?? "publish"} className={adminInput}>
                  <option value="publish">Đang bán</option>
                  <option value="draft">Bản nháp (ẩn)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title="Danh mục *">
            <div className={cn("grid max-h-72 gap-1.5 overflow-y-auto pr-1", fields.categories && "rounded border border-red-500 p-2")}>
              {categories.map((c) => (
                <label key={c.slug} className="flex items-start gap-2 text-[13px] leading-5">
                  <input type="checkbox" name="categories" value={c.slug} defaultChecked={product?.categories.includes(c.slug)} className="mt-0.5 h-4 w-4" />
                  <span>
                    {c.name} <span className="text-lien-muted">({c.count})</span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError msg={fields.categories} />
          </Card>

          <Card title="Từ khóa">
            <label className={adminLabel} htmlFor="tags">
              Cách nhau bằng dấu phẩy
            </label>
            <input id="tags" name="tags" defaultValue={product?.tags.join(", ")} className={adminInput} />
          </Card>

          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Đang lưu…" : product ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
            <Link href="/admin/products/" className={btnSecondary}>
              Huỷ
            </Link>
          </div>
        </div>
      </form>

      {product ? (
        <form action={deleteProductAction} className="mt-8 border-t border-[#e5e7eb] pt-6">
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmit message={`Xoá vĩnh viễn sản phẩm “${product.name}”?`} className={btnDanger}>
            Xoá sản phẩm
          </ConfirmSubmit>
        </form>
      ) : null}
    </>
  );
}
