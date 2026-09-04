import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  href?: string;
  /** Render the 2px rules above and below the heading (default true). */
  rules?: boolean;
  /** Render the empty 24px paragraph spacer that precedes the product grid (default true). */
  spacer?: boolean;
  className?: string;
}

function Rule() {
  return <hr className="my-5 h-px border-0 border-t border-lien-hr-border bg-lien-hr" />;
}

export function SectionHeading({ title, href, rules = true, spacer = true, className }: SectionHeadingProps) {
  return (
    <div className={cn(className)}>
      {rules ? <Rule /> : null}
      <h2 className="my-[21.58px] text-center font-oswald text-[26px] font-light leading-[36.4px] text-lien-heading">
        {href ? (
          <Link href={href} className="text-lien-muted transition-none hover:text-lien-blue">
            {title}
          </Link>
        ) : (
          title
        )}
      </h2>
      {rules ? <Rule /> : null}
      {spacer ? <p className="mb-4 h-6" aria-hidden="true" /> : null}
    </div>
  );
}
