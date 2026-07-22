import { api } from "./api";

type ModuleType = "grocery" | "personal" | "notes" | "weather" | "map";

type ModuleProps =
  | { groceryListId: number }
  | { personalListId: number }
  | { noteId: number }
  | undefined;

export interface ModuleInstance {
  id: string;
  type: ModuleType;
  title: string;
  panel_color: string;
  props?: ModuleProps;
}

export interface SharedSettings {
  title?: string;
  panel_color?: string;
}

type SavePanelSettingsArgs = {
  tripId: string;
  module: ModuleInstance;
  settings: SharedSettings;
};

export async function savePanelSettings({
  tripId,
  module,
  settings,
}: SavePanelSettingsArgs) {
  switch (module.type) {
    case "grocery": {
      const groceryListId = (module.props as { groceryListId: number }).groceryListId;
      return api.updateGroceryList(tripId, groceryListId, {
        title: settings.title,
        panel_color: settings.panel_color,
      } as Partial<any>);
    }

    case "personal": {
      const personalListId = (module.props as { personalListId: number }).personalListId;
      return api.updatePersonalList(tripId, personalListId, {
        title: settings.title,
        panel_color: settings.panel_color,
      } as Partial<any>);
    }

    case "notes": {
      const noteId = (module.props as { noteId: number }).noteId;
      return api.updateNote(tripId, noteId, {
        title: settings.title,
        panel_color: settings.panel_color,
      });
    }

    case "weather":
      return api.updateTrip(tripId, {
        weather_panel_title: settings.title,
        weather_panel_color: settings.panel_color,
      } as Partial<any>);

    case "map":
      return api.updateTrip(tripId, {
        map_panel_title: settings.title,
        map_panel_color: settings.panel_color,
      } as Partial<any>);

    default:
      throw new Error(`Unsupported module type: ${module.type satisfies never}`);
  }
}