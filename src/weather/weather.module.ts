import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherGateway } from './weather.gateway';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [RedisModule],
    controllers: [WeatherController],
    providers: [WeatherService, WeatherGateway],
    exports: [WeatherService],
})
export class WeatherModule {}
