import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { LicenseService } from '../cache/license.cache';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface ClientAuthRequest extends FastifyRequest {
  client: string;
}

@Injectable()
export class ClientAuthMiddleware implements NestMiddleware {
  constructor(private readonly licenseService: LicenseService) {}

  async use(req: ClientAuthRequest, _: FastifyReply['raw'], next: () => void) {
    const key = req.headers['x-client-key'] as string;
    const secret = req.headers['x-client-secret'] as string;

    if (!key || !secret) {
      throw new HttpException('Unauthorized', 401);
    }

    const { valid, client } = await this.licenseService.validateLicense(
      key,
      secret
    );
    if (!valid || !client) {
      throw new HttpException('Unauthorized', 401);
    }

    req.client = client;

    next();
  }
}
