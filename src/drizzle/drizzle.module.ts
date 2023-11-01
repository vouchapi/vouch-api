import { Global, Logger, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { DbConfig } from '../config';
import { PG_CONNECTION } from '../constants';
import * as schema from './schema';
import { DefaultLogger, LogWriter } from 'drizzle-orm';

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

        logger.debug('Connecting to Postgresql...');

        class CustomWriter implements LogWriter {
          write(message: string) {
            if (dbConfig.env === 'dev') {
              logger.debug(
                '\n\n------------- [DATABASE DEBUG QUERY] ------------\n\n' +
                  message +
                  '\n\n---------------------------------------------------'
              );
            }
          }
        }

        const dbLogger = new DefaultLogger({
          writer: new CustomWriter()
        });

        const db = drizzle(sql, {
          schema,
          logger: dbLogger
        });

        await migrate(db, { migrationsFolder: 'drizzle' });

        logger.debug('Connected to Postgresql!');

        return db;
      }
    }
  ],
  exports: [PG_CONNECTION]
})
export class DrizzleModule {}
export type DbType = PostgresJsDatabase<typeof schema>;
