import type { CSSProperties } from "react";
import type { SocialKind } from "@/types/lienstore";
import { cn } from "@/lib/utils";
import { Fa } from "./icons";

/** Brand colours used for the round social buttons in the footer. */
export const SOCIAL_COLORS: Record<SocialKind, string> = {
  facebook: "#3b5998",
  zalo: "#0068ff",
  messenger: "#0084ff",
  instagram: "#e1306c",
  tiktok: "#010101",
  youtube: "#ff0000",
};

interface IconProps {
  className?: string;
  style?: CSSProperties;
}

/** Zalo wordmark (no glyph in FontAwesome 4.7). */
export function ZaloIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 48 24" aria-hidden="true" className={cn("inline-block h-[1em] w-[2em] fill-current align-middle", className)} style={style}>
      <text x="24" y="19" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="21" letterSpacing="-0.5">
        Zalo
      </text>
    </svg>
  );
}

/** Facebook Messenger bubble. */
export function MessengerIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("inline-block h-[1em] w-[1em] fill-current align-middle", className)} style={style}>
      <path d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.43 6.52 3.77 8.61V24l3.45-1.9c.92.26 1.9.4 2.78.4 6.76 0 12-4.95 12-11.64S18.76 0 12 0zm1.2 15.66l-3.06-3.26-5.97 3.26 6.56-6.97 3.13 3.26 5.9-3.26-6.56 6.97z" />
    </svg>
  );
}

/** TikTok note. */
export function TikTokIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("inline-block h-[1em] w-[1em] fill-current align-middle", className)} style={style}>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/** One icon for every supported social network (FontAwesome where available, inline SVG otherwise). */
export function SocialIcon({ kind, className, style }: IconProps & { kind: SocialKind }) {
  switch (kind) {
    case "zalo":
      return <ZaloIcon className={className} style={style} />;
    case "messenger":
      return <MessengerIcon className={className} style={style} />;
    case "tiktok":
      return <TikTokIcon className={className} style={style} />;
    case "instagram":
      return <Fa name="instagram" className={className} style={style} />;
    case "youtube":
      return <Fa name="youtube-play" className={className} style={style} />;
    default:
      return <Fa name="facebook" className={className} style={style} />;
  }
}
