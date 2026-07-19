import type {GroceryItem, PersonalItem, Trip, TripListItem, TripNote, TripWeather} from "../types/trip";

const API_BASE = "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Request failed: ${status}`);
    this.status = status;
  }
}

async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getTripList: () => getJSON<TripListItem[]>(`${API_BASE}/trips/`),
  getTrip: (tripId: number) => getJSON<Trip>(`${API_BASE}/trips/${tripId}/`),
  getGroceries: (tripId: number) => getJSON<GroceryItem[]>(`${API_BASE}/trips/${tripId}/groceries/`),
  getPersonalItems: (tripId: number) => getJSON<PersonalItem[]>(`${API_BASE}/trips/${tripId}/personal-items/`),
  getNotes: (tripId: number) => getJSON<TripNote[]>(`${API_BASE}/trips/${tripId}/notes/`),
  getWeather: (tripId: number) => getJSON<TripWeather>(`${API_BASE}/trips/${tripId}/weather/`),
};