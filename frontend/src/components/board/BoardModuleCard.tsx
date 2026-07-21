import type {ReactNode} from "react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

type Props = {
  moduleId: string;
  moduleType: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function BoardModuleCard({
                                          moduleId,
                                          moduleType,
                                          title,
                                          children,
                                          actions,
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

  const handleStyle = {
    cursor: isDragging ? "grabbing" : "grab",
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
        <header className="board-module-card__header">
          <div
              className="board-module-card__header-main board-module-card__header--handle"
              style={handleStyle}
              {...attributes}
              {...listeners}
          >
            <h3 className="board-module-card__title">{title}</h3>
            <span className="board-module-card__handle-icon" aria-hidden="true">
            ⋮⋮
          </span>
          </div>

          {actions ? (
              <div className="board-module-card__actions">
                {actions}
              </div>
          ) : null}
        </header>

        <div className="board-module-card__body">{children}</div>
      </article>
  );
}
