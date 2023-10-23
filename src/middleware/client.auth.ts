import { Injectable, NestMiddleware } from '@nestjs/common';
import { LicenseService } from '../cache/license.cache';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class ClientAuthMiddleware implements NestMiddleware {
  constructor(private readonly licenseService: LicenseService) {}

  async use(
    req: FastifyRequest['raw'],
    res: FastifyReply['raw'],
    next: () => void
  ) {
    const key = req.headers['x-client-key'] as string;
    const secret = req.headers['x-client-secret'] as string;

    if (!key || !secret) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end('Unauthorized');
      return;
    }

    const valid = await this.licenseService.validateLicense(key, secret);
    if (!valid) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end('Unauthorized');
      return;
    }

    next();
  }
}
