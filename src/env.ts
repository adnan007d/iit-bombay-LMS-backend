import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(6969),
  NODE_ENV: z.string().default("development"),

  // DB
  PGHOST: z.string().min(1),
  PGDATABASE: z.string().min(1),
  PGUSER: z.string().min(1),
  PGPASSWORD: z.string().min(1),

  SSL_REQUIRE: z.string().transform((val) => val === "true"),
  ENDPOINT_ID: z.string(),

  // Logging
  ACCESS_LOG_FILE: z.string().default("access.log"),
  LOG_FILE: z.string().default("pretty.log"),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // For testing
  LIBRARIAN_PASSWORD: z.string().default("Admin@123"),
  USER_PASSWORD: z.string().default("User@123"),
});

const { data, success, error } = envSchema.safeParse(process.env);

if (!success) {
  console.error(error);
  process.exit(1);
}

const env = data;

export default env;
