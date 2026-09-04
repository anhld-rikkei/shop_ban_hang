import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { ADMIN_STATUS_LABELS, ADMIN_STATUSES, adminInput, btnPrimary, Card, Flash, PageHeader, StatusBadge, tableClass, tdClass, thClass } from "@/components/sites/lienstore/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getOrderById } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAYMENT: Record<string, string> = { bacs: "Chuyển khoản ngân hàng", cod: "Thanh toán khi nhận hàng" };

export default async function AdminOrderDetail({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const order = await getOrderById(id);
  if (!order) notFound();
  const c = order.customer;

  return (
    <>
      <PageHeader
        title={`Đơn hàng #${order.number}`}
        subtitle={`Đặt lúc ${formatDateTime(order.createdAt)} · cập nhật ${formatDateTime(order.updatedAt)}`}
        back={{ href: "/admin/orders/", label: "Đơn hàng" }}
        actions={<StatusBadge status={order.status} />}
      />
      {sp.updated ? <Flash>Đã cập nhật trạng thái đơn hàng.</Flash> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Sản phẩm">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass} />
                  <th className={thClass}>Sản phẩm</th>
                  <th className={thClass}>Đơn giá</th>
                  <th className={thClass}>SL</th>
                  <th className={`${thClass} text-right`}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.productId}>
                    <td className={`${tdClass} w-14`}>
                      {it.image ? <Image src={it.image} alt="" width={40} height={40} className="h-10 w-10 rounded border border-[#e5e7eb] object-cover" unoptimized /> : null}
                    </td>
                    <td className={tdClass}>
                      <Link href={`/product/${it.slug}/`} target="_blank" className="text-lien-heading hover:text-lien-blue">
                        {it.name}
                      </Link>
                      <div className="text-[12px] text-lien-muted">#{it.productId}</div>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatPrice(it.price, order.currency)}</td>
                    <td className={tdClass}>{it.quantity}</td>
                    <td className={`${tdClass} whitespace-nowrap text-right`}>{formatPrice(it.price * it.quantity, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className={`${tdClass} text-right font-semibold`}>
                    Tạm tính
                  </td>
                  <td className={`${tdClass} text-right`}>{formatPrice(order.subtotal, order.currency)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className={`${tdClass} text-right font-semibold`}>
                    Tổng
                  </td>
                  <td className={`${tdClass} text-right text-[16px] font-bold`}>{formatPrice(order.total, order.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Trạng thái">
            <form action={updateOrderStatusAction} className="grid gap-3">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className={adminInput}>
                {ADMIN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ADMIN_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className={btnPrimary}>
                Cập nhật
              </button>
            </form>
          </Card>
          <Card title="Khách hàng">
            <dl className="grid gap-2 text-[14px] leading-5">
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#6b7280]">Họ tên</dt>
                <dd>
                  {c.lastName} {c.firstName}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#6b7280]">Điện thoại</dt>
                <dd>
                  <a href={`tel:${c.phone}`} className="text-lien-blue hover:underline">
                    {c.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#6b7280]">Email</dt>
                <dd>
                  <a href={`mailto:${c.email}`} className="text-lien-blue hover:underline">
                    {c.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#6b7280]">Địa chỉ</dt>
                <dd>{c.address}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#6b7280]">Thanh toán</dt>
                <dd>{PAYMENT[order.paymentMethod]}</dd>
              </div>
              {c.note ? (
                <div>
                  <dt className="text-[12px] font-semibold uppercase text-[#6b7280]">Ghi chú</dt>
                  <dd className="whitespace-pre-wrap">{c.note}</dd>
                </div>
              ) : null}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
