import 'dotenv/config';
import { z } from 'zod';
export const env = z
  .object({
    DATABASE_URL: z.string().url(),
    HOST: z.string().default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4101),
    CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  })
  .parse(process.env);
