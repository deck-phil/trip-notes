import { useQuery } from "@tanstack/react-query";
import {api, ApiError} from "../services/api";
import type { Trip } from "../types/trip";
import TripHeaderPanel from "../components/TripHeaderPanel.tsx";
import GroceryPanel from "../components/GroceryPanel.tsx";
import PersonalListPanel from "../components/PersonalListPanel.tsx";
import NotesPanel from "../components/NotesPanel";
import WeatherPanel from "../components/WeatherPanel";
import TripMapPanel from "../components/TripMapPanel";
import "../styles/triptrack-board.css";
import {Navigate, useParams} from "react-router-dom";

export default function TripBoardPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const parsedTripId = Number(tripId);

  if (!tripId || Number.isNaN(parsedTripId)) {
    return <Navigate to="/trips" replace />;
  }

  const {
    data: trip,
    isPending,
    isError,
  } = useQuery<Trip>({
    queryKey: ["trip", parsedTripId],
    queryFn: () => api.getTrip(parsedTripId),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [400, 401, 403, 404].includes(error.status)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  if (isPending) {
    return <p className="board-message">Loading dashboard...</p>;
  }

  if (isError || !trip) {
    return <p className="board-message error">Could not load trip dashboard.</p>;
  }

  const hasMap =
    trip.latitude !== null &&
    trip.longitude !== null &&
    !Number.isNaN(Number(trip.latitude)) &&
    !Number.isNaN(Number(trip.longitude));

  return (
    <main className="board-page">
      <div className="board-surface">
        <TripHeaderPanel trip={trip} />

        <div className="board-grid">
          <GroceryPanel tripId={parsedTripId} />
          <PersonalListPanel tripId={parsedTripId} />
          <NotesPanel tripId={parsedTripId} />
          <WeatherPanel tripId={parsedTripId} />
          {hasMap && <TripMapPanel trip={trip} />}
        </div>
      </div>
    </main>
  );
}