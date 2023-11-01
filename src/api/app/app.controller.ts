import { Body, Controller, Get, Post } from '@nestjs/common';
import { LicenseService } from '../../cache/license.cache';
import { APIException } from '../exception';

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
      return new APIException('AUTH_HEADER_MISSING');
    }

    return this.licenseService.registerLicense(body.key, body.client);
  }
}
