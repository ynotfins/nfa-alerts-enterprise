"use client";

interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  isDaytime: boolean;
  shortForecast: string;
  windSpeed: string;
  probabilityOfPrecipitation: number;
}

interface WeatherHeatmapProps {
  forecast: ForecastPeriod[];
}

const getTemperatureColor = (temp: number, min: number, max: number) => {
  const range = max - min;
  const normalized = (temp - min) / range;

  if (normalized < 0.2) return "bg-blue-500";
  if (normalized < 0.4) return "bg-cyan-500";
  if (normalized < 0.6) return "bg-yellow-500";
  if (normalized < 0.8) return "bg-orange-500";
  return "bg-red-500";
};

const getTemperatureOpacity = (temp: number, min: number, max: number) => {
  const range = max - min;
  const normalized = (temp - min) / range;
  return Math.max(0.3, normalized);
};

export function WeatherHeatmap({ forecast }: WeatherHeatmapProps) {
  if (!forecast || forecast.length === 0) return null;

  const temps = forecast.map(p => p.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>7-Day Forecast</span>
        <span>{minTemp}° - {maxTemp}°</span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {forecast.slice(0, 14).map((period, idx) => {
          const color = getTemperatureColor(period.temperature, minTemp, maxTemp);
          const opacity = getTemperatureOpacity(period.temperature, minTemp, maxTemp);

          return (
            <div
              key={idx}
              className="relative group"
            >
              <div
                className={`${color} rounded p-2 transition-all hover:scale-105 cursor-pointer`}
                style={{ opacity }}
              >
                <div className="text-center">
                  <div className="text-[10px] font-medium text-white truncate">
                    {period.name.split(' ')[0]}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {period.temperature}°
                  </div>
                </div>
              </div>

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-popover text-popover-foreground rounded-lg shadow-lg p-3 text-xs w-48 border">
                  <div className="font-semibold mb-1">{period.name}</div>
                  <div className="space-y-0.5 text-muted-foreground">
                    <div>{period.temperature}°{period.temperatureUnit}</div>
                    <div>{period.shortForecast}</div>
                    <div>Wind: {period.windSpeed}</div>
                    {period.probabilityOfPrecipitation > 0 && (
                      <div>Precip: {period.probabilityOfPrecipitation}%</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Cold</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Mild</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Hot</span>
        </div>
      </div>
    </div>
  );
}
