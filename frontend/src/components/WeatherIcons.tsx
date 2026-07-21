import type { ComponentType, SVGProps } from "react";

type WeatherIconProps = SVGProps<SVGSVGElement>;

function SunIcon(props: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M12 2.5v3" />
        <path d="M12 18.5v3" />
        <path d="M2.5 12h3" />
        <path d="M18.5 12h3" />
        <path d="M5.2 5.2l2.2 2.2" />
        <path d="M16.6 16.6l2.2 2.2" />
        <path d="M18.8 5.2l-2.2 2.2" />
        <path d="M7.4 16.6l-2.2 2.2" />
      </g>
    </svg>
  );
}

function CloudIcon(props: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7.5 18.5h9.2a4.3 4.3 0 0 0 .6-8.6A5.8 5.8 0 0 0 6.1 8.3 4.2 4.2 0 0 0 7.5 18.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloudSunIcon(props: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="9" cy="8" r="3" fill="currentColor" opacity="0.9" />
      <g
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      >
        <path d="M9 2.3v1.8" />
        <path d="M9 11.9v1.8" />
        <path d="M3.3 8h1.8" />
        <path d="M12.9 8h1.8" />
      </g>
      <path
        d="M8 19h8.7a4 4 0 0 0 .5-8 5.4 5.4 0 0 0-10.4-1.2A3.9 3.9 0 0 0 8 19Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloudRainIcon(props: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7.5 15.5h9.2a4.3 4.3 0 0 0 .6-8.6A5.8 5.8 0 0 0 6.1 5.3 4.2 4.2 0 0 0 7.5 15.5Z"
        fill="currentColor"
      />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 17.5l-1 2.2" />
        <path d="M13 17.5l-1 2.2" />
        <path d="M17 17.5l-1 2.2" />
      </g>
    </svg>
  );
}

function CloudSnowIcon(props: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7.5 15.5h9.2a4.3 4.3 0 0 0 .6-8.6A5.8 5.8 0 0 0 6.1 5.3 4.2 4.2 0 0 0 7.5 15.5Z"
        fill="currentColor"
      />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M8.5 18.2h2.6" />
        <path d="M9.8 16.9v2.6" />
        <path d="M13.5 18.2h2.6" />
        <path d="M14.8 16.9v2.6" />
      </g>
    </svg>
  );
}

function CloudFogIcon(props: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7.5 13.5h9.2a4.3 4.3 0 0 0 .6-8.6A5.8 5.8 0 0 0 6.1 3.3 4.2 4.2 0 0 0 7.5 13.5Z"
        fill="currentColor"
      />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 17.2h12" />
        <path d="M7.5 20h9" />
      </g>
    </svg>
  );
}

function CloudLightningIcon(props: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7.5 14.5h9.2a4.3 4.3 0 0 0 .6-8.6A5.8 5.8 0 0 0 6.1 4.3 4.2 4.2 0 0 0 7.5 14.5Z"
        fill="currentColor"
      />
      <path
        d="M12.8 14.7l-2.5 3.8h2.1l-1.2 3.2 4-5.2h-2.1l1.3-1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function getWeatherIcon(
  label?: string | null,
  code?: number | null,
): ComponentType<WeatherIconProps> {
  const normalized = (label ?? "").toLowerCase();

  if (
    code === 0 ||
    normalized.includes("sunny") ||
    normalized.includes("clear sky")
  ) {
    return SunIcon;
  }

  if (
    code === 1 ||
    code === 2 ||
    normalized.includes("partly cloudy") ||
    normalized.includes("mainly clear")
  ) {
    return CloudSunIcon;
  }

  if (
    code === 3 ||
    normalized.includes("cloudy") ||
    normalized.includes("overcast")
  ) {
    return CloudIcon;
  }

  if (
    code === 45 ||
    code === 48 ||
    normalized.includes("fog") ||
    normalized.includes("mist")
  ) {
    return CloudFogIcon;
  }

  if (
    [71, 73, 75, 77, 85, 86].includes(code ?? -1) ||
    normalized.includes("snow")
  ) {
    return CloudSnowIcon;
  }

  if ([95, 96, 99].includes(code ?? -1) || normalized.includes("thunder")) {
    return CloudLightningIcon;
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code ?? -1) ||
    normalized.includes("rain") ||
    normalized.includes("drizzle") ||
    normalized.includes("showers")
  ) {
    return CloudRainIcon;
  }

  return CloudIcon;
}
