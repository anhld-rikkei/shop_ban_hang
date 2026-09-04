import { redirect } from "next/navigation";
import { LoginForm } from "@/components/sites/lienstore/admin/LoginForm";
import { isAdmin, usingDefaultCredentials } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin/");
  return <LoginForm showDefaultHint={usingDefaultCredentials} />;
}
