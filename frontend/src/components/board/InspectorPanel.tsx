import type { CSSProperties } from "react";
import SharedPanelSettings from "./inspector/SharedPanelSettings";
import GroceryPanelSettings from "./inspector/GroceryPanelSettings";
import TripSettingsPanel, {
  type TripSettings,
} from "./inspector/TripSettingsPanel";
import type {
  InspectorTarget,
  ModuleInstance,
  ModuleSettings,
} from "../../types/inspectorTypes";
import type { Trip } from "../../types/trip.ts";

type Props = {
  target: InspectorTarget;
  trip: Trip;
  module: ModuleInstance | null;
  isVisible: boolean;
  jiggleY: number;
  settings?: ModuleSettings;
  tripSettings: TripSettings;
  onTripSettingsChange: (patch: Partial<TripSettings>) => void;
  onChange?: (patch: Partial<ModuleSettings>) => void;
  onClose: () => void;
};

function getInspectorTitle(
  target: InspectorTarget,
  module: ModuleInstance | null,
) {
  if (target.kind === "trip") {
    return "Trip Settings";
  }

  if (!module) {
    return "Panel";
  }

  switch (module.type) {
    case "grocery":
      return "Grocery List";
    case "personal":
      return "Personal List";
    case "note":
      return "Note";
    case "weather":
      return "Weather";
    case "map":
      return "Map";
    default:
      return "Panel";
  }
}

export default function InspectorPanel({
  target,
  trip,
  module,
  isVisible,
  jiggleY,
  settings = {},
  tripSettings,
  onTripSettingsChange,
  onChange,
  onClose,
}: Props) {
  const panelStyle = {
    "--inspector-jiggle-y": `${jiggleY}px`,
  } as CSSProperties;

  return (
    <aside
      className={`board-inspector ${
        isVisible ? "board-inspector--open" : "board-inspector--closed"
      }`}
      style={panelStyle}
      aria-label="Inspector panel"
    >
      <header className="board-inspector__header">
        <div className="board-inspector__header-main">
          <p className="board-inspector__eyebrow">
            {target.kind === "trip" ? "Trip" : "Panel"}
          </p>

          <h2 className="board-inspector__title">
            {getInspectorTitle(target, module)}
          </h2>
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
      </header>

      <div className="board-inspector__body">
        {target.kind === "trip" ? (
          <TripSettingsPanel
            trip={trip}
            settings={tripSettings}
            onChange={onTripSettingsChange}
          />
        ) : module ? (
          <>
            <SharedPanelSettings
              module={module}
              settings={settings}
              onChange={onChange ?? (() => {})}
            />

            {module.type === "grocery" ? (
              <GroceryPanelSettings
                settings={settings}
                onChange={onChange ?? (() => {})}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </aside>
  );
}
