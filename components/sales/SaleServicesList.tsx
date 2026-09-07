import type { SaleItem } from "@/lib/types";

interface SaleServicesListProps {
  items: SaleItem[];
}

const MAX_VISIBLE_SERVICES = 2;

export default function SaleServicesList({ items }: SaleServicesListProps) {
  if (items.length === 0) {
    return <span className="text-muted">—</span>;
  }

  if (items.length > MAX_VISIBLE_SERVICES) {
    return <span>{items.length} servicios</span>;
  }

  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <p key={item.id} className="truncate">
          {item.serviceName}
          {item.quantity > 1 ? ` ×${item.quantity}` : ""}
        </p>
      ))}
    </div>
  );
}
