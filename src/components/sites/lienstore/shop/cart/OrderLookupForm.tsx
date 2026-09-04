"use client";

import { useActionState } from "react";
import { lookupOrder, type LookupState } from "@/app/my-account/actions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderSummary, PAYMENT_LABEL, STATUS_LABEL } from "./OrderDetails";
import { Required, WooHeading, WooNotice, wooButtonClass, wooInputClass } from "./WooUi";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-[#f8dda7] text-[#94660c]",
  processing: "bg-[#c6e1c6] text-[#5b841b]",
  completed: "bg-[#c8d7e1] text-[#2e4453]",
  cancelled: "bg-[#e5e5e5] text-[#777777]",
};

/** Order lookup by order number + phone (`/my-account/`). */
export function OrderLookupForm() {
  const [state, action, pending] = useActionState<LookupState, FormData>(lookupOrder, null);

  return (
    <div className="woocommerce">
      <WooHeading as="h2">Tra cứu đơn hàng</WooHeading>
      <p className="mb-4 text-lien-muted">Nhập mã đơn hàng và số điện thoại bạn đã dùng khi đặt hàng để xem tình trạng đơn.</p>
      {state?.error ? <WooNotice kind="error">{state.error}</WooNotice> : null}
      <form action={action} className="mb-8 flex flex-wrap items-end gap-3">
        <p className="form-row m-0 w-full sm:w-[200px]">
          <label htmlFor="lookup_number" className="mb-2 block text-[16px] font-semibold leading-8 text-lien-input-text">
            Mã đơn hàng <Required />
          </label>
          <input id="lookup_number" name="number" type="text" inputMode="numeric" placeholder="1001" required className={wooInputClass} />
        </p>
        <p className="form-row m-0 w-full sm:w-[240px]">
          <label htmlFor="lookup_phone" className="mb-2 block text-[16px] font-semibold leading-8 text-lien-input-text">
            Số điện thoại <Required />
          </label>
          <input id="lookup_phone" name="phone" type="tel" required className={wooInputClass} />
        </p>
        <p className="form-row m-0">
          <button type="submit" disabled={pending} className={cn(wooButtonClass, "h-[42px] font-arial")}>
            {pending ? "Đang tra cứu…" : "Tra cứu"}
          </button>
        </p>
      </form>

      {state?.order ? (
        <section className="mb-8">
          <WooNotice kind="message">
            Đơn hàng <strong>#{state.order.number}</strong> đặt ngày {formatDateTime(state.order.createdAt)} — trạng thái:{" "}
            <span className={cn("inline-block rounded px-2 py-0.5 text-[14px] font-bold", STATUS_COLOR[state.order.status])}>
              {STATUS_LABEL[state.order.status]}
            </span>{" "}
            · {PAYMENT_LABEL[state.order.paymentMethod]}
          </WooNotice>
          <OrderSummary order={state.order} />
        </section>
      ) : null}
    </div>
  );
}
