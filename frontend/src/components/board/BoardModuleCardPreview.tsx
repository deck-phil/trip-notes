type BoardModuleCardPreviewProps = {
  module?: {
    id: string;
    type: string;
    title: string;
  };
};

export default function BoardModuleCardPreview({
                                                 module,
                                               }: BoardModuleCardPreviewProps) {
  if (!module) {
    return null;
  }

  return (
      <article
          className={`board-module-card board-module-card--${module.type} board-module-card--overlay`}
          aria-hidden="true"
      >
        <header className="board-module-card__header">
          <h3 className="board-module-card__title">{module.title}</h3>
        </header>

        <div className="board-module-card__body">
          <p className="panel-meta">Moving note…</p>
        </div>
      </article>
  );
}