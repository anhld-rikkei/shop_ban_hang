import Image from "next/image";
import Link from "next/link";
import { deleteProductAction } from "@/app/admin/products/actions";
import { ConfirmSubmit } from "@/components/sites/lienstore/admin/ConfirmSubmit";
import { adminInput, btnPrimary, Card, Flash, PageHeader, ProductStatusBadge, tableClass, tdClass, thClass } from "@/components/sites/lienstore/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts, getCategories } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminProducts({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = first(sp.q).trim().toLowerCase();
  const status = first(sp.status);
  const category = first(sp.category);
  const stock = first(sp.stock);
  const saved = first(sp.saved);
  const deleted = first(sp.deleted);

  const [all, categories] = await Promise.all([getAllProducts(true), getCategories()]);
  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const items = all
    .filter((p) => !q || `${p.name} ${p.slug} ${p.sku ?? ""}`.toLowerCase().includes(q))
    .filter((p) => !status || p.status === status)
    .filter((p) => !category || p.categories.includes(category))
    .filter((p) => !stock || (stock === "out" ? p.stockStatus === "outofstock" : p.stockStatus === "instock"))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <PageHeader
        title="Sản phẩm"
        subtitle={`${items.length} / ${all.length} sản phẩm`}
        actions={
          <Link href="/admin/products/new/" className={btnPrimary}>
            + Thêm sản phẩm
          </Link>
        }
      />
      {saved ? <Flash>Đã lưu sản phẩm #{saved}.</Flash> : null}
      {deleted ? <Flash>Đã xoá sản phẩm.</Flash> : null}

      <Card>
        <form method="get" className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_160px_140px_auto]">
          <input name="q" defaultValue={first(sp.q)} placeholder="Tìm theo tên, slug, SKU…" className={adminInput} />
          <select name="category" defaultValue={category} className={adminInput}>
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={status} className={adminInput}>
            <option value="">Mọi trạng thái</option>
            <option value="publish">Đang bán</option>
            <option value="draft">Bản nháp</option>
          </select>
          <select name="stock" defaultValue={stock} className={adminInput}>
            <option value="">Mọi tồn kho</option>
            <option value="in">Còn hàng</option>
            <option value="out">Hết hàng</option>
          </select>
          <button type="submit" className={btnPrimary}>
            Lọc
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass} />
                <th className={thClass}>Tên</th>
                <th className={thClass}>Danh mục</th>
                <th className={thClass}>Giá</th>
                <th className={thClass}>Tồn kho</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}>Cập nhật</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`${tdClass} text-center text-lien-muted`}>
                    Không có sản phẩm phù hợp.
                  </td>
                </tr>
              ) : null}
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-[#fafafa]">
                  <td className={`${tdClass} w-16`}>
                    {p.thumb ? <Image src={p.thumb} alt="" width={48} height={48} className="h-12 w-12 rounded border border-[#e5e7eb] object-cover" unoptimized /> : null}
                  </td>
                  <td className={tdClass}>
                    <Link href={`/admin/products/${p.id}/`} className="font-semibold text-lien-heading hover:text-lien-blue">
                      {p.name}
                    </Link>
                    <div className="text-[12px] text-lien-muted">
                      #{p.id} · {p.slug}
                    </div>
                  </td>
                  <td className={`${tdClass} max-w-[220px] text-[13px]`}>{p.categories.map((c) => catName[c] ?? c).join(", ")}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>{formatPrice(p.price, p.currency)}</td>
                  <td className={tdClass}>{p.stock === null ? "—" : p.stock}</td>
                  <td className={tdClass}>
                    <ProductStatusBadge status={p.status} outOfStock={p.stockStatus === "outofstock"} />
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-[13px] text-lien-muted`}>{formatDate(p.updatedAt)}</td>
                  <td className={`${tdClass} whitespace-nowrap text-right`}>
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.id}/`} className="text-lien-blue hover:underline">
                        Sửa
                      </Link>
                      <a href={`/product/${p.slug}/`} target="_blank" rel="noreferrer" className="text-lien-muted hover:underline">
                        Xem
                      </a>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmSubmit message={`Xoá vĩnh viễn “${p.name}”?`} className="text-lien-heart hover:underline">
                          Xoá
                        </ConfirmSubmit>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
