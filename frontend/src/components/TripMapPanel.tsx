import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import type {Trip} from "../types/trip";
import "leaflet/dist/leaflet.css";

type Props = {
  trip: Trip;
};

export default function TripMapPanel({trip}: Props) {
  if (trip.latitude === null || trip.longitude === null) {
    return <p className="panel-meta">No coordinates have been set for this trip yet.</p>;
  }

  const latitude = Number(trip.latitude);
  const longitude = Number(trip.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return <p className="panel-meta">Trip coordinates are invalid.</p>;
  }

  const position: [number, number] = [latitude, longitude];

  return (
      <>
        <div className="trip-map-shell">
          <MapContainer
              center={position}
              zoom={11}
              scrollWheelZoom={true}
              className="trip-map"
          >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
              <Popup>
                <strong>{trip.name}</strong>
                <br/>
                {trip.location || "Trip destination"}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <p className="map-coordinates">
          <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${trip.latitude},${trip.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </p>
      </>
  );
}