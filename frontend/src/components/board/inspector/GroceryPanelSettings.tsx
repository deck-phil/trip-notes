import type {ModuleSettings} from "../../../types/inspectorTypes.ts";

type Props = {
  settings: ModuleSettings;
  onChange: (patch: Partial<ModuleSettings>) => void;
};

export default function GroceryPanelSettings({}: Props) {
  return (
    <section className="inspector-section">
      <h3 className="inspector-section__title">Grocery list</h3>
      <p>Grocery specific settings here</p>
    </section>
  );
}