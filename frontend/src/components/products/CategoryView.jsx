import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "./ProductImage";
import { CATEGORY_META, PRODUCT_CATEGORIES, DEFAULT_CATEGORY_META } from "@/utils/constants";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

/**
 * Renders products grouped by category, each in a collapsible accordion section.
 * Supports custom categories dynamically discovered from products list.
 */
export function CategoryView({ products, onEdit, onDelete, onSelect, onOrder }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Group products by category dynamically to support custom categories
  const grouped = {};
  for (const product of products) {
    const cat = product.category || "Accessories";
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push(product);
  }

  // Sort categories: default ones first in their original order, then custom ones alphabetically
  const activeCategories = Object.keys(grouped).sort((a, b) => {
    const idxA = PRODUCT_CATEGORIES.indexOf(a);
    const idxB = PRODUCT_CATEGORIES.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  if (activeCategories.length === 0) return null;

  return (
    <div className="space-y-4">
      {activeCategories.map((category) => {
        const meta = CATEGORY_META[category] || DEFAULT_CATEGORY_META;
        const items = grouped[category];
        const isExpanded = expandedCategory === category;

        return (
          <section
            key={category}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200"
          >
            {/* Clickable Header/Tile (Accordion Trigger) */}
            <div
              onClick={() => toggleCategory(category)}
              className={cn(
                "relative bg-gradient-to-r px-6 py-5 cursor-pointer select-none transition-all duration-300",
                meta.gradient,
                isExpanded ? "shadow-md" : "hover:brightness-105"
              )}
            >
              {/* Decorative background circles */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-2 right-12 h-16 w-16 rounded-full bg-white/5" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={meta.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {category}
                    </h3>
                    <p className="text-sm text-white/70 hidden sm:block">{meta.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className="border border-white/20 bg-white/20 text-white backdrop-blur-sm">
                    {items.length} product{items.length !== 1 ? "s" : ""}
                  </Badge>
                  {/* Rotating Chevron */}
                  <svg
                    viewBox="0 0 24 24"
                    className={cn(
                      "h-5 w-5 text-white/80 transition-transform duration-300",
                      isExpanded ? "rotate-180" : ""
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Collapsible Container */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-neutral-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
              )}
            >
              <div className="overflow-hidden">
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
                    {items.map((product) => (
                      <CategoryProductCard
                        key={product.id}
                        product={product}
                        meta={meta}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onSelect={onSelect}
                        onOrder={onOrder}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** A compact mobile-responsive card variant that picks up the category's accent color. */
function CategoryProductCard({ product, meta, onEdit, onDelete, onSelect, onOrder }) {
  const handleClick = (e) => {
    if (e.target.closest("button")) return;
    if (onSelect) onSelect(product);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ring-offset-2 ring-transparent",
        meta.ringColor ? `hover:ring-2 ${meta.ringColor}` : "hover:ring-2 hover:ring-neutral-300"
      )}
    >
      <div className={`relative aspect-square bg-gradient-to-br ${meta.gradientLight}`}>
        <ProductImage
          src={product.image_url}
          name={product.name}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.on_sale && (
          <span className="absolute left-2.5 top-2.5">
            <Badge variant="dark">-{Number(product.discount_percent)}%</Badge>
          </span>
        )}
        {product.is_low_stock && (
          <span className="absolute right-2.5 top-2.5">
            <Badge variant="warning">Low stock</Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <div className="hidden sm:flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.bgAccent} ${meta.accentColor}`}>
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={meta.icon} />
            </svg>
            {product.category}
          </span>
          <span className="font-mono text-xs text-neutral-400">{product.sku}</span>
        </div>

        <h4 className="mt-1 sm:mt-2 truncate text-sm font-medium text-neutral-900" title={product.name}>
          {product.name}
        </h4>

        <div className="mt-1 flex items-baseline gap-1.5 sm:gap-2">
          {product.on_sale ? (
            <>
              <span className="font-semibold text-neutral-900 text-sm sm:text-base">
                {formatCurrency(product.effective_price)}
              </span>
              <span className="text-xs sm:text-sm text-neutral-400 line-through">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-neutral-900 text-sm sm:text-base">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        <p className="hidden sm:block mt-1 text-xs text-neutral-400">{product.quantity} in stock</p>

        <div className="mt-3">
          {/* Mobile Order Button */}
          <div className="block sm:hidden">
            <Button
              size="sm"
              className={cn(
                "w-full text-white font-medium text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform border-none",
                meta.gradient ? `bg-gradient-to-r ${meta.gradient}` : "bg-neutral-900 hover:bg-neutral-800"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (onOrder) onOrder(product);
              }}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              Order
            </Button>
          </div>

          {/* Desktop Edit/Delete buttons */}
          <div className="hidden sm:flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              title="Edit"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product);
              }}
              title="Delete"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
