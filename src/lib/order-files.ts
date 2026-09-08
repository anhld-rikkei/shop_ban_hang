import "server-only";
import type { OrderReceiptLink } from "@/components/sites/lienstore/shop/cart/OrderDetails";
import { getOrderFiles } from "./db";
import { FILES_URL_PREFIX, orderFileToken } from "./uploads";

/** Public-facing links (signed) for the receipts attached to an order. */
export async function receiptLinksFor(orderId: string): Promise<OrderReceiptLink[]> {
  const files = await getOrderFiles(orderId);
  if (files.length === 0) return [];
  const token = orderFileToken(orderId);
  return files.map((f) => ({ name: f.fileName, url: `${FILES_URL_PREFIX}${f.path}?t=${token}`, note: f.note, amountJpy: f.amountJpy, createdAt: f.createdAt }));
}
