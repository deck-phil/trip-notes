import {useQuery} from "@tanstack/react-query";
import {api} from "../services/api";
import type {TripWeather} from "../types/trip";
import {getWeatherIcon} from "./WeatherIcons";

type Props = {
  tripId: string;
};

function formatNumber(value: number | null, unit = "") {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return `${Math.round(value)}${unit}`;
}

function formatDayLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export default function WeatherPanel({tripId}: Props) {
  const {
    data: weather,
    isPending,
    isError,
  } = useQuery<TripWeather | null>({
    queryKey: ["weather", tripId],
    queryFn: () => api.getWeather(tripId),
  });

  if (isPending) {
    return <p className="panel-meta">Loading weather...</p>;
  }

  if (
      isError ||
      !weather ||
      !Array.isArray(weather.days) ||
      weather.days.length === 0
  ) {
    return null;
  }

  const temperatureUnit = weather.daily_units.temperature ?? "°";
  const precipitationUnit = weather.daily_units.precipitation ?? "";
  const windUnit =
      weather.daily_units.wind_speed ?? weather.current.wind_speed_unit ?? "";

  return (
      <>
        <div className="weather-current">
          <p className="weather-temp">
            {weather.current.temperature !== null
                ? `${Math.round(weather.current.temperature)}${weather.current.temperature_unit ?? ""}`
                : "—"}
          </p>

          <p className="weather-summary">
            {weather.current.weather_label ?? "No current conditions"}
          </p>

          <p className="weather-meta">
            Wind: {formatNumber(weather.current.wind_speed, weather.current.wind_speed_unit ?? "")}
          </p>
        </div>

        <ul className="weather-list">
          {weather.days.map((day) => {
            const DayIcon = getWeatherIcon(day.weather_label, day.weather_code);

            return (
                <li key={day.date} className="weather-row">
                  <div className="weather-day-main">
                    <div className="weather-day-heading">
                      <DayIcon className="weather-icon"/>
                      <p className="weather-day-label">{formatDayLabel(day.date)}</p>
                    </div>

                    <p className="weather-day-summary">
                      {day.weather_label ?? "Unknown"}
                    </p>
                  </div>

                  <p className="weather-day-range">
                    {formatNumber(day.temperature_max, temperatureUnit)} /{" "}
                    {formatNumber(day.temperature_min, temperatureUnit)}
                  </p>

                  <div className="weather-day-extra">
                    {Number(day.precipitation_sum) > 1 ? (
                        <>
                          <span>
                            Precip: {formatNumber(day.precipitation_sum, precipitationUnit)}
                          </span>
                          &nbsp;
                        </>
                    ) : null}
                    <span>
                  Wind: {formatNumber(day.wind_speed_max, windUnit)}
                </span>
                  </div>
                </li>
            );
          })}
        </ul>
      </>
  );
}