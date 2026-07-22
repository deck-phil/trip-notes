export interface TripListItem {
  id: number;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_organizer?: boolean;
}

export type TripGroceryListSummary = {
  id: number;
  title: string;
  panel_color: string;
  created_by: number;
  created_at: string;
};

export type TripPersonalListSummary = {
  id: number;
  title: string;
  panel_color: string;
  created_by: number;
  created_at: string;
};

export type TripNoteSummary = {
  id: number;
  title: string;
  panel_color: string;
  created_by: number;
  created_at: string;
};

export type Trip = {
  id: string;
  title: string;
  location: string;
  description: string;
  start_date: string;
  end_date: string;
  latitude: number | null;
  longitude: number | null;
  is_member: boolean;
  is_organizer: boolean;
  grocery_lists: TripGroceryListSummary[];
  personal_lists: TripPersonalListSummary[];
  notes: TripNoteSummary[];
};

export type GroceryItem = {
  id: number;
  name: string;
  quantity: string;
  is_packed: boolean;
  grocery_list: string;
};

export type GroceryList = {
  id: string;
  title: string;
  panel_color: string;
  trip: string;
  created_by: string | null;
  created_at: string;
  items: GroceryItem[];
};

export type PersonalItem = {
  id: number;
  name: string;
  quantity: string;
  notes: string;
  is_packed: boolean;
};

export type PersonalList = {
  id: number;
  title: string;
  panel_color: string;
  trip: string;
  created_by: number;
  created_at: string;
  items: PersonalItem[];
};

export type TripNote = {
  id: string;
  title: string;
  panel_color: string;
  body: string;
  created_at: string;
  updated_at: string;
  trip: string;
  created_by: string | null;
};

export type WeatherCurrent = {
  time: string | null;
  temperature: number | null;
  temperature_unit: string | null;
  weather_code: number | null;
  weather_label: string | null;
  wind_speed: number | null;
  wind_speed_unit: string | null;
};

export type WeatherDay = {
  date: string;
  weather_code: number | null;
  weather_label: string | null;
  temperature_max: number | null;
  temperature_min: number | null;
  precipitation_sum: number | null;
  wind_speed_max: number | null;
  sunrise: string | null;
  sunset: string | null;
};

export type TripWeather = {
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  timezone_abbreviation: string | null;
  current: WeatherCurrent;
  daily_units: {
    temperature?: string;
    precipitation?: string;
    wind_speed?: string;
  };
  days: WeatherDay[];
};
