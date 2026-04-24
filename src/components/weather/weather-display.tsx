"use client";

import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, CloudDrizzle, CloudFog, Zap, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeatherData {
  temperature?: string | number;
  conditions?: string;
  windSpeed?: string;
  humidity?: string | number;
}

interface WeatherDisplayProps {
  weather: WeatherData;
}

function getWeatherIcon(conditions: string) {
  const condition = conditions.toLowerCase();

  if (condition.includes("rain") || condition.includes("shower")) {
    return <CloudRain className="h-16 w-16 text-blue-500" />;
  }
  if (condition.includes("drizzle")) {
    return <CloudDrizzle className="h-16 w-16 text-blue-400" />;
  }
  if (condition.includes("snow")) {
    return <CloudSnow className="h-16 w-16 text-blue-300" />;
  }
  if (condition.includes("thunder") || condition.includes("storm")) {
    return <Zap className="h-16 w-16 text-yellow-500" />;
  }
  if (condition.includes("fog") || condition.includes("mist")) {
    return <CloudFog className="h-16 w-16 text-gray-400" />;
  }
  if (condition.includes("cloud") || condition.includes("overcast")) {
    return <Cloud className="h-16 w-16 text-gray-500" />;
  }
  if (condition.includes("clear") || condition.includes("sunny")) {
    return <Sun className="h-16 w-16 text-yellow-500" />;
  }

  return <Cloud className="h-16 w-16 text-gray-400" />;
}

function getWeatherTips(weather: WeatherData): { type: "warning" | "info"; tips: string[] } {
  const tips: string[] = [];
  let type: "warning" | "info" = "info";

  const conditions = weather.conditions?.toLowerCase() || "";
  const temp = typeof weather.temperature === "string" ? parseFloat(weather.temperature) : weather.temperature;
  const humidity = typeof weather.humidity === "string" ? parseFloat(weather.humidity) : weather.humidity;
  const windSpeed = weather.windSpeed?.toLowerCase() || "";

  if (conditions.includes("rain") || conditions.includes("shower")) {
    type = "warning";
    tips.push("Bring waterproof gear and extra tarps - heavy rain expected");
    tips.push("Document water damage with photos immediately upon arrival");
    tips.push("Watch for flooded roads and allow extra travel time");
  }

  if (conditions.includes("thunder") || conditions.includes("storm")) {
    type = "warning";
    tips.push("Pack flashlights and backup batteries - power outages likely");
    tips.push("Avoid touching metal equipment during lightning activity");
    tips.push("Wait 30 minutes after last thunder before outdoor work");
  }

  if (conditions.includes("snow")) {
    type = "warning";
    tips.push("Use 4WD vehicle and bring tire chains if available");
    tips.push("Pack emergency blankets and hand warmers");
    tips.push("Allow 2x normal travel time for road conditions");
  }

  if (windSpeed.includes("mph") || windSpeed.includes("kph")) {
    const speed = parseFloat(windSpeed);
    if (speed > 25) {
      type = "warning";
      tips.push("Secure all loose equipment - high winds forecast");
      tips.push("Wear safety goggles to protect from flying debris");
      tips.push("Avoid working near trees or power lines");
    }
  }

  if (humidity && humidity > 80) {
    tips.push("Set up dehumidifiers within first 24 hours");
    tips.push("Check for mold growth in damp areas");
  }

  if (temp && temp > 90) {
    tips.push("Bring extra water bottles and electrolyte drinks");
    tips.push("Take cooling breaks every 30-45 minutes");
    tips.push("Wear light-colored, breathable clothing");
  }

  if (temp && temp < 32) {
    type = "warning";
    tips.push("Dress in layers with insulated boots and gloves");
    tips.push("Bring ice melt and watch for slippery surfaces");
    tips.push("Check on residents for hypothermia symptoms");
  }

  if (conditions.includes("fog") || conditions.includes("mist")) {
    tips.push("Use fog lights and drive slowly");
    tips.push("Bring reflective vest for visibility");
  }

  if (tips.length === 0) {
    tips.push("Good conditions - no special equipment needed");
    tips.push("Stay updated on weather changes");
  }

  return { type, tips };
}

export function WeatherDisplay({ weather }: WeatherDisplayProps) {
  const { type, tips } = getWeatherTips(weather);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {weather.conditions && getWeatherIcon(weather.conditions)}
            </div>
            <div className="flex-1 space-y-2">
              {weather.temperature && (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{weather.temperature}</span>
                  <span className="text-2xl text-muted-foreground">°F</span>
                </div>
              )}
              {weather.conditions && (
                <p className="text-lg font-medium text-muted-foreground capitalize">
                  {weather.conditions}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {weather.windSpeed && (
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <Wind className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Wind Speed</p>
                  <p className="text-sm font-semibold">{weather.windSpeed}</p>
                </div>
              </div>
            )}
            {weather.humidity && (
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <Droplets className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="text-sm font-semibold">{weather.humidity}%</p>
                </div>
              </div>
            )}
          </div>

          {tips.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex gap-3">
                <div className={`rounded-full p-2 shrink-0 h-fit ${type === "warning" ? "bg-destructive/10" : "bg-primary/10"}`}>
                  <Lightbulb className={`h-4 w-4 ${type === "warning" ? "text-destructive" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-3">Tips</p>
                  <ul className="list-disc list-outside ml-4 space-y-2">
                    {tips.map((tip, index) => (
                      <li key={index} className="text-sm leading-relaxed text-foreground">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
