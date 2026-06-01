import { Link } from "react-router-dom";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency, formatCurrencyWhole } from "@/utils/currency";
import { formatDate } from "@/utils/date";

// Icon builder — keeps SVG inline to avoid a dependency.
function StatIcon({ path }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const STAT_CONFIG = [
  {
    label: "Total Products",
    key: "total_products",
    gradient: "from-blue-600 via-blue-700 to-indigo-800",
    icon: "m21 16-9 5-9-5V8l9-5 9 5v8ZM3.3 7 12 12l8.7-5M12 22V12",
  },
  {
    label: "Total Customers",
    key: "total_customers",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11",
  },
  {
    label: "Total Orders",
    key: "total_orders",
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    icon: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0",
  },
  {
    label: "Active Sales",
    key: "active_sales",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    icon: "M9 14 4 9l1.5-1.5L9 11l9.5-9.5L20 3 9 14ZM20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7",
  },
  {
    label: "Total Revenue",
    key: "total_revenue",
    format: true,
    gradient: "from-emerald-500 via-green-600 to-teal-700",
    // Indian rupee (₹) glyph — two top bars, the loop, and the diagonal leg.
    icon: "M6 3h12M6 8h12M6 13h3M9 13c6 0 6-10 0-10M6 13l8 8",
  },
];

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="animate-fade-in">
      {/* Welcome banner with gradient mesh */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-8 py-8">
        {/* Decorative gradient orbs */}
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-10 top-0 h-32 w-32 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-10 right-1/3 h-36 w-36 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-5 bottom-0 h-24 w-24 rounded-full bg-rose-500/15 blur-2xl" />

        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-2 max-w-lg text-neutral-400">
            A snapshot of your store at a glance. Track performance, monitor inventory, and stay on top of orders.
          </p>
        </div>
      </div>

      {/* Stat cards — each with a unique gradient */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {STAT_CONFIG.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={
              data
                ? stat.format
                  ? formatCurrencyWhole(data[stat.key])
                  : data[stat.key]
                : undefined
            }
            loading={isLoading}
            gradient={stat.gradient}
            icon={<StatIcon path={stat.icon} />}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:col-span-2">
          <header className="relative overflow-hidden border-b border-neutral-200 px-6 py-5">
            {/* Subtle gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-violet-50/50 to-transparent" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-neutral-900">Recent orders</h2>
              </div>
              <Link to="/orders" className="rounded-lg bg-neutral-900/5 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-900/10 hover:text-neutral-900">
                View all →
              </Link>
            </div>
          </header>

          {isLoading ? (
            <SkeletonList rows={4} />
          ) : data?.recent_orders?.length ? (
            <ul className="divide-y divide-neutral-100">
              {data.recent_orders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-50/80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {order.item_count} item{order.item_count === 1 ? "" : "s"} ·{" "}
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No orders yet" description="Orders will show up here once placed." />
          )}
        </section>

        {/* Low stock */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <header className="relative overflow-hidden border-b border-neutral-200 px-6 py-5">
            {/* Subtle gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-transparent" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-neutral-900">Low stock</h2>
              </div>
              <Link to="/products" className="rounded-lg bg-neutral-900/5 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-900/10 hover:text-neutral-900">
                Manage →
              </Link>
            </div>
          </header>

          {isLoading ? (
            <SkeletonList rows={4} />
          ) : data?.low_stock_products?.length ? (
            <ul className="divide-y divide-neutral-100">
              {data.low_stock_products.map((product) => (
                <li key={product.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-50/50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-400">{product.sku}</p>
                  </div>
                  <Badge variant="warning">{product.quantity} left</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="All stocked up" description="No products below their threshold." />
          )}
        </section>
      </div>
    </div>
  );
}

function SkeletonList({ rows }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="flex items-center justify-between px-6 py-4">
          <div className="space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="skeleton h-5 w-16" />
        </li>
      ))}
    </ul>
  );
}
