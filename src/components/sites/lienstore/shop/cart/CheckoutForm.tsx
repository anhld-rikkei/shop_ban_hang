"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { placeOrder } from "@/app/checkout/actions";
import { useCart } from "@/components/sites/lienstore/shop/CartProvider";
import { cn } from "@/lib/utils";
import type { CheckoutState } from "./checkout-types";
import { Price, Required, shopTableClass, shopTdClass, shopThClass, WooHeading, WooNotice, wooButtonClass, wooInputClass } from "./WooUi";

export interface CheckoutDefaults {
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface FieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  half?: boolean;
  defaultValue?: string;
}

function Field({ name, label, type = "text", placeholder, autoComplete, error, half, defaultValue }: FieldProps) {
  const id = `billing_${name}`;
  return (
    <p className={cn("form-row mb-1.5 p-[3px]", half ? "w-full sm:w-[47%]" : "w-full")}>
      <label htmlFor={id} className="mb-2 block text-[16px] font-semibold leading-8 text-lien-input-text">
        {label} <Required />
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        className={cn(wooInputClass, error && "border-[#b81c23]")}
      />
      {error ? <span className="mt-1 block text-[14px] leading-5 text-[#b81c23]">{error}</span> : null}
    </p>
  );
}

/** WooCommerce checkout (`/checkout/`): billing fields, order review, payment methods, place order. */
export function CheckoutForm({ defaults = {}, loggedIn = false }: { defaults?: CheckoutDefaults; loggedIn?: boolean }) {
  const { items, hydrated, subtotal } = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, null);
  const [payment, setPayment] = useState<"bacs" | "cod">("bacs");
  const [createAccount, setCreateAccount] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!hydrated) return <div className="min-h-[240px]" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="woocommerce">
        <WooNotice kind="info">Giỏ hàng của bạn hiện đang trống.</WooNotice>
        <p>
          <Link href="/shop/" className={wooButtonClass}>
            Quay trở lại cửa hàng
          </Link>
        </p>
      </div>
    );
  }

  const fields = state?.fields ?? {};

  return (
    <div className="woocommerce">
      {!loggedIn ? (
        <WooNotice kind="info">
          Bạn đã có tài khoản?{" "}
          <Link href="/my-account/" className="text-lien-muted underline hover:text-lien-blue">
            Ấn vào đây để đăng nhập
          </Link>
        </WooNotice>
      ) : null}
      <WooNotice kind="info">
        Bạn có mã ưu đãi?{" "}
        <button type="button" onClick={() => setShowCoupon((v) => !v)} className="text-lien-muted underline hover:text-lien-blue">
          Ấn vào đây để nhập mã
        </button>
      </WooNotice>
      {showCoupon ? (
        <form
          className="checkout_coupon mb-8 rounded-[5px] border border-[#d3ced2] p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const code = String(new FormData(e.currentTarget).get("coupon_code") ?? "").trim();
            setCouponError(code ? `Mã ưu đãi “${code}” không tồn tại!` : "Vui lòng nhập mã ưu đãi.");
          }}
        >
          <p className="mb-3 text-lien-muted">Nếu bạn có mã ưu đãi, vui lòng nhập vào bên dưới.</p>
          <div className="flex flex-wrap items-center gap-2">
            <input name="coupon_code" placeholder="Mã ưu đãi" className={cn(wooInputClass, "w-[200px]")} />
            <button type="submit" className={cn(wooButtonClass, "font-arial")}>
              Áp dụng
            </button>
          </div>
          {couponError ? <p className="mt-3 text-[#b81c23]">{couponError}</p> : null}
        </form>
      ) : null}

      {state?.error ? (
        <WooNotice kind="error">
          {state.error}
          {Object.keys(fields).length ? (
            <ul className="mt-2 list-disc pl-5">
              {Object.values(fields).map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          ) : null}
        </WooNotice>
      ) : null}

      <form action={action} className="checkout woocommerce-checkout" noValidate>
        <input type="hidden" name="items" value={JSON.stringify(items)} readOnly />

        <div id="customer_details" className="col2-set sm:flex sm:justify-between">
          <div className="col-1 w-full sm:w-[48%]">
            <div className="woocommerce-billing-fields">
              <WooHeading as="h3">Thông tin thanh toán</WooHeading>
              <div className="flex flex-wrap justify-between">
                <Field name="first_name" label="Tên" autoComplete="given-name" error={fields.first_name} half defaultValue={defaults.firstName} />
                <Field name="last_name" label="Họ" autoComplete="family-name" error={fields.last_name} half defaultValue={defaults.lastName} />
                <Field name="address" label="Địa chỉ" placeholder="Địa chỉ" autoComplete="street-address" error={fields.address} defaultValue={defaults.address} />
                <Field name="phone" label="Số điện thoại" type="tel" autoComplete="tel" error={fields.phone} defaultValue={defaults.phone} />
                <Field name="email" label="Địa chỉ email" type="email" autoComplete="email" error={fields.email} defaultValue={defaults.email} />
              </div>
            </div>
            {!loggedIn ? (
              <div className="woocommerce-account-fields mt-2">
                <p className="form-row form-row-wide create-account mb-1.5 p-[3px]">
                  <label className="inline-flex items-center gap-2 text-[16px] font-semibold leading-8 text-lien-input-text">
                    <input type="checkbox" name="createaccount" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} className="h-4 w-4" />
                    Tạo tài khoản mới?
                  </label>
                </p>
                {createAccount ? (
                  <p className="form-row mb-1.5 p-[3px]">
                    <label htmlFor="account_password" className="mb-2 block text-[16px] font-semibold leading-8 text-lien-input-text">
                      Tạo mật khẩu <Required />
                    </label>
                    <input
                      id="account_password"
                      name="account_password"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      className={cn(wooInputClass, fields.account_password && "border-[#b81c23]")}
                    />
                    {fields.account_password ? <span className="mt-1 block text-[14px] leading-5 text-[#b81c23]">{fields.account_password}</span> : null}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="col-2 w-full sm:w-[48%]">
            <div className="woocommerce-additional-fields">
              <WooHeading as="h3">Thông tin bổ sung</WooHeading>
              <p className="form-row notes mb-1.5 p-[3px]">
                <label htmlFor="order_comments" className="mb-2 block text-[16px] font-semibold leading-8 text-lien-input-text">
                  Ghi chú đơn hàng <span className="optional font-semibold">(tuỳ chọn)</span>
                </label>
                <textarea
                  id="order_comments"
                  name="note"
                  rows={2}
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  className={cn(wooInputClass, "h-16 resize-y font-mono leading-6")}
                />
              </p>
            </div>
          </div>
        </div>

        <WooHeading as="h3" className="mt-6">
          Đơn hàng của bạn
        </WooHeading>
        <div id="order_review" className="woocommerce-checkout-review-order">
          <table className={cn(shopTableClass, "woocommerce-checkout-review-order-table")}>
            <thead>
              <tr>
                <th className={shopThClass} scope="col">
                  Sản phẩm
                </th>
                <th className={shopThClass} scope="col">
                  Tạm tính
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.productId} className="cart_item">
                  <td className={shopTdClass}>
                    {it.name} <strong className="product-quantity whitespace-nowrap">× {it.quantity}</strong>
                  </td>
                  <td className={shopTdClass}>
                    <Price value={it.price * it.quantity} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="cart-subtotal">
                <th className={cn(shopTdClass, "font-bold")} scope="row">
                  Tạm tính
                </th>
                <td className={cn(shopTdClass, "font-bold")}>
                  <Price value={subtotal} />
                </td>
              </tr>
              <tr className="order-total">
                <th className={cn(shopTdClass, "font-bold")} scope="row">
                  Tổng
                </th>
                <td className={cn(shopTdClass, "font-bold")}>
                  <Price value={subtotal} />
                </td>
              </tr>
            </tfoot>
          </table>

          <div id="payment" className="woocommerce-checkout-payment rounded-[5px] bg-lien-blue-soft">
            <ul className="wc_payment_methods payment_methods methods m-0 list-none border-b border-[#d3ced2] p-4 text-left">
              <li className="wc_payment_method leading-8">
                <input
                  id="payment_method_bacs"
                  type="radio"
                  name="payment_method"
                  value="bacs"
                  checked={payment === "bacs"}
                  onChange={() => setPayment("bacs")}
                  className="mr-4 inline-block h-[13px] w-[13px] align-middle"
                />
                <label htmlFor="payment_method_bacs" className="mb-2 inline text-[16px] leading-8 text-lien-input-text">
                  Chuyển khoản ngân hàng
                </label>
                {payment === "bacs" ? (
                  <div className="payment_box my-[14.72px] rounded-[2px] bg-white p-[14.72px] text-[14.72px] leading-[22.08px] text-[#515151]">
                    <p className="m-0">
                      Thực hiện thanh toán vào ngay tài khoản ngân hàng của chúng tôi. Vui lòng sử dụng Mã đơn hàng của bạn trong phần Nội dung thanh toán. Đơn
                      hàng sẽ được giao sau khi tiền đã chuyển.
                    </p>
                  </div>
                ) : null}
              </li>
              <li className="wc_payment_method leading-8">
                <input
                  id="payment_method_cod"
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  className="mr-4 inline-block h-[13px] w-[13px] align-middle"
                />
                <label htmlFor="payment_method_cod" className="mb-2 inline text-[16px] leading-8 text-lien-input-text">
                  Thanh toán khi nhận hàng
                </label>
                {payment === "cod" ? (
                  <div className="payment_box my-[14.72px] rounded-[2px] bg-white p-[14.72px] text-[14.72px] leading-[22.08px] text-[#515151]">
                    <p className="m-0">Trả tiền mặt khi giao hàng.</p>
                  </div>
                ) : null}
              </li>
            </ul>
            <div className="form-row place-order mb-1.5 flow-root p-4">
              <p className="mb-4 text-[16px] leading-6">
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described
                in our{" "}
                <Link href="/privacy-policy/" className="text-lien-muted hover:text-lien-blue">
                  chính sách riêng tư
                </Link>
                .
              </p>
              <button type="submit" disabled={pending} className={cn(wooButtonClass, "float-right font-arial")} id="place_order">
                {pending ? "Đang xử lý…" : "Đặt hàng"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
