import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Collection } from 'discord.js';
import { PG_CONNECTION } from '../constants';
import { DbType } from '../drizzle/drizzle.module';
import { clientLicense } from '../drizzle/schema';
import { APIException } from '../api/exception';

@Injectable()
export class LicenseService implements OnModuleInit {
  private cache = new Collection<string, typeof clientLicense.$inferSelect>();
  private logger = new Logger(LicenseService.name);

  constructor(@Inject(PG_CONNECTION) private readonly db: DbType) {}

  async onModuleInit() {
    const allLicenses = await this.db.select().from(clientLicense);
    for (const license of allLicenses) {
      this.cache.set(license.key, license);
    }
    this.logger.log('Cached: ' + allLicenses.length + ' licenses.');
  }

  async registerLicense(key: string, client: string) {
    const alreadyRegistered = this.cache.get(key);
    if (alreadyRegistered) {
      return new APIException('LICENSE_ALREADY_REGISTERED');
    }

    // size 24
    const secret = Math.random().toString(36).substring(2, 26);

    const result = await this.db
      .insert(clientLicense)
      .values([
        {
          key,
          client,
          secret
        }
      ])
      .returning();

    if (!result[0]) {
      return new APIException('LICENSE_REGISTRATION_FAILED');
    }

    this.cache.set(key, result[0]);

    return {
      key,
      secret
    };
  }

  async validateLicense(key: string, secret: string) {
    const license = this.cache.get(key);
    if (!license) {
      return {
        client: null,
        valid: false
      };
    }

    const valid = secret === license.secret;
    return {
      client: license.client,
      valid
    };
  }
}
