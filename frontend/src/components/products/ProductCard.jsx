import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";

import { ProductImage } from "./ProductImage";

export function ProductCard({ product, onEdit, onDelete, onSelect, onOrder }) {
  const handleClick = (e) => {
    // If user clicked a button inside the card, don't trigger selection
    if (e.target.closest("button")) return;
    if (onSelect) onSelect(product);
  };

  return (
    <div
      onClick={handleClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    >
      <div className="relative aspect-square bg-neutral-50">
        <ProductImage
          src={product.image_url}
          name={product.name}
          alt={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.on_sale && (
          <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
            <Badge variant="dark">-{Number(product.discount_percent)}%</Badge>
          </span>
        )}
        {product.is_low_stock && (
          <span className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3">
            <Badge variant="warning">Low stock</Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Desktop-only metadata */}
        <div className="hidden sm:flex items-center justify-between gap-2">
          <Badge variant="neutral">{product.category}</Badge>
          <span className="font-mono text-xs text-neutral-400">{product.sku}</span>
        </div>

        <h3 className="mt-1 sm:mt-2 truncate font-medium text-neutral-900 text-sm sm:text-base" title={product.name}>
          {product.name}
        </h3>

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

        {/* Desktop-only stock */}
        <p className="hidden sm:block mt-1 text-xs text-neutral-400">{product.quantity} in stock</p>

        {/* Action area: 'Order' button on mobile, Edit/Delete on desktop */}
        <div className="mt-3 sm:mt-4">
          {/* Mobile Order Button */}
          <div className="block sm:hidden">
            <Button
              size="sm"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
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
