import React from "react";
import { UserSidebar } from "./UserSidebar";
import { UserHeader } from "./UserHeader";
import { UserMobileNav } from "./UserMobileNav";
import { useMobileNav } from "../../hooks/useMobileNav";

export function UserLayout({ children, connected }: { children: React.ReactNode; connected?: boolean }) {
  const nav = useMobileNav();

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-[var(--app-bg)]">
      <div
        className={`app-nav-backdrop${nav.open ? " app-nav-backdrop--visible" : ""}`}
        onClick={nav.close}
        aria-hidden={!nav.open}
      />

      <UserSidebar open={nav.open} onNavigate={nav.close} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <UserHeader connected={connected} onMenuClick={nav.toggle} menuOpen={nav.open} />
        <main className="app-main app-main--with-mobile-nav">{children}</main>
        <UserMobileNav onMenuClick={nav.toggle} menuOpen={nav.open} />
      </div>
    </div>
  );
}
