import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren, ReactNode } from "react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-label="Table tennis club platform">
      <span className="brand-mark__ball" aria-hidden="true" />
      {!compact && <span>TT Clubs</span>}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: PropsWithChildren<{ tone?: "neutral" | "good" | "warn" }>) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

export function Card({ children, className = "", ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return <article className={`card ${className}`.trim()} {...props}>{children}</article>;
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`.trim()} {...props} />;
}
