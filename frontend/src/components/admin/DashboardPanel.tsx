import React from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "../common/KPICard";

export type PanelIconTheme = "red" | "blue" | "green" | "orange" | "purple" | "cyan";

export function DashboardPanel({
  icon: Icon,
  iconTheme = "blue",
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  flushBody = false,
  headerBorder = true,
}: {
  icon?: LucideIcon;
  iconTheme?: PanelIconTheme;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  flushBody?: boolean;
  headerBorder?: boolean;
}) {
  return (
    <GlassCard className={clsx("dashboard-panel flex h-full flex-col overflow-hidden", className)}>
      <div
        className={clsx(
          "dashboard-panel__header flex items-center gap-3 px-4 py-3.5",
          headerBorder && "border-b border-[var(--border-subtle)]"
        )}
      >
        {Icon && (
          <div className={clsx("dashboard-panel__icon", `dashboard-panel__icon--${iconTheme}`)}>
            <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="dashboard-panel__title truncate">{title}</h3>
          {subtitle && <p className="dashboard-panel__subtitle truncate">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div
        className={clsx(
          "dashboard-panel__body flex flex-1 flex-col",
          !flushBody && "p-4",
          bodyClassName
        )}
      >
        {children}
      </div>
    </GlassCard>
  );
}

/** Consistent select styling for dashboard panels */
export function DashboardSelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={clsx("dashboard-select", className)}
    >
      {children}
    </select>
  );
}

/** Live status pill */
export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <span className="dashboard-live-badge">
      <span className="dashboard-live-dot" />
      {label}
    </span>
  );
}
