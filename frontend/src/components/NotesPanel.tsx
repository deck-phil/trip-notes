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
    return <p className="panel-meta">Loading notes...</p>;
  }

  if (isError || notes.length === 0) {
    return null;
  }

  return (
    <ul className="notes-list">
      {notes.map((note) => (
        <li key={note.id} className="note-card">
          <p className="note-title">{note.title}</p>
          <p className="note-body">{note.body}</p>
        </li>
      ))}
    </ul>
  );
}