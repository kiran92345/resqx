import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

export function UserPageHeader({
  title,
  subtitle,
  backTo = "/user",
  backLabel = "Back to Home",
  className,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className={clsx("mb-6", className)}>
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="group mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:border-accent-cyan/40 hover:bg-accent-cyan/10 hover:text-accent-cyan"
      >
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
        {backLabel}
      </button>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
    </div>
  );
}

/** Route → page title for header breadcrumb */
export const USER_PAGE_TITLES: Record<string, string> = {
  "/user/track": "Live Tracking",
  "/user/alerts": "My Alerts",
  "/user/status": "Emergency Status",
  "/user/history": "My History",
  "/user/hospitals": "Hospitals",
  "/user/nearby": "Emergency Services",
  "/user/voice": "Voice Emergency",
  "/user/weather": "Local Weather",
  "/user/settings": "Settings",
};
