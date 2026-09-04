"use client";

import type { ReactNode } from "react";

interface ConfirmSubmitProps {
  message: string;
  className?: string;
  children: ReactNode;
}

/** Submit button that asks for confirmation before submitting its form. */
export function ConfirmSubmit({ message, className, children }: ConfirmSubmitProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
