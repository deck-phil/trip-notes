import type { Trip } from "../types/trip";

type Props = {
  trip: Trip;
};

export default function TripHeaderPanel({ trip }: Props) {
  return (
    <section className="trip-hero-card">
      <p className="trip-hero-kicker">Trip board</p>
      <h1 className="trip-hero-title">{trip.name}</h1>

      <div className="trip-hero-meta">
        <span>{trip.location || "Location TBD"}</span>
        <span>
          {trip.start_date} to {trip.end_date}
        </span>
      </div>

      {trip.description && (
        <p className="trip-hero-description">{trip.description}</p>
      )}
    </section>
  );
}
