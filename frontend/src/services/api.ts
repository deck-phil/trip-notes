import type {
  GroceryList,
  PersonalList,
  Trip,
  TripListItem,
  TripNote,
  TripWeather
} from "../types/trip";

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
  getTripList: () =>
    getJSON<TripListItem[]>(`${API_BASE}/trips/`),

  getTrip: (tripId: string) =>
    getJSON<Trip>(`${API_BASE}/trips/${tripId}/`),

  getGroceryList: (tripId: string, groceryListId: number) =>
    getJSON<GroceryList>(
      `${API_BASE}/trips/${tripId}/groceries/${groceryListId}/`
    ),

  getPersonalList: (tripId: string, personalListId: number) =>
    getJSON<PersonalList>(
      `${API_BASE}/trips/${tripId}/personal-lists/${personalListId}/`
    ),

  getNote: (tripId: string, noteId: number) =>
    getJSON<TripNote>(
      `${API_BASE}/trips/${tripId}/notes/${noteId}/`
    ),

  getWeather: (tripId: string) =>
    getJSON<TripWeather>(`${API_BASE}/trips/${tripId}/weather/`),
};