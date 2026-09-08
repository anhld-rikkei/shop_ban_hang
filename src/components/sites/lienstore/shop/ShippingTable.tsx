import { Fa } from "@/components/sites/lienstore/shared/icons";
import { formatAmount } from "@/lib/format";
import type { ShippingMethod } from "@/types/shop";

interface Props {
  methods: ShippingMethod[];
  notes: string[];
  /** Compact = inside the product tabs (smaller heading). */
  compact?: boolean;
}

const th = "border border-lien-line bg-lien-footer2 px-3 py-2.5 text-center text-[13px] font-bold text-lien-heading";
const td = "border border-lien-line px-3 py-2.5 text-center text-[13px] leading-5 text-lien-text";

function Fee({ amount, unit, currency, freeOver, plus }: { amount: number; unit: string; currency: string; freeOver: number | null; plus?: boolean }) {
  return (
    <>
      <span className="font-semibold text-lien-heading">
        {plus ? "+" : ""}
        {formatAmount(amount)}
        {currency}
        {unit}
      </span>
      {freeOver ? (
        <span className="block text-[12px] text-lien-sale-text">
          Miễn phí trên {formatAmount(freeOver)}
          {currency}
        </span>
      ) : null}
    </>
  );
}

/**
 * Shipping fee tables (one per method, sesofoods style): columns = zones, rows = base fee, optional surcharge,
 * areas, delivery time. Followed by the admin-editable notes list.
 */
export function ShippingTable({ methods, notes, compact = false }: Props) {
  if (methods.length === 0 && notes.length === 0) {
    return <p className="m-0 text-[14px] text-lien-muted">Chưa có thông tin vận chuyển. Vui lòng liên hệ Zalo 0964 839 769 để được báo phí.</p>;
  }
  return (
    <div className="space-y-8">
      {methods.map((m) => {
        const zones = m.zones;
        const hasExtra = m.extraLabel && zones.some((z) => z.extraFee !== null);
        return (
          <section key={m.id} aria-labelledby={`ship-${m.id}`}>
            <h3 id={`ship-${m.id}`} className={compact ? "m-0 mb-1 text-[15px] font-bold text-lien-blue" : "m-0 mb-1 text-[18px] font-bold text-lien-blue"}>
              <Fa name="truck" className="mr-2" />
              {m.name}
            </h3>
            {m.description ? <p className="m-0 mb-3 text-[13px] leading-5 text-lien-muted">{m.description}</p> : null}
            {zones.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr>
                      <th className={th}>Thông tin</th>
                      {zones.map((z) => (
                        <th key={z.id} className={th}>
                          {z.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className={`${th} text-left`}>Phí thường</th>
                      {zones.map((z) => (
                        <td key={z.id} className={td}>
                          <Fee amount={z.fee} unit={z.unit} currency={m.currency} freeOver={z.freeOver} />
                        </td>
                      ))}
                    </tr>
                    {hasExtra ? (
                      <tr>
                        <th className={`${th} text-left`}>{m.extraLabel}</th>
                        {zones.map((z) => (
                          <td key={z.id} className={td}>
                            {z.extraFee !== null ? <Fee amount={z.extraFee} unit={z.unit} currency={m.currency} freeOver={z.extraFreeOver} plus /> : "-"}
                          </td>
                        ))}
                      </tr>
                    ) : null}
                    <tr>
                      <th className={`${th} text-left`}>Khu vực</th>
                      {zones.map((z) => (
                        <td key={z.id} className={td}>
                          {z.areas || "-"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th className={`${th} text-left`}>Thời gian</th>
                      {zones.map((z) => (
                        <td key={z.id} className={td}>
                          {z.eta || "-"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="m-0 text-[13px] text-lien-muted">Chưa có khu vực nào cho phương thức này.</p>
            )}
          </section>
        );
      })}
      {notes.length ? (
        <section aria-labelledby="ship-notes">
          <h3 id="ship-notes" className="m-0 mb-2 text-[15px] font-bold text-lien-success">
            Lưu ý về vận chuyển
          </h3>
          <ul className="m-0 list-disc space-y-1 pl-5 text-[13px] leading-5 text-lien-text">
            {notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
