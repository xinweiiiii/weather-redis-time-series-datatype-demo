export type WeatherPoint = { ts: number; tempC: number };
export type WeatherSeriesResponse = { city: string; points: WeatherPoint[] };
