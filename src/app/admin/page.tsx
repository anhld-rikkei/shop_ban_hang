import Link from "next/link";
import { Card, PageHeader, StatusBadge, tableClass, tdClass, thClass } from "@/components/sites/lienstore/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getOrders, getStats } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const [stats, orders] = await Promise.all([getStats(), getOrders()]);
  const recent = orders.slice(0, 8);

  const tiles = [
    { label: "Sản phẩm", value: stats.products, href: "/admin/products/" },
    { label: "Đang bán", value: stats.published, href: "/admin/products/?status=publish" },
    { label: "Hết hàng", value: stats.outOfStock, href: "/admin/products/?stock=out" },
    { label: "Đơn hàng", value: stats.orders, href: "/admin/orders/" },
    { label: "Chờ xử lý", value: stats.pending, href: "/admin/orders/?status=pending" },
    { label: "Doanh thu", value: formatPrice(stats.revenue), href: "/admin/orders/" },
    { label: "Khách hàng", value: stats.customers, href: "/admin/orders/" },
  ];

  return (
    <>
      <PageHeader title="Tổng quan" subtitle="Tình hình cửa hàng hôm nay" />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-lg border border-[#e5e7eb] bg-white p-4 no-underline shadow-sm hover:border-lien-blue">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6b7280]">{t.label}</div>
            <div className="mt-1 font-oswald text-[26px] leading-8 text-lien-heading">{t.value}</div>
          </Link>
        ))}
      </div>
      <Card
        title="Đơn hàng gần đây"
        actions={
          <Link href="/admin/orders/" className="text-[14px] text-lien-blue hover:underline">
            Xem tất cả →
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="text-[14px] text-lien-muted">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Mã</th>
                  <th className={thClass}>Ngày</th>
                  <th className={thClass}>Khách hàng</th>
                  <th className={thClass}>Tổng</th>
                  <th className={thClass}>Trạng thái</th>
                  <th className={thClass} />
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-[#fafafa]">
                    <td className={`${tdClass} font-semibold`}>#{o.number}</td>
                    <td className={tdClass}>{formatDateTime(o.createdAt)}</td>
                    <td className={tdClass}>
                      {o.customer.lastName} {o.customer.firstName}
                      <div className="text-[12px] text-lien-muted">{o.customer.phone}</div>
                    </td>
                    <td className={tdClass}>{formatPrice(o.total, o.currency)}</td>
                    <td className={tdClass}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <Link href={`/admin/orders/${o.id}/`} className="text-lien-blue hover:underline">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
