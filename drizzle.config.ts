import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString:
      process.env.NODE_ENV === 'prod'
        ? process.env.PROD_BRANCH_URL
        : process.env.DEV_BRANCH_URL,
    ssl: false
  }
} satisfies Config;
