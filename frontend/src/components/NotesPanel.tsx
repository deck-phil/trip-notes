import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { TripNote } from "../types/trip";

type Props = {
  tripId: number;
};

export default function NotesPanel({ tripId }: Props) {
  const {
    data: notes = [],
    isPending,
    isError,
  } = useQuery<TripNote[]>({
    queryKey: ["notes", tripId],
    queryFn: () => api.getNotes(tripId),
  });

  if (isPending) {
    return (
      <section className="sticky-note notes">
        <h2 className="sticky-title">Notes</h2>
        <p className="item-meta">Loading notes...</p>
      </section>
    );
  }

  if (isError || notes.length === 0) {
    return null;
  }

  return (
    <section className="sticky-note notes">
      <h2 className="sticky-title">Notes</h2>

      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note.id} className="note-card">
            <strong className="note-title">{note.title}</strong>
            <p className="note-body">{note.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}