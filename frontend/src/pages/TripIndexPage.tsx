import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {api} from "../services/api";
import type {TripListItem} from "../types/trip";

export default function TripIndexPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      try {
        const trips: TripListItem[] = await api.getTripList();

        if (cancelled) {
          return;
        }

        if (trips.length === 1) {
          navigate(`/board/${trips[0].id}`, {replace: true});
          return;
        }

        navigate("/trips", {replace: true});
      } catch (err) {
        if (!cancelled) {
          const message =
              err instanceof Error ? err.message : "Could not load trips.";
          setError(message);
        }
      }
    }

    loadTrips();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return <p className="board-message">{error}</p>;
  }

  return <p className="board-message">Loading...</p>;
}