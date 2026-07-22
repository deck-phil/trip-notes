import type {
  ModuleInstance,
  ModuleSettings,
} from "../../../types/inspectorTypes.ts";

type Props = {
  module: ModuleInstance;
  settings: ModuleSettings;
  onChange: (patch: Partial<ModuleSettings>) => void;
};

const PANEL_COLORS = [
  "yellow",
  "red",
  "blue",
  "green",
  "peach",
  "lavender",
  "mint",
  "orange",
] as const;

const colorLabelMap: Record<(typeof PANEL_COLORS)[number], string> = {
  yellow: "Yellow",
  red: "Red",
  blue: "Blue",
  green: "Green",
  peach: "Peach",
  lavender: "Lavender",
  mint: "Mint",
  orange: "Orange",
};

export default function SharedPanelSettings({
  module,
  settings,
  onChange,
}: Props) {
  const selectedColor = settings.panel_color ?? module.panel_color ?? "blue";

  return (
    <section className="inspector-section shared-panel-settings">
      <label className="inspector-field" htmlFor="panel-title">
        <span className="inspector-field__label">Title</span>
        <input
          id="panel-title"
          className="inspector-field__input"
          type="text"
          value={settings.title ?? module.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </label>

      <div className="inspector-field">
        <span className="inspector-field__label">Color</span>

        <div
          className="inspector-color-grid"
          role="radiogroup"
          aria-label="Panel color"
        >
          {PANEL_COLORS.map((color) => {
            const isSelected = selectedColor === color;

            return (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`inspector-color-option ${isSelected ? "is-selected" : ""}`}
                onClick={() => onChange({ panel_color: color })}
              >
                <span
                  className={`color-swatch color-swatch--${color}`}
                  aria-hidden="true"
                />
                <span className="inspector-color-option__label">
                  {colorLabelMap[color]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
