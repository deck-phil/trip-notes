import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { GroceryItem } from "../types/trip";

type Props = {
  tripId: number;
};

export default function GroceryPanel({ tripId }: Props) {
  const {
    data: items = [],
    isPending,
    isError,
  } = useQuery<GroceryItem[]>({
    queryKey: ["groceries", tripId],
    queryFn: () => api.getGroceries(tripId),
  });

  if (isPending) {
    return (
      <section className="sticky-note grocery">
        <h2 className="sticky-title">Groceries</h2>
        <p className="item-meta">Loading groceries...</p>
      </section>
    );
  }

  if (isError || items.length === 0) {
    return null;
  }

  return (
    <section className="sticky-note grocery">
      <h2 className="sticky-title">Groceries</h2>

      <ul className="sticky-list">
        {items.map((item) => (
          <li key={item.id} className="sticky-list-item">
            <div className="item-main">
              <p className="item-name">{item.name}</p>
              {item.quantity && (
                <span className="item-meta">{item.quantity}</span>
              )}
            </div>

            {item.is_packed && <span className="packed-check">✓</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}