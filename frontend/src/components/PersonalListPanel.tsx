import {useQuery} from "@tanstack/react-query";
import {api} from "../services/api";
import type {PersonalList} from "../types/trip";

type Props = {
  tripId: string;
  personalListId: number;
};

export default function PersonalListPanel({tripId, personalListId}: Props) {
  const {
    data: personalList,
    isPending,
    isError,
  } = useQuery<PersonalList>({
    queryKey: ["trip", tripId, "personal-list", personalListId],
    queryFn: () => api.getPersonalList(tripId, personalListId),
  });

  if (isPending) {
    return <p className="panel-meta">Loading personal items...</p>;
  }

  if (isError || !personalList || personalList.items.length === 0) {
    return null;
  }

  return (
      <ul className="panel-list">
        {personalList.items.map((item) => (
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