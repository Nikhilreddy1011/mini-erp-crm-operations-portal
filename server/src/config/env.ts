import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.string().default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().default('super_secret_jwt_key_for_mini_erp_crm_ops_portal_2026'),
  JWT_EXPIRES_IN: z.string().default('1d')
});

export const env = envSchema.parse(process.env);
