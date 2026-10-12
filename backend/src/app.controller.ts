import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('redis-test')
  async testRedis() {
    const key = 'redis:test';
    const value = `Redis connected at ${new Date().toISOString()}`;

    await this.redisService.set(key, value, 60);
    const storedValue = await this.redisService.get(key);

    return {
      success: storedValue === value,
      message: storedValue === value
        ? 'NestJS can write to and read from Redis.'
        : 'Redis value did not match.',
      value: storedValue,
    };
  }
}
