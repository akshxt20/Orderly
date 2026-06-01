import { Badge } from "@/components/ui/Badge";

// Maps the backend's lifecycle states to a colour + label.
const STATUS = {
  ordered: { variant: "neutral", label: "Ordered" },
  dispatched: { variant: "info", label: "Dispatched" },
  shipped: { variant: "info", label: "Shipped" },
  arriving: { variant: "warning", label: "Arriving" },
  arrived: { variant: "success", label: "Arrived" },
};

export function OrderStatusBadge({ status }) {
  const config = STATUS[status] ?? STATUS.ordered;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
