import { Inject, Injectable } from '@nestjs/common';
import { type RedisClientType } from '@redis/client';
import { REDIS_CLIENT } from '../redis/redis.constants';

export interface WeatherData {
  city: string;
  tempC: number;
  conditions: string;
  updatedAt: string; // ISO string
}

export interface WeatherPoint {
  ts: number;
  tempC: number;
}

export interface WeatherSeriesResponse {
  city: string;
  from: string;
  to: string;
  points: WeatherPoint[];
}

@Injectable()
export class WeatherService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClientType) {}

  private key(city: string) {
    return `weather:${city.toLowerCase()}`;
  }

  private timeSeriesKey(city: string) {
    return `weather:ts:${city.toLowerCase()}`;
  }

  // TODO: Hook this up to a proper API and query by location weather
  async getWeather(city: string): Promise<WeatherData> {
    // Generate dummy data by random the weather temperature in degree
    const data: WeatherData = {
      city,
      tempC: 25 + Math.round(Math.random() * 5),
      conditions: 'Partly Cloudy',
      updatedAt: new Date().toISOString(),
    };

    // Store it in a cache
    await this.setWeather(this.key(city), data);

    return data;
  }

  async setWeather(city: string, data: WeatherData): Promise<void> {
    await this.redis.set(this.key(city), JSON.stringify(data));
  }

  async addWeatherPoint(city: string, tempC: number, timestamp?: number): Promise<void> {
    const ts = timestamp ?? Date.now();
    const tsKey = this.timeSeriesKey(city);

    try {
      // Use Redis TimeSeries TS.ADD command
      await this.redis.sendCommand(['TS.ADD', tsKey, ts.toString(), tempC.toString(), 'ON_DUPLICATE', 'LAST']);
    } catch (error: any) {
      // If time series doesn't exist, create it first
      if (error.message?.includes('key does not exist') || error.message?.includes('TSDB')) {
        await this.redis.sendCommand([
          'TS.CREATE',
          tsKey,
          'RETENTION',
          '86400000', // 24 hours retention in milliseconds
          'LABELS',
          'city',
          city,
          'metric',
          'temperature',
        ]);
        // Retry adding the point
        await this.redis.sendCommand(['TS.ADD', tsKey, ts.toString(), tempC.toString()]);
      } else {
        throw error;
      }
    }
  }

  async getWeatherSeries(
    city: string,
    from: string,
    to: string,
  ): Promise<WeatherSeriesResponse> {
    const fromMs = new Date(from).getTime();
    const toMs = new Date(to).getTime();
    const tsKey = this.timeSeriesKey(city);

    try {
      // Use Redis TimeSeries TS.RANGE command
      // TS.RANGE key fromTimestamp toTimestamp
      const result: any = await this.redis.sendCommand([
        'TS.RANGE',
        tsKey,
        fromMs.toString(),
        toMs.toString(),
      ]);

      // Result format: [[timestamp1, value1], [timestamp2, value2], ...]
      const points: WeatherPoint[] = result.map((item: any[]) => ({
        ts: parseInt(item[0]),
        tempC: parseFloat(item[1]),
      }));

      return {
        city,
        from,
        to,
        points,
      };
    } catch (error: any) {
      // If time series doesn't exist yet, return empty array
      if (error.message?.includes('key does not exist') || error.message?.includes('TSDB')) {
        return {
          city,
          from,
          to,
          points: [],
        };
      }
      throw error;
    }
  }
}
