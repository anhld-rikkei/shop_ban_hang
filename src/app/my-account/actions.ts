"use server";

import { redirect } from "next/navigation";
import { endCustomerSession, getCurrentCustomer, startCustomerSession } from "@/lib/customer-auth";
import { createCustomer, findCustomerByEmail, findOrder, updateCustomer, verifyCustomer } from "@/lib/db";
import type { Order } from "@/types/shop";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LookupState = { order?: Order; error?: string } | null;

export async function lookupOrder(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const numberRaw = String(formData.get("number") ?? "").replace(/[^\d]/g, "");
  const phone = String(formData.get("phone") ?? "").trim();
  if (!numberRaw) return { error: "Vui lòng nhập mã đơn hàng." };
  if (phone.replace(/\D/g, "").length < 9) return { error: "Vui lòng nhập số điện thoại đã dùng khi đặt hàng." };
  const order = await findOrder(Number.parseInt(numberRaw, 10), phone);
  if (!order) return { error: `Không tìm thấy đơn hàng #${numberRaw} với số điện thoại này.` };
  return { order };
}

export type AccountFormState = { error?: string; message?: string } | null;

export async function customerLogin(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("rememberme") === "on";
  if (!username || !password) return { error: "Lỗi: Tên tài khoản và mật khẩu là bắt buộc." };
  const customer = await verifyCustomer(username, password);
  if (!customer) return { error: "Lỗi: Tên tài khoản hoặc mật khẩu không đúng. Quên mật khẩu?" };
  await startCustomerSession(customer.id, remember);
  redirect("/my-account/");
}

export async function customerRegister(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_RE.test(email)) return { error: "Lỗi: Vui lòng cung cấp một địa chỉ email hợp lệ." };
  if (password.length < 6) return { error: "Lỗi: Mật khẩu phải có ít nhất 6 ký tự." };
  if (await findCustomerByEmail(email)) return { error: "Lỗi: Một tài khoản đã được đăng ký với địa chỉ email của bạn. Vui lòng đăng nhập." };
  const customer = await createCustomer({ email, password });
  await startCustomerSession(customer.id, true);
  redirect("/my-account/");
}

export async function customerLogout(): Promise<void> {
  await endCustomerSession();
  redirect("/my-account/");
}

export async function lostPassword(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const login = String(formData.get("user_login") ?? "").trim();
  if (!login) return { error: "Vui lòng nhập tên tài khoản hoặc địa chỉ email." };
  // No mail transport in this clone: always answer the same way so accounts cannot be enumerated.
  return { message: "Nếu tài khoản tồn tại, một email đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp thư (kể cả mục spam)." };
}

export async function updateAccountDetails(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const me = await getCurrentCustomer();
  if (!me) redirect("/my-account/");
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const firstName = get("account_first_name");
  const lastName = get("account_last_name");
  const phone = get("account_phone");
  const address = get("account_address");
  const current = String(formData.get("password_current") ?? "");
  const pw1 = String(formData.get("password_1") ?? "");
  const pw2 = String(formData.get("password_2") ?? "");
  if (!firstName || !lastName) return { error: "Tên và Họ là trường bắt buộc." };
  let password: string | undefined;
  if (pw1 || pw2 || current) {
    if (!current) return { error: "Vui lòng nhập mật khẩu hiện tại." };
    if (!(await verifyCustomer(me.email, current))) return { error: "Mật khẩu hiện tại không đúng." };
    if (pw1.length < 6) return { error: "Mật khẩu mới phải có ít nhất 6 ký tự." };
    if (pw1 !== pw2) return { error: "Mật khẩu mới không khớp." };
    password = pw1;
  }
  await updateCustomer(me.id, { firstName, lastName, phone, address, password });
  return { message: "Chi tiết tài khoản đã được thay đổi thành công." };
}
