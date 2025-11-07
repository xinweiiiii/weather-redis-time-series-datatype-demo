import { Module, OnModuleDestroy } from '@nestjs/common';
import { createClient, type RedisClientType } from '@redis/client';
import { REDIS_CLIENT } from './redis.constants';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (): Promise<RedisClientType> => {
        const client = createClient({
          socket: {
            host: process.env.REDIS_HOST ?? 'localhost',
            port: Number(process.env.REDIS_PORT ?? 6379),
          },
          password: process.env.REDIS_PASSWORD,
        });

        client.on('error', (err) => {
          console.error('[Redis] Client error:', err);
        });

        if (!client.isOpen) {
          await client.connect();
        }

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  constructor() 
  {}

  async onModuleDestroy() {
  }
}
