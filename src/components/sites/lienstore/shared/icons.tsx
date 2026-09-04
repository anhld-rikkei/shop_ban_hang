import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * The original site renders every icon with the Font Awesome 4.7 icon font.
 * The exact font file is self-hosted under /sites/lienstore/shared/fonts
 * and exposed through the `font-fa` utility, so glyphs match pixel for pixel.
 */
const GLYPHS = {
  phone: "",
  envelope: "",
  "map-marker": "",
  "clock-o": "",
  facebook: "",
  search: "",
  heart: "",
  "shopping-bag": "",
  "align-left": "",
  bars: "",
  close: "",
  "user-circle": "",
  "arrow-up": "",
  "heart-o": "",
  "refresh": "",
  "check-circle": "",
  "trash": "",
  "pencil": "",
  "plus": "",
  "sign-out": "",
  "list": "",
  "shopping-cart": "",
  "user": "",
  "angle-right": "",
  "angle-left": "",
  "star": "",
  "star-o": "",
  "cog": "",
  "tachometer": "",
  "exclamation-circle": "",
  "arrow-left": "",
  "eye": "",
  "times": "",
  "minus": "",
  "info-circle": "",
  "instagram": "",
  "youtube-play": "",
} as const;

export type FaName = keyof typeof GLYPHS;

interface FaProps {
  name: FaName;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export function Fa({ name, className, style, label }: FaProps) {
  return (
    <span
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("font-fa inline-block not-italic leading-none antialiased", className)}
      style={style}
    >
      {GLYPHS[name]}
    </span>
  );
}
