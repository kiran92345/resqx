import React from "react";
import { NavLink } from "react-router-dom";
import { Home, MapPin, Bell, Mic, Menu } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { to: "/user", label: "Home", icon: Home, end: true },
  { to: "/user/track", label: "Track", icon: MapPin },
  { to: "/user/voice", label: "Voice", icon: Mic, accent: true },
  { to: "/user/alerts", label: "Alerts", icon: Bell },
];

export function UserMobileNav({
  onMenuClick,
  menuOpen,
}: {
  onMenuClick: () => void;
  menuOpen?: boolean;
}) {
  return (
    <nav className="app-mobile-nav lg:hidden" aria-label="Quick navigation">
      {TABS.map(({ to, label, icon: Icon, end, accent }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              "app-mobile-nav__item",
              accent && "app-mobile-nav__item--accent",
              isActive && "app-mobile-nav__item--active"
            )
          }
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onMenuClick}
        className={clsx("app-mobile-nav__item", menuOpen && "app-mobile-nav__item--active")}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
        <span>More</span>
      </button>
    </nav>
  );
}
