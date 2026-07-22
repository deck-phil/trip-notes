import type { ModuleType } from "./trip.ts";

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

export type InspectorTarget =
  { kind: "trip" } | { kind: "module"; moduleId: string };

export type TripSettings = {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
};