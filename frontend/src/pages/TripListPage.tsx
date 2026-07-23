import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { TripListItem } from "../types/trip";

export default function TripListPage() {
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      try {
        setLoading(true);
        setError("");

        const data = await api.getTripList();

        if (!cancelled) {
          setTrips(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Could not load your trips.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrips();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="board-message">Loading your trips...</p>;
  }

  if (error) {
    return <p className="board-message">{error}</p>;
  }

  return (
    <main className="trip-list-page">
      <header className="trip-list-page__header">
        <h1>My Trips</h1>
        <p>Select a trip to open its board.</p>
      </header>

      {trips.length === 0 ? (
        <section className="trip-list-page__empty">
          <p>You are not part of any trips yet.</p>
        </section>
      ) : (
        <section className="trip-list-page__grid">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              to={`/board/${trip.id}`}
              className="trip-list-card"
            >
              <div className="trip-list-card__header">
                <h2>{trip.title}</h2>
                {trip.is_organizer ? (
                  <span className="trip-list-card__badge">Organizer</span>
                ) : null}
              </div>

              <p className="trip-list-card__meta">
                {trip.location || "Location not set"}
              </p>

              <p className="trip-list-card__meta">
                {trip.start_date} to {trip.end_date}
              </p>

              {trip.is_active === false ? (
                <p className="trip-list-card__status">Inactive trip</p>
              ) : null}
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
