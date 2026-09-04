import Link from "next/link";
import type { Order, OrderCustomer, OrderStatus, PaymentMethod } from "@/types/shop";
import { cn } from "@/lib/utils";
import { Price, shopTableClass, shopTdClass, shopThClass, WooHeading } from "./WooUi";

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  bacs: "Chuyển khoản ngân hàng",
  cod: "Thanh toán khi nhận hàng",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

/** WooCommerce `table.order_details`: product × qty / total, with Tạm tính / Phương thức thanh toán / Tổng footer. */
export function OrderDetailsTable({ order, className }: { order: Order; className?: string }) {
  return (
    <table className={cn(shopTableClass, "order_details", className)}>
      <thead>
        <tr>
          <th className={shopThClass} scope="col">
            Sản phẩm
          </th>
          <th className={shopThClass} scope="col">
            Tổng
          </th>
        </tr>
      </thead>
      <tbody>
        {order.items.map((it) => (
          <tr key={it.productId}>
            <td className={shopTdClass}>
              <Link href={`/product/${it.slug}/`} className="text-lien-muted no-underline hover:text-lien-blue">
                {it.name}
              </Link>{" "}
              <strong className="product-quantity whitespace-nowrap">× {it.quantity}</strong>
            </td>
            <td className={shopTdClass}>
              <Price value={it.price * it.quantity} currency={order.currency} />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th className={cn(shopTdClass, "font-bold")} scope="row">
            Tạm tính:
          </th>
          <td className={shopTdClass}>
            <Price value={order.subtotal} currency={order.currency} />
          </td>
        </tr>
        <tr>
          <th className={cn(shopTdClass, "font-bold")} scope="row">
            Phương thức thanh toán:
          </th>
          <td className={shopTdClass}>{PAYMENT_LABEL[order.paymentMethod]}</td>
        </tr>
        <tr>
          <th className={cn(shopTdClass, "font-bold")} scope="row">
            Tổng:
          </th>
          <td className={cn(shopTdClass, "font-bold")}>
            <Price value={order.total} currency={order.currency} />
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

/** `.woocommerce-customer-details address` billing block. */
export function OrderAddress({ customer, className }: { customer: OrderCustomer; className?: string }) {
  return (
    <address
      className={cn(
        "mb-0 w-full rounded-[5px] border border-r-2 border-b-2 border-solid border-black/10 px-3 py-1.5 text-left text-[16px] not-italic leading-6 text-lien-text",
        className,
      )}
    >
      {customer.firstName} {customer.lastName}
      <br />
      {customer.address}
      <br />
      <p className="woocommerce-customer-details--phone mt-2 mb-0 pl-6 before:-ml-6 before:mr-2 before:inline-block before:w-4 before:text-center before:font-fa before:text-[14px] before:text-[#767676] before:content-['\f095']">
        {customer.phone}
      </p>
      <p className="woocommerce-customer-details--email mb-0 pl-6 before:-ml-6 before:mr-2 before:inline-block before:w-4 before:text-center before:font-fa before:text-[14px] before:text-[#767676] before:content-['\f0e0']">
        {customer.email}
      </p>
      {customer.note ? (
        <p className="mt-2 mb-0 text-[14.72px] leading-[22.08px] text-lien-muted">
          <span className="font-bold text-lien-text">Ghi chú:</span> {customer.note}
        </p>
      ) : null}
    </address>
  );
}

/** "Chi tiết đơn hàng" + "Địa chỉ thanh toán" sections shared by the thank-you page and the order lookup. */
export function OrderSummary({ order }: { order: Order }) {
  return (
    <>
      <section className="woocommerce-order-details">
        <WooHeading as="h2" className="woocommerce-order-details__title">
          Chi tiết đơn hàng
        </WooHeading>
        <OrderDetailsTable order={order} />
      </section>
      <section className="woocommerce-customer-details">
        <WooHeading as="h2" className="woocommerce-column__title">
          Địa chỉ thanh toán
        </WooHeading>
        <OrderAddress customer={order.customer} />
      </section>
    </>
  );
}
