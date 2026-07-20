import {useQuery} from "@tanstack/react-query";
import {api} from "../services/api";
import type {GroceryItem} from "../types/trip";

type Props = {
  tripId: number;
};

export default function GroceryPanel({tripId}: Props) {
  const {
    data: items = [],
    isPending,
    isError,
  } = useQuery<GroceryItem[]>({
    queryKey: ["groceries", tripId],
    queryFn: () => api.getGroceries(tripId),
  });

  if (isPending) {
    return <p className="panel-meta">Loading groceries...</p>;
  }

  if (isError || items.length === 0) {
    return null;
  }

  return (
      <ul className="panel-list">
        {items.map((item) => (
            <li key={item.id} className="panel-list-item">
              <div className="panel-item-main">
                <p className="panel-item-name">{item.name}</p>
                {item.quantity && (
                    <span className="panel-meta">{item.quantity}</span>
                )}
              </div>

              {item.is_packed && <span className="panel-check">✓</span>}
            </li>
        ))}
      </ul>
  );
}