import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CategoryView } from "@/components/products/CategoryView";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductDetailSheet } from "@/components/products/ProductDetailSheet";
import { CategoryManager } from "@/components/products/CategoryManager";
import { OrderForm } from "@/components/orders/OrderForm";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCategories } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Field";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { PRODUCT_CATEGORIES, CATEGORY_META } from "@/utils/constants";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/currency";

const PAGE_SIZE = 8;

const SORT_OPTIONS = {
  newest: { sort_by: "created_at", sort_dir: "desc" },
  name: { sort_by: "name", sort_dir: "asc" },
  price_low: { sort_by: "price", sort_dir: "asc" },
  price_high: { sort_by: "price", sort_dir: "desc" },
  stock_low: { sort_by: "quantity", sort_dir: "asc" },
};

// Renders a price, struck-through with the sale price when the product is on offer.
function PriceCell({ product }) {
  if (!product.on_sale) return formatCurrency(product.price);
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="font-medium text-neutral-900">{formatCurrency(product.effective_price)}</span>
      <span className="text-xs text-neutral-400 line-through">{formatCurrency(product.price)}</span>
    </span>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid"); // "grid" | "table" | "category"
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [managingCategories, setManagingCategories] = useState(false);
  const [orderProduct, setOrderProduct] = useState(null);

  const debouncedSearch = useDebounce(search);
  const params = { page, limit: PAGE_SIZE, ...SORT_OPTIONS[sort] };
  if (debouncedSearch) params.search = debouncedSearch;
  if (categoryFilter) params.category = categoryFilter;

  const { data, isLoading } = useProducts(params);
  const { data: dynamicCategories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createOrder = useCreateOrder();

  // Merge built-in and dynamic category names
  const filterCategories = Array.from(new Set([
    ...PRODUCT_CATEGORIES,
    ...(dynamicCategories ?? [])
  ])).filter(Boolean);

  const products = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value);
    setPage(1);
  };

  // Order from the catalogue without leaving the page — opens a modal here.
  const handleOrderProduct = (product) => setOrderProduct(product);

  const handleSelectProduct = (product) => setSelectedProduct(product);

  const handleSubmit = (payload) => {
    if (editing === "new") {
      createProduct.mutate(payload, { onSuccess: () => setEditing(null) });
    } else {
      updateProduct.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) });
    }
  };

  const columns = [
    { key: "sku", header: "SKU", render: (p) => <span className="font-mono text-xs text-neutral-500">{p.sku}</span> },
    { key: "name", header: "Name", render: (p) => <span className="font-medium text-neutral-900">{p.name}</span> },
    { key: "category", header: "Category", render: (p) => <CategoryBadge category={p.category} /> },
    { key: "price", header: "Price", render: (p) => <PriceCell product={p} /> },
    {
      key: "quantity",
      header: "Stock",
      render: (p) => (
        <span className="inline-flex items-center gap-2">
          {p.quantity}
          {p.is_low_stock && <Badge variant="warning">Low</Badge>}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing(p)} title="Edit">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(p)} title="Delete">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  const emptyState = (
    <EmptyState
      title={debouncedSearch ? "No matching products" : "No products yet"}
      description={debouncedSearch ? "Try a different search term." : "Add your first product to get started."}
      action={!debouncedSearch && <Button onClick={() => setEditing("new")}>+ Add product</Button>}
    />
  );

  const showGridEmpty = !isLoading && products.length === 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Products"
        description="Manage your catalogue and stock levels."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setManagingCategories(true)}>
              Categories
            </Button>
            <Button onClick={() => setEditing("new")}>+ Add product</Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or SKU…" className="w-full sm:max-w-xs" />
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-[calc(50%-0.25rem)] text-sm sm:w-48">
          <option value="newest">Newest first</option>
          <option value="name">Name (A–Z)</option>
          <option value="price_low">Price: low to high</option>
          <option value="price_high">Price: high to low</option>
          <option value="stock_low">Stock: low to high</option>
        </Select>
        <Select
          value={categoryFilter}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="w-[calc(50%-0.25rem)] text-sm sm:w-44"
        >
          <option value="">All Categories</option>
          {filterCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Active category filter chip */}
      {categoryFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-neutral-500">Filtering:</span>
          <CategoryBadge category={categoryFilter} />
          <button
            onClick={() => handleCategoryFilter("")}
            className="ml-1 rounded-full p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Clear filter"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {view === "category" ? (
        <>
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                  <div className="skeleton h-20 w-full" />
                  <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="overflow-hidden rounded-xl border border-neutral-200">
                        <div className="skeleton aspect-[4/3] w-full" />
                        <div className="space-y-2 p-3.5">
                          <div className="skeleton h-4 w-2/3" />
                          <div className="skeleton h-4 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : showGridEmpty ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white">{emptyState}</div>
          ) : (
            <CategoryView
              products={products}
              onEdit={setEditing}
              onDelete={setDeleteTarget}
              onSelect={handleSelectProduct}
              onOrder={handleOrderProduct}
            />
          )}
        </>
      ) : view === "grid" ? (
        <>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  <div className="skeleton aspect-square w-full" />
                  <div className="space-y-2 p-4">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : showGridEmpty ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white">{emptyState}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={setEditing}
                  onDelete={setDeleteTarget}
                  onSelect={handleSelectProduct}
                  onOrder={handleOrderProduct}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <DataTable columns={columns} data={products} loading={isLoading} rowKey={(p) => p.id} emptyState={emptyState} />
      )}

      {meta && (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <Pagination page={meta.page} totalPages={meta.total_pages} total={meta.total} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add product" : "Edit product"}
      >
        <ProductForm
          mode={editing === "new" ? "create" : "edit"}
          defaultValues={
            editing && editing !== "new"
              ? {
                  sku: editing.sku,
                  name: editing.name,
                  category: editing.category,
                  image_url: editing.image_url ?? "",
                  description: editing.description ?? "",
                  price: editing.price,
                  quantity: editing.quantity,
                  low_stock_threshold: editing.low_stock_threshold,
                }
              : undefined
          }
          submitting={createProduct.isPending || updateProduct.isPending}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteProduct.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        title="Delete product"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        loading={deleteProduct.isPending}
      />

      <ProductDetailSheet
        product={selectedProduct}
        open={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onEdit={setEditing}
        onDelete={setDeleteTarget}
        onOrder={handleOrderProduct}
      />

      <Modal
        open={managingCategories}
        onClose={() => setManagingCategories(false)}
        title="Manage categories"
      >
        <CategoryManager />
      </Modal>

      <Modal
        open={orderProduct !== null}
        onClose={() => setOrderProduct(null)}
        title="New order"
        size="lg"
      >
        <OrderForm
          initialProductId={orderProduct?.id}
          submitting={createOrder.isPending}
          onSubmit={(payload) =>
            createOrder.mutate(payload, { onSuccess: () => setOrderProduct(null) })
          }
          onCancel={() => setOrderProduct(null)}
        />
      </Modal>
    </div>
  );
}

/** Colored category badge that uses CATEGORY_META for styling */
function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category];
  if (!meta) return <Badge variant="neutral">{category}</Badge>;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.bgAccent} ${meta.accentColor}`}>
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={meta.icon} />
      </svg>
      {category}
    </span>
  );
}

function ViewToggle({ view, onChange }) {
  const options = [
    { id: "grid", label: "Grid", icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
    { id: "table", label: "List", icon: <path d="M3 6h18M3 12h18M3 18h18" /> },
    {
      id: "category",
      label: "Category",
      icon: (
        <>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />
        </>
      ),
    },
  ];
  return (
    <div className="flex w-full rounded-lg border border-neutral-300 bg-white p-0.5 sm:ml-auto sm:w-auto">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-label={option.label}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none",
            view === option.id ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900",
          )}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {option.icon}
          </svg>
          {option.label}
        </button>
      ))}
    </div>
  );
}
