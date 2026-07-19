import requests

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    56: "Light freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    99: "Thunderstorm with heavy hail",
}


def weather_label(code: int | None) -> str | None:
    if code is None:
        return None
    return WMO_CODES.get(code, "Unknown")


def get_trip_weather(*, latitude, longitude, start_date, end_date):
    response = requests.get(
        FORECAST_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "timezone": "auto",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "current": "temperature_2m,weather_code,wind_speed_10m",
            "daily": ",".join(
                [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_sum",
                    "wind_speed_10m_max",
                    "sunrise",
                    "sunset",
                ]
            ),
        },
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()

    current = data.get("current", {})
    daily = data.get("daily", {})
    daily_units = data.get("daily_units", {})
    current_units = data.get("current_units", {})

    times = daily.get("time", [])
    codes = daily.get("weather_code", [])
    max_temps = daily.get("temperature_2m_max", [])
    min_temps = daily.get("temperature_2m_min", [])
    precipitation = daily.get("precipitation_sum", [])
    max_wind = daily.get("wind_speed_10m_max", [])
    sunrises = daily.get("sunrise", [])
    sunsets = daily.get("sunset", [])

    forecast_days = []
    for i, day in enumerate(times):
        code = codes[i] if i < len(codes) else None
        forecast_days.append(
            {
                "date": day,
                "weather_code": code,
                "weather_label": weather_label(code),
                "temperature_max": max_temps[i] if i < len(max_temps) else None,
                "temperature_min": min_temps[i] if i < len(min_temps) else None,
                "precipitation_sum": precipitation[i] if i < len(precipitation) else None,
                "wind_speed_max": max_wind[i] if i < len(max_wind) else None,
                "sunrise": sunrises[i] if i < len(sunrises) else None,
                "sunset": sunsets[i] if i < len(sunsets) else None,
            }
        )

    current_code = current.get("weather_code")

    return {
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "timezone": data.get("timezone"),
        "timezone_abbreviation": data.get("timezone_abbreviation"),
        "current": {
            "time": current.get("time"),
            "temperature": current.get("temperature_2m"),
            "temperature_unit": current_units.get("temperature_2m"),
            "weather_code": current_code,
            "weather_label": weather_label(current_code),
            "wind_speed": current.get("wind_speed_10m"),
            "wind_speed_unit": current_units.get("wind_speed_10m"),
        },
        "daily_units": {
            "temperature": daily_units.get("temperature_2m_max"),
            "precipitation": daily_units.get("precipitation_sum"),
            "wind_speed": daily_units.get("wind_speed_10m_max"),
        },
        "days": forecast_days,
    }