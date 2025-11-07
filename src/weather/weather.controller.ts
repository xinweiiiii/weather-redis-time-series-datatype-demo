import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getWeather(@Query('city') city = 'Singapore') {
    return this.weatherService.getWeather(city);
  }

  @Get('series')
  getWeatherSeries(
    @Query('city') city = 'Singapore',
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.weatherService.getWeatherSeries(city, from, to);
  }
}
