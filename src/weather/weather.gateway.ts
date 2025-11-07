import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WeatherService } from './weather.service';

@WebSocketGateway({ namespace: '/weather', cors: true })
export class WeatherGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly weatherService: WeatherService) {}

  handleConnection(client: any) {
    console.log('[WebSocket] Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('[WebSocket] Client disconnected:', client.id);
  }

  @SubscribeMessage('getWeather')
  async onGetWeather(@MessageBody() payload: { city?: string }) {
    const city = payload?.city ?? 'Singapore';

    const data = await this.weatherService.getWeather(city);

    // Store in time series format
    await this.weatherService.addWeatherPoint(city, data.tempC);

    return data;
  }
}
