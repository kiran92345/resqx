import React from "react";
import clsx from "clsx";
import resqxLogo from "../../assets/resqx-logo.png";

export function ShieldLogo({
  size = "md",
  showText = true,
  subtitle,
  className,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  /** e.g. "Admin Control Center" / "User Portal" */
  subtitle?: string;
  className?: string;
}) {
  const s = {
    sm: { img: "h-12 w-12", t1: "text-[10px]", t2: "text-[9px]", sub: "text-[10px]" },
    md: { img: "h-16 w-16", t1: "text-xs", t2: "text-[10px]", sub: "text-[11px]" },
    lg: { img: "h-24 w-24", t1: "text-base", t2: "text-sm", sub: "text-sm" },
  }[size];

  return (
    <div className={clsx("flex flex-col items-center gap-2 text-center", className)}>
      <div className={clsx("flex shrink-0 items-center justify-center", s.img)}>
        <img
          src={resqxLogo}
          alt="ResQ-X — AI Emergency Response"
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
      {showText && (
        <div>
          <p className={clsx("font-bold uppercase tracking-wider text-[var(--text-primary)]", s.t1)}>
            AI Emergency
          </p>
          <p className={clsx("font-semibold uppercase tracking-wide text-[var(--text-muted)]", s.t2)}>
            Response System
          </p>
          {subtitle && (
            <p className={clsx("mt-1.5 font-semibold uppercase tracking-wider text-accent-blue", s.sub)}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
