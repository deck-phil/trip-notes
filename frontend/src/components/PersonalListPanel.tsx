import {useQuery} from "@tanstack/react-query";
import {api} from "../services/api";
import type {PersonalItem} from "../types/trip";

type Props = {
  tripId: number;
};

export default function PersonalListPanel({tripId}: Props) {
  const {
    data: items = [],
    isPending,
    isError,
  } = useQuery<PersonalItem[]>({
    queryKey: ["personal-items", tripId],
    queryFn: () => api.getPersonalItems(tripId),
  });

  if (isPending) {
    return <p className="panel-meta">Loading personal items...</p>;
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
                    <p className="panel-meta">{item.quantity}</p>
                )}

                {item.notes && (
                    <p className="panel-meta">{item.notes}</p>
                )}
              </div>

              {item.is_packed && <span className="panel-check">✓</span>}
            </li>
        ))}
      </ul>
  );
}