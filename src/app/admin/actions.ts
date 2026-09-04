"use server";

import { redirect } from "next/navigation";
import { endSession, startSession, verifyCredentials } from "@/lib/auth";

export type LoginState = { error: string } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!verifyCredentials(user, password)) {
    return { error: "Sai tên đăng nhập hoặc mật khẩu." };
  }
  await startSession();
  redirect("/admin/");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login/");
}
