import { Injectable, NestMiddleware } from '@nestjs/common';
import { LicenseService } from '../cache/license.cache';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class AppAuthMiddleware implements NestMiddleware {
  constructor(private readonly licenseService: LicenseService) {}

  async use(
    req: FastifyRequest['raw'],
    res: FastifyReply['raw'],
    next: () => void
  ) {
    const barerToken = req.headers.authorization;
    if (!barerToken) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end('Unauthorized');
      return;
    }

    if (!barerToken.startsWith('Bearer ')) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end('Unauthorized');
      return;
    }

    const token = barerToken.split(' ')[1];

    const valid = token === process.env.APP_TOKEN;

    if (!valid) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end('Unauthorized');
      return;
    }

    next();
  }
}
