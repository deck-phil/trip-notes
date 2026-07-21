import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface BoardColumnProps {
  title: string;
  columnKey: string;
  items: string[];
  children: ReactNode;
}

export default function BoardColumn({
  title,
  columnKey,
  items,
  children,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnKey,
    data: {
      type: "column",
      columnId: columnKey,
    },
  });

  return (
    <section
      className="trip-board-column"
      aria-labelledby={`${columnKey}-heading`}
      data-column-id={columnKey}
    >
      <h2 id={`${columnKey}-heading`} className="sr-only">
        {title}
      </h2>

      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`trip-board-column-stack ${
            isOver ? "trip-board-column-stack--over" : ""
          }`}
        >
          {children}

          {items.length === 0 && (
            <div className="trip-board-empty">Drop notes here</div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
