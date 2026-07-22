import { useEffect, useRef } from "react";
import type { Trip } from "../../../types/trip";

export type TripSettings = {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
};

type Props = {
  trip: Trip;
  settings: TripSettings;
  onChange: (patch: Partial<TripSettings>) => void;
};

export default function TripSettingsPanel({
  trip: _trip,
  settings,
  onChange,
}: Props) {
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = descriptionRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [settings.description]);

  return (
    <section className="shared-panel-settings">
      <label className="inspector-field" htmlFor="trip-title">
        <span className="inspector-field__label">Title</span>
        <input
          id="trip-title"
          className="inspector-field__input"
          type="text"
          value={settings.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Trip title"
        />
      </label>

      <label className="inspector-field" htmlFor="trip-description">
        <span className="inspector-field__label">Description</span>
        <textarea
          ref={descriptionRef}
          id="trip-description"
          className="inspector-field__input inspector-field__textarea trip-settings__textarea"
          value={settings.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Add a trip description"
          rows={1}
        />
      </label>

      <label className="inspector-field" htmlFor="trip-location">
        <span className="inspector-field__label">Location</span>
        <input
          id="trip-location"
          className="inspector-field__input"
          type="text"
          value={settings.location}
          onChange={(event) => onChange({ location: event.target.value })}
          placeholder="Add a location"
        />
      </label>

      <label className="inspector-field" htmlFor="trip-start-date">
        <span className="inspector-field__label">Start date</span>
        <input
          id="trip-start-date"
          className="inspector-field__input"
          type="date"
          value={settings.start_date}
          onChange={(event) => onChange({ start_date: event.target.value })}
        />
      </label>

      <label className="inspector-field" htmlFor="trip-end-date">
        <span className="inspector-field__label">End date</span>
        <input
          id="trip-end-date"
          className="inspector-field__input"
          type="date"
          value={settings.end_date}
          onChange={(event) => onChange({ end_date: event.target.value })}
        />
      </label>
    </section>
  );
}
