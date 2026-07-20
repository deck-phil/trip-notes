import {useQuery} from "@tanstack/react-query";
import {api} from "../services/api";
import type {GroceryList} from "../types/trip";

type Props = {
  tripId: string;
  groceryListId: number;
};

export default function GroceryPanel({tripId, groceryListId}: Props) {
  const {
    data: groceryList,
    isPending,
    isError,
  } = useQuery<GroceryList>({
    queryKey: ["trip", tripId, "grocery-list", groceryListId],
    queryFn: () => api.getGroceryList(tripId, groceryListId),
  });

  if (isPending) {
    return <p className="panel-meta">Loading groceries...</p>;
  }

  if (isError || !groceryList || groceryList.items.length === 0) {
    return null;
  }

  return (
      <ul className="panel-list">
        {groceryList.items.map((item) => (
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