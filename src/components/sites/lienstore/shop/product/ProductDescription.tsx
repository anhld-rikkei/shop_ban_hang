import { Fa, type FaName } from "@/components/sites/lienstore/shared/icons";
import { structureDescription, type SectionKey } from "@/lib/description";
import { cn } from "@/lib/utils";

const ICONS: Record<SectionKey, FaName> = {
  info: "info-circle",
  benefits: "check-circle",
  ingredients: "list",
  usage: "hand-o-right",
  audience: "user",
  notes: "exclamation-circle",
  other: "angle-right",
};

const FACT_ICONS: Record<string, FaName> = {
  "Xuất xứ": "map-marker",
  "Thương hiệu": "tag",
  "Nhà sản xuất": "building",
  "Quy cách": "cube",
  "Hạn sử dụng": "clock-o",
  "Đối tượng": "user",
};

interface Props {
  name: string;
  description: string;
  className?: string;
}

/**
 * Structured product description: quick facts, an anchor menu and one card per topic
 * (Công dụng / Thành phần / Hướng dẫn sử dụng / Lưu ý…). Falls back to the raw HTML when the text has no
 * recognisable sections.
 */
export function ProductDescription({ name, description, className }: Props) {
  const d = structureDescription(description, name);
  if (!d.structured) {
    return <div className={cn("lien-prose", className)} dangerouslySetInnerHTML={{ __html: description }} />;
  }
  const withIntro = d.introHtml.trim().length > 0;
  return (
    <div className={cn("product-description", className)}>
      {d.facts.length ? (
        <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {d.facts.map((f) => (
            <div key={f.label} className="rounded-md border border-lien-widget-border bg-lien-blue-soft/60 px-3 py-2">
              <dt className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-lien-muted">
                <Fa name={FACT_ICONS[f.label] ?? "info-circle"} className="text-lien-blue" />
                {f.label}
              </dt>
              <dd className="mt-0.5 text-[15px] leading-6 text-lien-heading">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {d.sections.length > 1 ? (
        <nav aria-label="Mục lục mô tả" className="mb-5 flex flex-wrap gap-2">
          {d.sections.map((s, i) => (
            <a
              key={`${s.key}-${i}`}
              href={`#mo-ta-${s.key}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-lien-blue/30 px-3 py-1 text-[13px] leading-5 text-lien-blue no-underline hover:bg-lien-blue hover:text-white"
            >
              <Fa name={ICONS[s.key]} />
              {s.title}
            </a>
          ))}
        </nav>
      ) : null}

      {withIntro ? <div className="lien-prose mb-6" dangerouslySetInnerHTML={{ __html: d.introHtml }} /> : null}

      <div className="grid gap-4">
        {d.sections.map((s, i) => (
          <section key={`${s.key}-${i}`} id={`mo-ta-${s.key}-${i}`} className="scroll-mt-24 rounded-md border border-lien-widget-border bg-white">
            <h3 className="m-0 flex items-center gap-2 border-b border-lien-widget-border bg-lien-blue-soft/50 px-4 py-2.5 font-oswald text-[18px] font-medium uppercase tracking-[1px] text-lien-heading">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-lien-blue text-[13px] text-white">
                <Fa name={ICONS[s.key]} />
              </span>
              {s.title}
            </h3>
            <div className="lien-prose product-description__body px-4 py-3" dangerouslySetInnerHTML={{ __html: s.html }} />
          </section>
        ))}
      </div>
    </div>
  );
}
