import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { TripNote } from "../types/trip";

type Props = {
  tripId: string;
  noteId: number;
  canEdit: boolean;
  isEditMode: boolean;
};

export default function NotesPanel({
  tripId,
  noteId,
  canEdit,
  isEditMode,
}: Props) {
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wasEditingRef = useRef(false);

  const {
    data: note,
    isPending,
    isError,
  } = useQuery<TripNote>({
    queryKey: ["trip", tripId, "note", noteId],
    queryFn: () => api.getNote(tripId, noteId),
  });

  const [draftBody, setDraftBody] = useState("");

  const showEditing = canEdit && isEditMode;

  useEffect(() => {
    if (!note) {
      return;
    }

    setDraftBody(note.body ?? "");
  }, [note]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea || !showEditing) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [draftBody, showEditing]);

  const updateNoteMutation = useMutation({
    mutationFn: ({ body }: { body: string }) =>
      api.updateNote(tripId, noteId, { body }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trip", tripId, "note", noteId],
      });
    },
  });

  useEffect(() => {
    if (wasEditingRef.current && !showEditing && note) {
      const trimmedBody = draftBody.trim();

      if (trimmedBody !== (note.body ?? "").trim()) {
        updateNoteMutation.mutate({ body: trimmedBody });
      }
    }

    wasEditingRef.current = showEditing;
  }, [showEditing, draftBody, note, updateNoteMutation]);

  if (isPending) {
    return <p className="panel-meta">Loading note...</p>;
  }

  if (isError || !note) {
    return null;
  }

  if (showEditing) {
    return (
      <div className="note-card">
        <textarea
          ref={textareaRef}
          className="grocery-edit-input note-edit-textarea"
          value={draftBody}
          onChange={(event) => setDraftBody(event.target.value)}
          placeholder="Note body"
          rows={1}
        />
      </div>
    );
  }

  return (
    <div className="note-card">
      <p className="note-body">{note.body}</p>
    </div>
  );
}
