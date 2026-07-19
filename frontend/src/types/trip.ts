export interface TripListItem {
  id: number;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_organizer?: boolean;
}

export type Trip = {
  id: number;
  name: string;
  location: string;
  description: string;
  start_date: string;
  end_date: string;
  latitude: number | null;
  longitude: number | null;
};

export type GroceryItem = {
  id: number;
  name: string;
  quantity: string;
  is_packed: boolean;
  trip: number;
};

export type PersonalItem = {
  id: number;
  name: string;
  quantity: string;
  notes: string;
  is_packed: boolean;
  trip: number;
  user: number;
};

export type TripNote = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  trip: number;
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