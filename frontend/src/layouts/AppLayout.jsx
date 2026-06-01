import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { cn } from "@/utils/cn";

// Inline SVGs keep us off an icon dependency (not in the approved stack).
function Icon({ path }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {path}
    </svg>
  );
}

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" /> },
  { to: "/products", label: "Products", icon: <path d="m21 16-9 5-9-5V8l9-5 9 5v8ZM3.3 7 12 12l8.7-5M12 22V12" /> },
  { to: "/customers", label: "Customers", icon: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /> },
  { to: "/orders", label: "Orders", icon: <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0" /> },
  { to: "/sales", label: "Sales", icon: <path d="M9 14 4 9l1.5-1.5L9 11l9.5-9.5L20 3 9 14ZM20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" /> },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
            )
          }
        >
          <Icon path={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-neutral-200 bg-white px-4 py-6 md:flex">
        <Brand />
        <div className="mt-8">{navLinks}</div>
        <p className="mt-auto px-3 text-xs text-neutral-400">Orderly v1.0</p>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
        <Brand />
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100"
        >
          <Icon path={<path d="M3 6h18M3 12h18M3 18h18" />} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white px-4 py-6 shadow-xl animate-slide-up">
            <Brand />
            <div className="mt-8">{navLinks}</div>
          </div>
        </div>
      )}

      {/* Routed page content */}
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">
        O
      </span>
      <span className="text-lg font-semibold tracking-tight">Orderly</span>
    </div>
  );
}
