import type { CSSProperties } from "react";
import SharedPanelSettings from "./inspector/SharedPanelSettings";
import GroceryPanelSettings from "./inspector/GroceryPanelSettings";
import type {
  ModuleInstance,
  ModuleSettings,
  ModuleType,
} from "../../types/inspectorTypes.ts";

type Props = {
  module: ModuleInstance | null;
  isVisible: boolean;
  jiggleY: number;
  settings: ModuleSettings;
  onChange: (patch: Partial<ModuleSettings>) => void;
  onClose: () => void;
};

export default function InspectorPanel({
  module,
  isVisible,
  jiggleY,
  settings,
  onChange,
  onClose,
}: Props) {
  if (!module) {
    return null;
  }

  const PANEL_TYPE_LABELS: Record<ModuleType, string> = {
    grocery: "Grocery List",
    personal: "Personal List",
    notes: "Note",
    weather: "Weather",
    map: "Map",
  };

  return (
    <aside
      className={`board-inspector ${
        isVisible ? "board-inspector--open" : "board-inspector--closed"
      }`}
      style={
        {
          "--inspector-jiggle-y": `${jiggleY}px`,
        } as CSSProperties
      }
      aria-label={`${module.title} settings`}
      aria-hidden={!isVisible}
    >
      <div className="board-inspector__header">
        <div className="board-inspector__header-main">
          <p className="board-inspector__eyebrow">Settings</p>
          <h2 className="board-inspector__title">{PANEL_TYPE_LABELS[module.type]}</h2>
        </div>

        <div className="board-inspector__actions">
          <button
            type="button"
            className="board-inspector__close"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>

      <div className="board-inspector__body">
        <SharedPanelSettings
          module={module}
          settings={settings}
          onChange={onChange}
        />

        {module.type === "grocery" ? (
          <GroceryPanelSettings settings={settings} onChange={onChange} />
        ) : null}

      </div>
    </aside>
  );
}