import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { PersonalList } from "../types/trip";

type Props = {
  tripId: string;
  personalListId: number;
  canEdit: boolean;
  isEditMode: boolean;
};

export default function PersonalListPanel({
  tripId,
  personalListId,
  canEdit,
  isEditMode,
}: Props) {
  const queryClient = useQueryClient();

  const {
    data: personalList,
    isPending,
    isError,
  } = useQuery<PersonalList>({
    queryKey: ["trip", tripId, "personal-list", personalListId],
    queryFn: () => api.getPersonalList(tripId, personalListId),
  });

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftQuantity, setDraftQuantity] = useState("");

  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");

  const updateItemMutation = useMutation({
    mutationFn: ({
      itemId,
      name,
      quantity,
    }: {
      itemId: number;
      name: string;
      quantity: string;
    }) =>
      api.updatePersonalItem(tripId, personalListId, itemId, {
        name,
        quantity,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trip", tripId, "personal-list", personalListId],
      });
      setEditingItemId(null);
      setDraftName("");
      setDraftQuantity("");
    },
  });

  const createItemMutation = useMutation({
    mutationFn: ({ name, quantity }: { name: string; quantity: string }) =>
      api.createPersonalItem(tripId, personalListId, {
        name,
        quantity,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trip", tripId, "personal-list", personalListId],
      });
      setNewItemName("");
      setNewItemQuantity("");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) =>
      api.deletePersonalItem(tripId, personalListId, itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trip", tripId, "personal-list", personalListId],
      });

      if (editingItemId !== null) {
        setEditingItemId(null);
        setDraftName("");
        setDraftQuantity("");
      }
    },
  });

  if (isPending) {
    return <p className="panel-meta">Loading personal items...</p>;
  }

  if (isError || !personalList) {
    return null;
  }

  const showEditing = canEdit && isEditMode;

  function startEditing(item: PersonalList["items"][number]) {
    setEditingItemId(item.id);
    setDraftName(item.name);
    setDraftQuantity(item.quantity ?? "");
  }

  function cancelEditing() {
    setEditingItemId(null);
    setDraftName("");
    setDraftQuantity("");
  }

  function saveEditing(itemId: number) {
    const trimmedName = draftName.trim();
    const trimmedQuantity = draftQuantity.trim();

    if (!trimmedName) {
      return;
    }

    updateItemMutation.mutate({
      itemId,
      name: trimmedName,
      quantity: trimmedQuantity,
    });
  }

  function addNewItem() {
    const trimmedName = newItemName.trim();
    const trimmedQuantity = newItemQuantity.trim();

    if (!trimmedName) {
      return;
    }

    createItemMutation.mutate({
      name: trimmedName,
      quantity: trimmedQuantity,
    });
  }

  if (personalList.items.length === 0 && !showEditing) {
    return null;
  }

  return (
    <div className="grocery-panel">
      {showEditing ? (
        <form
          className="grocery-add-row"
          onSubmit={(event) => {
            event.preventDefault();
            addNewItem();
          }}
        >
          <div className="grocery-list-item__editor">
            <input
              type="text"
              className="grocery-edit-input grocery-edit-input--name"
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="Add item"
            />

            <input
              type="text"
              className="grocery-edit-input grocery-edit-input--quantity"
              value={newItemQuantity}
              onChange={(event) => setNewItemQuantity(event.target.value)}
              placeholder="Qty"
            />
          </div>

          <div className="grocery-list-item__actions">
            <button
              type="submit"
              className="grocery-item-action grocery-item-action--primary"
              disabled={createItemMutation.isPending}
            >
              Add
            </button>
          </div>
        </form>
      ) : null}

      {personalList.items.length === 0 ? (
        showEditing ? (
          <p className="panel-meta">No personal items yet.</p>
        ) : null
      ) : (
        <ul className="panel-list grocery-list">
          {personalList.items.map((item) => {
            const isRowEditing = showEditing && editingItemId === item.id;

            return (
              <li key={item.id} className="panel-list-item grocery-list-item">
                {isRowEditing ? (
                  <>
                    <div className="grocery-list-item__editor">
                      <input
                        type="text"
                        className="grocery-edit-input grocery-edit-input--name"
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        placeholder="Item name"
                      />

                      <input
                        type="text"
                        className="grocery-edit-input grocery-edit-input--quantity"
                        value={draftQuantity}
                        onChange={(event) =>
                          setDraftQuantity(event.target.value)
                        }
                        placeholder="Qty"
                      />
                    </div>

                    <div className="grocery-list-item__actions">
                      <button
                        type="button"
                        className="grocery-item-action grocery-item-action--primary"
                        onClick={() => saveEditing(item.id)}
                        disabled={updateItemMutation.isPending}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="grocery-item-action grocery-item-action--secondary"
                        onClick={cancelEditing}
                        disabled={updateItemMutation.isPending}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grocery-list-item__content">
                      <span className="panel-item-name grocery-list-item__name">
                        {item.name}
                      </span>

                      {item.quantity ? (
                        <span className="panel-meta grocery-list-item__quantity">
                          {item.quantity}
                        </span>
                      ) : null}
                    </div>

                    <div className="grocery-list-item__actions">
                      {item.is_packed && !showEditing ? (
                        <span
                          className="panel-check grocery-list-item__check"
                          aria-label="Packed"
                          title="Packed"
                        >
                          ✓
                        </span>
                      ) : null}

                      {showEditing ? (
                        <>
                          <button
                            type="button"
                            className="grocery-item-action grocery-item-action--secondary"
                            onClick={() => startEditing(item)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="grocery-item-action grocery-item-action--danger"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            disabled={deleteItemMutation.isPending}
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
