"use client";

import { useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export interface PriceFilterWidgetProps {
  title: string;
  min: number;
  max: number;
  currency: string;
  className?: string;
}

const STEP = 1000;

const rangeInputClass =
  "lien-range absolute left-0 top-1/2 m-0 w-full -translate-y-1/2";

const textInputClass = cn(
  "box-border h-[48px] w-[100px] max-w-[100px] rounded-[4px] border border-solid border-lien-input-border",
  "bg-white p-[11.2px] font-arial text-[16px] font-normal leading-[24px] text-lien-input-text outline-none",
);

/**
 * WooCommerce "Filter by price" widget: a 9px track with a purple progress
 * segment, two overlaid range thumbs and two read-only text boxes that mirror
 * the selected bounds. Purely visual - nothing is submitted.
 */
export function PriceFilterWidget({
  title,
  min,
  max,
  currency,
  className,
}: PriceFilterWidgetProps) {
  const [low, setLow] = useState(min);
  const [high, setHigh] = useState(max);

  const span = Math.max(max - min, 1);
  const minPct = ((low - min) / span) * 100;
  const maxPct = ((high - min) / span) * 100;

  const onLowChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setLow(Math.min(next, high));
  };

  const onHighChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setHigh(Math.max(next, low));
  };

  return (
    <div className={className}>
      <h3 className="mt-[22px] mb-[22px] font-oswald text-[22px] font-light leading-[30.8px] text-lien-heading">
        {title}
      </h3>

      <div className="relative my-[15px] h-[9px] w-full bg-lien-price-track shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
        <div
          className="absolute top-0 bottom-0 bg-lien-price-progress"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          aria-label="Giá thấp nhất"
          min={min}
          max={max}
          step={STEP}
          value={low}
          onChange={onLowChange}
          className={cn(rangeInputClass, "z-[21]")}
        />
        <input
          type="range"
          aria-label="Giá cao nhất"
          min={min}
          max={max}
          step={STEP}
          value={high}
          onChange={onHighChange}
          className={cn(rangeInputClass, "z-[20]")}
        />
      </div>

      <div className="mb-[20px] flex justify-between">
        <input
          type="text"
          readOnly
          aria-label="Giá thấp nhất"
          value={`${low}${currency}`}
          className={textInputClass}
        />
        <input
          type="text"
          readOnly
          aria-label="Giá cao nhất"
          value={`${high}${currency}`}
          className={textInputClass}
        />
      </div>
    </div>
  );
}
