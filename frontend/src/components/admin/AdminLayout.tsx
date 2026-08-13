import React from "react";
import clsx from "clsx";
import { AdminSidebar } from "./AdminSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useMobileNav } from "../../hooks/useMobileNav";

export function AdminLayout({
  children,
  connected,
}: {
  children: React.ReactNode;
  connected?: boolean;
}) {
  const nav = useMobileNav();

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-[var(--app-bg)]">
      <div
        className={clsx("app-nav-backdrop", nav.open && "app-nav-backdrop--visible")}
        onClick={nav.close}
        aria-hidden={!nav.open}
      />

      <AdminSidebar open={nav.open} onNavigate={nav.close} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader connected={connected} onMenuClick={nav.toggle} menuOpen={nav.open} />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
