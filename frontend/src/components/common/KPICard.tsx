import React from "react";
import clsx from "clsx";
import {
  AlertTriangle,
  Users,
  Truck,
  CheckCircle2,
  Clock,
  Brain,
  Target,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

export function GlassCard({ children, className, onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={clsx("glass-card rounded-xl", onClick && "cursor-pointer hover:border-white/15", className)}>
      {children}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: "High" | "Medium" | "Low" }) {
  const styles = {
    High: "bg-emergency-red/15 text-emergency-red border-emergency-red/30",
    Medium: "bg-emergency-amber/15 text-emergency-amber border-emergency-amber/30",
    Low: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  };
  return <span className={clsx("rounded-full border px-2 py-0.5 text-[10px] font-semibold", styles[severity])}>{severity}</span>;
}

export type MetricIcon =
  | "alert"
  | "users"
  | "truck"
  | "check"
  | "clock"
  | "brain"
  | "target"
  | "shield";

const METRIC_ICONS: Record<MetricIcon, LucideIcon> = {
  alert: AlertTriangle,
  users: Users,
  truck: Truck,
  check: CheckCircle2,
  clock: Clock,
  brain: Brain,
  target: Target,
  shield: ShieldAlert,
};

const THEME_ICON: Record<string, string> = {
  red: "kpi-neuro-icon--red",
  orange: "kpi-neuro-icon--orange",
  blue: "kpi-neuro-icon--blue",
  green: "kpi-neuro-icon--green",
  purple: "kpi-neuro-icon--purple",
};

const THEME_DEFAULT_ICON: Record<string, MetricIcon> = {
  red: "alert",
  orange: "users",
  blue: "truck",
  green: "check",
  purple: "clock",
};

const THEME_CARD: Record<string, string> = {
  red: "kpi-neuro-card--red",
  orange: "kpi-neuro-card--orange",
  blue: "kpi-neuro-card--blue",
  green: "kpi-neuro-card--green",
  purple: "kpi-neuro-card--purple",
};

const THEME_ACCENT: Record<string, string> = {
  red: "kpi-neuro-accent--red",
  orange: "kpi-neuro-accent--orange",
  blue: "kpi-neuro-accent--blue",
  green: "kpi-neuro-accent--green",
  purple: "kpi-neuro-accent--purple",
};

const THEME_BAR: Record<string, string> = {
  red: "kpi-neuro-bar-fill--red",
  orange: "kpi-neuro-bar-fill--orange",
  blue: "kpi-neuro-bar-fill--blue",
  green: "kpi-neuro-bar-fill--green",
  purple: "kpi-neuro-bar-fill--purple",
};

function getBarPct(label: string, value: string | number): number {
  if (typeof value === "string" && value.includes("%")) {
    return Math.min(100, parseInt(value, 10) || 0);
  }
  if (typeof value === "number") {
    if (label.toLowerCase().includes("people")) return Math.min(100, (value / 2000) * 100);
    if (label.toLowerCase().includes("active")) return Math.min(100, (value / 50) * 100);
    if (label.toLowerCase().includes("resolved")) return Math.min(100, (value / 30) * 100);
  }
  if (label.toLowerCase().includes("response")) return 72;
  return 60;
}

export function MetricCard({
  label,
  value,
  indicator,
  up,
  badge,
  theme = "blue",
  format,
  icon,
  trendGood,
}: {
  label: string;
  value: string | number;
  indicator?: string;
  up?: boolean;
  badge?: string;
  theme?: string;
  format?: string;
  icon?: MetricIcon;
  trendGood?: boolean;
}) {
  const Icon = METRIC_ICONS[icon ?? THEME_DEFAULT_ICON[theme] ?? "alert"];
  const iconTheme = THEME_ICON[theme] ?? THEME_ICON.blue;
  const cardTheme = THEME_CARD[theme] ?? THEME_CARD.blue;
  const accentTheme = THEME_ACCENT[theme] ?? THEME_ACCENT.blue;
  const barTheme = THEME_BAR[theme] ?? THEME_BAR.blue;
  const display = format === "number" && typeof value === "number" ? value.toLocaleString() : value;
  const barPct = getBarPct(label, value);

  const isPositiveTrend = trendGood ? up === false : up === true;
  const TrendIcon = up === undefined ? null : up ? TrendingUp : TrendingDown;

  return (
    <div className={clsx("kpi-neuro-card group", cardTheme)}>
      <span className={clsx("kpi-neuro-accent", accentTheme)} aria-hidden />

      <div className="flex items-start gap-3.5">
        <div className={clsx("kpi-neuro-icon kpi-neuro-icon--lg", iconTheme)} aria-hidden>
          <Icon strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="kpi-neuro-label">{label}</p>
          <p className={clsx("kpi-neuro-value", `kpi-neuro-value--${theme}`)}>{display}</p>
        </div>
      </div>

      <div className="mt-3 flex min-h-[22px] items-center pl-[calc(3.25rem+0.875rem)]">
        {indicator && (
          <div
            className={clsx(
              "flex items-center gap-1.5 text-xs font-semibold",
              isPositiveTrend ? "kpi-neuro-trend--up" : "kpi-neuro-trend--down"
            )}
          >
            {TrendIcon && <TrendIcon className="h-4 w-4 shrink-0" strokeWidth={2.5} />}
            <span>{indicator.replace(/^[↑↓]\s*/, "")}</span>
          </div>
        )}

        {badge && <span className={clsx("kpi-neuro-badge", `kpi-neuro-badge--${theme}`)}>{badge}</span>}
      </div>

      <div className="kpi-neuro-bar pl-[calc(3.25rem+0.875rem)]">
        <div className="kpi-neuro-bar-track">
          <div
            className={clsx("kpi-neuro-bar-fill", barTheme)}
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function PriorityBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    critical: "bg-emergency-red/15 text-emergency-red border-emergency-red/30",
    high: "bg-emergency-red/15 text-emergency-red border-emergency-red/30",
    medium: "bg-emergency-amber/15 text-emergency-amber border-emergency-amber/30",
    low: "bg-emergency-emerald/15 text-emergency-emerald border-emergency-emerald/30",
  };
  return <span className={clsx("rounded-full border px-2 py-0.5 text-xs font-medium capitalize", styles[level] ?? "bg-slate-800 text-slate-300")}>{level}</span>;
}
