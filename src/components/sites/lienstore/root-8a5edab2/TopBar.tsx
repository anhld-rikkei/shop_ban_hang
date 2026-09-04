import type { ContactInfo } from "@/types/lienstore";
import { SocialIcon } from "@/components/sites/lienstore/shared/BrandIcons";
import { Fa } from "@/components/sites/lienstore/shared/icons";
import { cn } from "@/lib/utils";

interface TopBarProps {
  contact: ContactInfo;
  className?: string;
}

const iconClass = "inline-block align-[-1px] text-[15px] leading-[15px]";

/** `.mini-header`: phones, email, address, opening hours on the left; social icons on the right. Hidden below 768px. */
export function TopBar({ contact, className }: TopBarProps) {
  return (
    <div
      className={cn(
        "relative hidden min-h-[33px] border-b border-lien-line py-0.5 text-[15px] leading-[22.5px] sm:block",
        className,
      )}
    >
      <div className="mx-auto flex min-h-7 max-w-[1200px] items-center px-[15px]">
        <div className="relative w-3/4 px-[15px]">
          <ul className="inline text-lien-topbar">
            <li className="inline">
              <Fa name="phone" className={cn(iconClass, "ml-[7px]")} />
              {contact.phones.map((p, i) => (
                <span key={p.label} className={cn("ml-[7px]", i > 0 && "before:mr-[7px] before:text-lien-muted before:content-['|']")}>
                  <span className="font-semibold">{p.label}:</span>{" "}
                  {p.href ? (
                    <a href={p.href} className="text-lien-topbar hover:text-lien-blue">
                      {p.number}
                    </a>
                  ) : (
                    <span className="text-lien-muted">{p.number}</span>
                  )}
                </span>
              ))}
            </li>
            <li className="ml-[7px] inline">
              <Fa name="envelope" className={iconClass} />
              <a href={`mailto:${contact.email}`} className="text-lien-topbar hover:text-lien-blue">
                <span className="ml-[7px]">{contact.email}</span>
              </a>
            </li>
            <li className="ml-[7px] inline">
              <Fa name="map-marker" className={iconClass} />
              <span className="ml-[7px]">{contact.address}</span>
            </li>
            <li className="ml-[7px] inline">
              <Fa name="clock-o" className={iconClass} />
              <span className="ml-[7px]">{contact.hours}</span>
            </li>
          </ul>
        </div>
        <div className="relative w-1/4 px-[15px]">
          <ul className="relative float-right m-0 flex list-none items-center p-0 text-[12px] leading-[18px]">
            {contact.socials.map((s) => (
              <li key={s.kind} className="relative">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="mx-px inline-flex h-7 min-w-7 items-center justify-center rounded-[25px] px-1 text-center text-lien-topbar transition-all duration-300 ease-in-out hover:text-lien-blue"
                >
                  <SocialIcon kind={s.kind} className="text-[18px] leading-[26px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
