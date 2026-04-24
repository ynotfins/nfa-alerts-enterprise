import { NextResponse } from "next/server";

interface WeatherData {
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  icon: string;
  isDaytime: boolean;
  forecast: ForecastPeriod[];
}

interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  isDaytime: boolean;
  shortForecast: string;
  windSpeed: string;
  probabilityOfPrecipitation: number;
}

interface WeatherApiPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  icon: string;
  isDaytime: boolean;
  probabilityOfPrecipitation?: { value: number };
}

const WEATHER_CACHE = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const cacheKey = `${lat},${lng}`;
  const cached = WEATHER_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const pointsResponse = await fetch(
      `https://api.weather.gov/points/${lat},${lng}`,
      {
        headers: {
          "User-Agent": "(NFA Alerts, contact@nfa.com)",
        },
      }
    );

    if (!pointsResponse.ok) {
      throw new Error("Failed to fetch weather points");
    }

    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties.forecast;

    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        "User-Agent": "(NFA Alerts, contact@nfa.com)",
      },
    });

    if (!forecastResponse.ok) {
      throw new Error("Failed to fetch forecast");
    }

    const forecastData = await forecastResponse.json();
    const currentPeriod = forecastData.properties.periods[0];
    const forecastPeriods = forecastData.properties.periods.slice(0, 14);

    const weatherData = {
      temperature: currentPeriod.temperature,
      temperatureUnit: currentPeriod.temperatureUnit,
      windSpeed: currentPeriod.windSpeed,
      windDirection: currentPeriod.windDirection,
      shortForecast: currentPeriod.shortForecast,
      detailedForecast: currentPeriod.detailedForecast,
      icon: currentPeriod.icon,
      isDaytime: currentPeriod.isDaytime,
      forecast: forecastPeriods.map((period: WeatherApiPeriod) => ({
        name: period.name,
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        isDaytime: period.isDaytime,
        shortForecast: period.shortForecast,
        windSpeed: period.windSpeed,
        probabilityOfPrecipitation: period.probabilityOfPrecipitation?.value || 0,
      })),
    };

    WEATHER_CACHE.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
