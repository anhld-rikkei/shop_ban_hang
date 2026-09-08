import type { Metadata } from "next";
import { CheckoutForm } from "@/components/sites/lienstore/shop/cart/CheckoutForm";
import { StoreSidebar } from "@/components/sites/lienstore/shop/cart/StoreSidebar";
import { SiteChrome, TwoColumnShell } from "@/components/sites/lienstore/shop/SiteChrome";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thanh toán – LienStore" };

export default async function Checkout() {
  const customer = await getCurrentCustomer();
  return (
    <SiteChrome>
      <TwoColumnShell sidebar={<StoreSidebar />} title="Thanh toán">
        <article className="entry-content">
          <CheckoutForm
            loggedIn={!!customer}
            defaults={
              customer
                ? { firstName: customer.firstName, lastName: customer.lastName, address: customer.address, phone: customer.phone, email: customer.email }
                : undefined
            }
          />
        </article>
      </TwoColumnShell>
    </SiteChrome>
  );
}
