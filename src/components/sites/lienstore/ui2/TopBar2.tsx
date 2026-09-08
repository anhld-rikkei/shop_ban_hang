import Link from "next/link";
import type { ContactInfo } from "@/types/lienstore";
import { SocialIcon } from "@/components/sites/lienstore/shared/BrandIcons";
import { Fa } from "@/components/sites/lienstore/shared/icons";

/** Slim cream utility bar: hotlines + email on the left, register call-to-action in the middle, socials on the right. */
export function TopBar2({ contact }: { contact: ContactInfo }) {
  return (
    <div className="hidden border-b border-lien-line bg-lien-cream text-[13px] leading-5 text-lien-text md:block">
      <div className="mx-auto flex h-10 max-w-[1300px] items-center gap-6 px-4">
        <ul className="m-0 flex list-none items-center gap-5 p-0">
          {contact.phones.map((p) => (
            <li key={p.label} className="flex items-center gap-1.5 whitespace-nowrap">
              <Fa name="phone" className="text-lien-muted" />
              <span>
                Hotline {p.label}:{" "}
                {p.href ? (
                  <a href={p.href} className="font-medium text-lien-text no-underline hover:text-lien-blue">
                    {p.number}
                  </a>
                ) : (
                  <span className="text-lien-muted">{p.number}</span>
                )}
              </span>
            </li>
          ))}
          <li className="hidden items-center gap-1.5 lg:flex">
            <Fa name="envelope" className="text-lien-muted" />
            <a href={`mailto:${contact.email}`} className="text-lien-text no-underline hover:text-lien-blue">
              {contact.email}
            </a>
          </li>
        </ul>
        <div className="mx-auto flex items-center gap-2">
          <Link
            href="/my-account/"
            className="rounded-[3px] bg-lien-amber px-2.5 py-0.5 text-[12px] font-semibold uppercase tracking-wide text-lien-heading no-underline hover:brightness-95"
          >
            Đăng kí tài khoản
          </Link>
          <span className="hidden text-lien-muted lg:inline">ngay để nhận ưu đãi thành viên</span>
          <Fa name="gift" className="hidden text-lien-muted lg:inline" />
        </div>
        <ul className="m-0 flex list-none items-center gap-3 p-0">
          {contact.socials.map((s) => (
            <li key={s.kind}>
              <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label} className="text-lien-text no-underline hover:text-lien-blue">
                <SocialIcon kind={s.kind} className="text-[15px]" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
