import type {ReactNode} from "react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

type Props = {
  moduleId: string;
  moduleType: string;
  title: string;
  children: ReactNode;
};

export default function BoardModuleCard({
                                          moduleId,
                                          moduleType,
                                          title,
                                          children,
                                        }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: moduleId,
    data: {
      type: "module",
      moduleType,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
      <article
          ref={setNodeRef}
          style={style}
          className={`board-module-card board-module-card--${moduleType} ${
              isDragging ? "board-module-card--dragging" : ""
          }`}
          data-module-id={moduleId}
          data-module-type={moduleType}
          aria-label={title}
      >
        <header
            className="board-module-card__header board-module-card__header--handle"
            {...attributes}
            {...listeners}
        >
          <h3 className="board-module-card__title">{title}</h3>
          <span className="board-module-card__handle-icon" aria-hidden="true">⋮⋮</span>
        </header>

        <div className="board-module-card__body">{children}</div>
      </article>
  );
}