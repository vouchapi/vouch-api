import { Global, Logger, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DbConfig } from '../config';
import { PG_CONNECTION } from '../constants';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: PG_CONNECTION,
      inject: [DbConfig.KEY],
      useFactory: async (dbConfig: ConfigType<typeof DbConfig>) => {
        const sql = postgres(
          dbConfig.env === 'dev'
            ? dbConfig.devBranchUrl!
            : dbConfig.prodBranchUrl!
        );

        const logger = new Logger('DB');

        logger.debug('Connecting to Progresql...');

        const db = drizzle(sql, {
          schema
        });

        logger.debug('Connected to Progresql!');

        return db;
      }
    }
  ],
  exports: [PG_CONNECTION]
})
export class DrizzleModule {}
export type DbType = PostgresJsDatabase<typeof schema>;
