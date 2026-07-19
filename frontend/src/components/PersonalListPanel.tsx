import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { PersonalItem } from "../types/trip";

type Props = {
  tripId: number;
};

export default function PersonalListPanel({ tripId }: Props) {
  const {
    data: items = [],
    isPending,
    isError,
  } = useQuery<PersonalItem[]>({
    queryKey: ["personal-items", tripId],
    queryFn: () => api.getPersonalItems(tripId),
  });

  if (isPending) {
    return (
      <section className="sticky-note personal">
        <h2 className="sticky-title">Personal Items</h2>
        <p className="item-meta">Loading personal items...</p>
      </section>
    );
  }

  if (isError || items.length === 0) {
    return null;
  }

  return (
    <section className="sticky-note personal">
      <h2 className="sticky-title">Personal Items</h2>

      <ul className="sticky-list">
        {items.map((item) => (
          <li key={item.id} className="sticky-list-item">
            <div className="item-main">
              <p className="item-name">{item.name}</p>
              {item.quantity && <span className="item-meta">{item.quantity}</span>}
              {item.notes && <span className="item-meta">{item.notes}</span>}
            </div>

            {item.is_packed && <span className="packed-check">✓</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}