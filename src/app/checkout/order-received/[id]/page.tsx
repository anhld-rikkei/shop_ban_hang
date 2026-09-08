import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClearCartOnMount } from "@/components/sites/lienstore/shop/cart/ClearCartOnMount";
import { OrderSummary, PAYMENT_LABEL } from "@/components/sites/lienstore/shop/cart/OrderDetails";
import { StoreSidebar } from "@/components/sites/lienstore/shop/cart/StoreSidebar";
import { Price, WooHeading } from "@/components/sites/lienstore/shop/cart/WooUi";
import { SiteChrome, TwoColumnShell } from "@/components/sites/lienstore/shop/SiteChrome";
import { getOrderById } from "@/lib/db";
import { receiptLinksFor } from "@/lib/order-files";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Đơn hàng đã nhận – LienStore" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderReceived({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  const receipts = await receiptLinksFor(order.id);

  const detail = "flex-1 basis-auto border-r border-dashed border-[#d3ced2] pr-6 mr-6 mb-4 text-[11.7px] uppercase leading-5 text-[#767676] last:mr-0 last:border-0";
  const value = "block text-[16px] normal-case leading-6 text-lien-text";

  return (
    <SiteChrome>
      <TwoColumnShell sidebar={<StoreSidebar />}>
        <article className="entry-content woocommerce">
          <ClearCartOnMount />
          <div className="woocommerce-order">
            <p className="woocommerce-thankyou-order-received mb-6 text-[18px] leading-7 text-lien-text">
              Cảm ơn bạn. Đơn hàng của bạn đã được nhận.
            </p>
            <ul className="order_details mb-8 flex list-none flex-wrap p-0">
              <li className={detail}>
                Mã đơn hàng: <strong className={value}>#{order.number}</strong>
              </li>
              <li className={detail}>
                Ngày: <strong className={value}>{formatDate(order.createdAt)}</strong>
              </li>
              <li className={detail}>
                Email: <strong className={value}>{order.customer.email}</strong>
              </li>
              <li className={detail}>
                Tổng cộng:{" "}
                <strong className={value}>
                  <Price value={order.total} currency={order.currency} />
                </strong>
              </li>
              <li className={detail}>
                Phương thức thanh toán: <strong className={value}>{PAYMENT_LABEL[order.paymentMethod]}</strong>
              </li>
            </ul>
            {order.paymentMethod === "bacs" ? (
              <section className="woocommerce-bacs-bank-details mb-8">
                <WooHeading as="h2">Chi tiết tài khoản ngân hàng của chúng tôi</WooHeading>
                <p className="text-lien-text">
                  Thông tin tài khoản ngân hàng sẽ được gửi tới email <strong>{order.customer.email}</strong>. Vui lòng ghi mã đơn hàng{" "}
                  <strong>#{order.number}</strong> trong nội dung chuyển khoản.
                </p>
              </section>
            ) : null}
            <OrderSummary order={order} receipts={receipts} />
          </div>
        </article>
      </TwoColumnShell>
    </SiteChrome>
  );
}
