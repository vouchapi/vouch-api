import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { LicenseService } from '../../cache/license.cache';

@Controller()
export class AppController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Post('register')
  register(@Body() body: { key: string; client: string }) {
    if (!body || !body.key || !body.client) {
      return new HttpException('Invalid request', 400, {
        cause: 'KEY_OR_client_MISSING',
        description: 'Key or Client missing'
      });
    }

    return this.licenseService.registerLicense(body.key, body.client);
  }
}
