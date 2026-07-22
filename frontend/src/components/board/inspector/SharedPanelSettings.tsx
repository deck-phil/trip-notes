import type {
  ModuleInstance,
  ModuleSettings,
} from "../../../types/inspectorTypes.ts";

type Props = {
  module: ModuleInstance;
  settings: ModuleSettings;
  onChange: (patch: Partial<ModuleSettings>) => void;
};

export default function SharedPanelSettings({
  module,
  settings,
  onChange,
}: Props) {
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

      <label className="inspector-field" htmlFor="panel-color">
        <span className="inspector-field__label">Color</span>
        <select
          id="panel-color"
          className="inspector-field__select"
          value={settings.panel_color ?? ""}
          onChange={(event) => onChange({ panel_color: event.target.value })}
        >
          <option value="yellow">Yellow</option>
          <option value="green">Green</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="orange">Orange</option>
          <option value="lavender">Lavender</option>
          <option value="mint">Mint</option>
          <option value="peach">Peach</option>
          <option value="sky">Sky</option>
        </select>
      </label>
    </section>
  );
}
