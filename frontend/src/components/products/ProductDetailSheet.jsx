import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/currency";
import { ProductImage } from "./ProductImage";
import { CATEGORY_META, DEFAULT_CATEGORY_META } from "@/utils/constants";

function useMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export function ProductDetailSheet({ product, open, onClose, onEdit, onDelete, onOrder }) {
  const isMobile = useMobile();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!product) return null;

  const meta = CATEGORY_META[product.category] || DEFAULT_CATEGORY_META;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isMobile
            ? "inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl border-t border-neutral-100"
            : "inset-y-0 right-0 w-full max-w-md border-l border-neutral-100",
          open
            ? "translate-y-0 translate-x-0"
            : isMobile
            ? "translate-y-full"
            : "translate-x-full"
        )}
      >
        {/* Mobile drag handle */}
        <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-neutral-200 sm:hidden cursor-pointer" onClick={onClose} />

        {/* Header */}
        <header className="relative flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Product Details</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            aria-label="Close panel"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Visual section */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100">
            <ProductImage
              src={product.image_url}
              name={product.name}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.on_sale && (
              <span className="absolute left-4 top-4">
                <Badge variant="dark" className="text-xs px-2.5 py-1">-{Number(product.discount_percent)}% OFF</Badge>
              </span>
            )}
            {product.is_low_stock && (
              <span className="absolute right-4 top-4">
                <Badge variant="warning" className="text-xs px-2.5 py-1">Low stock</Badge>
              </span>
            )}
          </div>

          {/* Core Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm", meta.bgAccent, meta.accentColor)}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={meta.icon} />
                </svg>
                {product.category}
              </span>
              <span className="inline-flex font-mono text-xs text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-full px-3 py-1">
                SKU: {product.sku}
              </span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 leading-tight">
              {product.name}
            </h3>

            {/* Price display */}
            <div className="mt-3 flex items-baseline gap-2.5">
              {product.on_sale ? (
                <>
                  <span className="text-2xl font-extrabold text-neutral-900">
                    {formatCurrency(product.effective_price)}
                  </span>
                  <span className="text-base text-neutral-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-extrabold text-neutral-900">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Stock detail */}
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 flex justify-between items-center">
            <div>
              <span className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">Current Stock</span>
              <span className="text-xl font-bold text-neutral-900">{product.quantity} items</span>
            </div>
            <div className="text-right">
              <span className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</span>
              <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold mt-0.5", product.is_low_stock ? "text-amber-600" : "text-emerald-600")}>
                <span className={cn("h-2 w-2 rounded-full", product.is_low_stock ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                {product.is_low_stock ? "Low Stock" : "In Stock"}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Description</h4>
              <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50/50 p-4 rounded-xl border border-neutral-100/50 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Description</h4>
              <p className="text-sm text-neutral-400 italic bg-neutral-50/50 p-4 rounded-xl border border-neutral-100/50 border-dashed">
                No description provided for this product.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="border-t border-neutral-100 bg-neutral-50/50 px-6 py-4 space-y-3">
          <Button
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            onClick={() => {
              onClose();
              if (onOrder) onOrder(product);
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            Order
          </Button>

          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl py-2 flex items-center justify-center gap-2 border-neutral-200"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              Edit Product
            </Button>
            <Button
              variant="ghost"
              className="flex-1 rounded-xl py-2 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2"
              onClick={() => {
                onClose();
                onDelete(product);
              }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete
            </Button>
          </div>
        </footer>
      </div>
    </>
  );
}
