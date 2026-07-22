export type ModuleType = "grocery" | "personal" | "notes" | "weather" | "map";

export interface ModuleInstance {
  id: string;
  type: ModuleType;
  title: string;
  panel_color?: string;
  created_by?: number | null;
}

export type ModuleSettings = {
  title?: string;
  panel_color?: string;
  allowMemberEdits?: boolean;
  noteStyle?: "compact" | "full";
  mapMode?: "roadmap" | "terrain";
};