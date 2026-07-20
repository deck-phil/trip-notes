import {useQuery} from "@tanstack/react-query";
import {api} from "../services/api";
import type {TripNote} from "../types/trip";

type Props = {
  tripId: string;
  noteId: number;
};

export default function NotesPanel({tripId, noteId}: Props) {
  const {
    data: note,
    isPending,
    isError,
  } = useQuery<TripNote>({
    queryKey: ["trip", tripId, "note", noteId],
    queryFn: () => api.getNote(tripId, noteId),
  });

  if (isPending) {
    return <p className="panel-meta">Loading note...</p>;
  }

  if (isError || !note) {
    return null;
  }

  return (
      <div className="note-card">
        <p className="note-title">{note.title}</p>
        <p className="note-body">{note.body}</p>
      </div>
  );
}