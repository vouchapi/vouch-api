export const API_ENDPOINT = 'https://discord.com/api/v10';
export const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';
export const BOT_TOKEN = process.env['BOT_TOKEN'];

import { registerAs } from '@nestjs/config';

export const DbConfig = registerAs('db', () => ({
  env: process.env.NODE_ENV,
  prodBranchUrl: process.env.PROD_BRANCH_URL,
  devBranchUrl: process.env.DEV_BRANCH_URL
}));
