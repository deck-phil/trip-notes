import {API_BASE, request} from "./http";
import type {
  GroceryItem,
  GroceryList, PersonalItem,
  PersonalList,
  Trip,
  TripListItem,
  TripNote,
  TripWeather,
} from "../types/trip";

export const api = {
  getTripList: () =>
      request<TripListItem[]>(`${API_BASE}/trips/`),

  getTrip: (tripId: string) =>
      request<Trip>(`${API_BASE}/trips/${tripId}/`),

  getGroceryList: (tripId: string, groceryListId: number) =>
      request<GroceryList>(`${API_BASE}/trips/${tripId}/groceries/${groceryListId}/`),

  createGroceryItem: (
      tripId: string,
      groceryListId: number,
      data: { name: string; quantity: string }
  ) =>
      request<GroceryItem>(`${API_BASE}/trips/${tripId}/groceries/${groceryListId}/items/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

  updateGroceryItem: (
      tripId: string,
      groceryListId: number,
      itemId: number,
      data: Partial<{ name: string; quantity: string; is_packed: boolean }>
  ) =>
      request<GroceryItem>(
          `${API_BASE}/trips/${tripId}/groceries/${groceryListId}/items/${itemId}/`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          }
      ),

  deleteGroceryItem: (
      tripId: string,
      groceryListId: number,
      itemId: number
  ) =>
      request<void>(
          `${API_BASE}/trips/${tripId}/groceries/${groceryListId}/items/${itemId}/`,
          {
            method: "DELETE",
          }
      ),

  getPersonalList: (tripId: string, personalListId: number) =>
      request<PersonalList>(`${API_BASE}/trips/${tripId}/personal-lists/${personalListId}/`),

  createPersonalItem: (
      tripId: string,
      personalListId: number,
      data: { name: string; quantity: string }
  ) =>
      request<PersonalItem>(`${API_BASE}/trips/${tripId}/personal-lists/${personalListId}/items/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

  updatePersonalItem: (
      tripId: string,
      personalListId: number,
      itemId: number,
      data: Partial<{ name: string; quantity: string; is_packed: boolean }>
  ) =>
      request<PersonalItem>(
          `${API_BASE}/trips/${tripId}/personal-lists/${personalListId}/items/${itemId}/`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          }
      ),

  deletePersonalItem: (
      tripId: string,
      personalListId: number,
      itemId: number
  ) =>
      request<void>(
          `${API_BASE}/trips/${tripId}/personal-lists/${personalListId}/items/${itemId}/`,
          {
            method: "DELETE",
          }
      ),

  getNote: (tripId: string, noteId: number) =>
      request<TripNote>(`${API_BASE}/trips/${tripId}/notes/${noteId}/`),

  getWeather: (tripId: string) =>
      request<TripWeather>(`${API_BASE}/trips/${tripId}/weather/`),
};