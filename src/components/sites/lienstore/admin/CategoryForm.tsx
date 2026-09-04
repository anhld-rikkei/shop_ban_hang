"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deleteCategoryAction, saveCategoryAction, type CategoryFormState } from "@/app/admin/categories/actions";
import { cn } from "@/lib/utils";
import type { ShopCategory } from "@/types/shop";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { adminInput, adminLabel, btnDanger, btnPrimary, btnSecondary, Card, Flash } from "./ui";

interface CategoryFormProps {
  category?: ShopCategory;
  /** Existing image paths the admin can pick from (product thumbnails). */
  suggestions?: string[];
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-[12px] leading-4 text-red-600">{msg}</p> : null;
}

export function CategoryForm({ category, suggestions = [] }: CategoryFormProps) {
  const [state, action, pending] = useActionState<CategoryFormState, FormData>(saveCategoryAction, null);
  const [image, setImage] = useState(category?.image ?? "");
  const fields = state?.fields ?? {};

  return (
    <>
      {state?.error ? <Flash kind="error">{state.error}</Flash> : null}
      <form action={action} className="grid gap-6 lg:grid-cols-3">
        {category ? <input type="hidden" name="originalSlug" value={category.slug} /> : null}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Thông tin danh mục">
            <div className="grid gap-4">
              <div>
                <label className={adminLabel} htmlFor="name">
                  Tên danh mục *
                </label>
                <input id="name" name="name" defaultValue={category?.name} required className={cn(adminInput, fields.name && "border-red-500")} />
                <FieldError msg={fields.name} />
              </div>
              <div>
                <label className={adminLabel} htmlFor="slug">
                  Đường dẫn (slug)
                </label>
                <input id="slug" name="slug" defaultValue={category?.slug} placeholder="Để trống để tạo tự động từ tên" className={cn(adminInput, fields.slug && "border-red-500")} />
                <FieldError msg={fields.slug} />
                <p className="mt-1 text-[12px] text-lien-muted">Trang danh mục: /product-category/&lt;slug&gt;/ — đổi slug sẽ tự cập nhật cho mọi sản phẩm thuộc danh mục.</p>
              </div>
              <div>
                <label className={adminLabel} htmlFor="description">
                  Mô tả (HTML, hiển thị dưới tiêu đề trang danh mục)
                </label>
                <textarea id="description" name="description" rows={5} defaultValue={category?.description} className={adminInput} />
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Ảnh danh mục (lưới trang chủ)">
            <label className={adminLabel} htmlFor="image">
              Đường dẫn ảnh (/sites/… hoặc https://…)
            </label>
            <input id="image" name="image" value={image} onChange={(e) => setImage(e.target.value)} className={cn(adminInput, "font-mono text-[13px]", fields.image && "border-red-500")} />
            <FieldError msg={fields.image} />
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="mt-3 h-40 w-40 rounded border border-[#e5e7eb] object-cover" />
            ) : (
              <p className="mt-3 text-[12px] text-lien-muted">Chưa có ảnh: trang chủ sẽ dùng ảnh sản phẩm đầu tiên trong danh mục.</p>
            )}
            {suggestions.length ? (
              <div className="mt-4">
                <p className="mb-2 text-[12px] font-semibold uppercase text-[#6b7280]">Chọn nhanh từ ảnh sản phẩm</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 12).map((src) => (
                    <button key={src} type="button" onClick={() => setImage(src)} className={cn("rounded border p-0.5", image === src ? "border-lien-blue" : "border-[#e5e7eb] hover:border-lien-blue")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-12 w-12 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Đang lưu…" : category ? "Lưu thay đổi" : "Tạo danh mục"}
            </button>
            <Link href="/admin/categories/" className={btnSecondary}>
              Huỷ
            </Link>
          </div>
        </div>
      </form>
      {category ? (
        <form action={deleteCategoryAction} className="mt-8 border-t border-[#e5e7eb] pt-6">
          <input type="hidden" name="slug" value={category.slug} />
          <ConfirmSubmit
            message={`Xoá danh mục “${category.name}”? ${category.count} sản phẩm sẽ bị gỡ khỏi danh mục này (không xoá sản phẩm).`}
            className={btnDanger}
          >
            Xoá danh mục
          </ConfirmSubmit>
        </form>
      ) : null}
    </>
  );
}
