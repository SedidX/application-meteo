import cityConfig from "../../config/city.json";

export default async function handler(req, res) {
  const { latitude, longitude, timezone, name, country } = cityConfig;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
    `weather_code,wind_speed_10m,wind_direction_10m,visibility,is_day` +
    `&daily=sunrise,sunset` +
    `&timezone=${encodeURIComponent(timezone)}` +
    `&forecast_days=1`;

  const response = await fetch(url);
  const raw = await response.json();

  if (raw.error) {
    return res.status(400).json({ error: raw.reason });
  }

  // Correspondance code météo WMO → description lisible
  const wmoDescriptions = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Icy fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Heavy freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snowfall", 73: "Moderate snowfall", 75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
  };

  // Correspondance code WMO → nom d'icône compatible avec /public/icons/
  const wmoToIcon = (code, isDay) => {
    const d = isDay ? "d" : "n";
    if (code === 0)           return `01${d}`;
    if (code <= 2)            return `02${d}`;
    if (code === 3)           return `04${d}`;
    if (code <= 48)           return `50${d}`;
    if (code <= 57)           return `09${d}`;
    if (code <= 67)           return `10${d}`;
    if (code <= 77)           return `13${d}`;
    if (code <= 82)           return `09${d}`;
    if (code <= 86)           return `13${d}`;
    return `11${d}`;
  };

  const cur = raw.current;
  const code = cur.weather_code;
  const isDay = cur.is_day === 1;
  const utcOffsetSeconds = raw.utc_offset_seconds;

  // Lever/coucher du soleil en format ISO string → conversion en timestamp Unix
  const toUnix = (iso) => Math.floor(new Date(iso).getTime() / 1000);

  // Normalisation de la réponse pour correspondre à la structure attendue par les composants
  const normalized = {
    name,
    sys: {
      country,
      sunrise: toUnix(raw.daily.sunrise[0]),
      sunset: toUnix(raw.daily.sunset[0]),
    },
    weather: [
      {
        description: wmoDescriptions[code] ?? "Unknown",
        icon: wmoToIcon(code, isDay),
      },
    ],
    main: {
      temp: cur.temperature_2m,
      feels_like: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
    },
    wind: {
      speed: cur.wind_speed_10m / 3.6, // km/h → m/s pour correspondre aux attentes de helpers.js
      deg: cur.wind_direction_10m,
    },
    visibility: cur.visibility ?? 10000, // meters
    // dt doit être en secondes Unix UTC ; le décalage horaire est appliqué séparément
    dt: Math.floor(new Date(cur.time).getTime() / 1000) - utcOffsetSeconds,
    timezone: utcOffsetSeconds,
  };

  res.status(200).json(normalized);
}
