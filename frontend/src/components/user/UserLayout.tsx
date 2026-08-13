import React from "react";
import { UserSidebar } from "./UserSidebar";
import { UserHeader } from "./UserHeader";

export function UserLayout({ children, connected }: { children: React.ReactNode; connected?: boolean }) {
  return (
    <div className="flex min-h-screen bg-[var(--app-bg)]">
      <UserSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <UserHeader connected={connected} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
