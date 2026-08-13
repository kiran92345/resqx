import React from "react";
import clsx from "clsx";

export function GlassCard({ children, className, onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={clsx("glass-card rounded-xl", onClick && "cursor-pointer hover:border-white/15", className)}>
      {children}
    </div>
  );
}
