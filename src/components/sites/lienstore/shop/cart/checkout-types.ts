/** Result of the `placeOrder` server action (null = untouched). On success the action redirects. */
export type CheckoutState = {
  error: string;
  /** Per-field validation messages keyed by input name (first_name, last_name, address, phone, email). */
  fields?: Record<string, string>;
} | null;
