import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        // Drizzle needs a direct/session connection for migrations. 
        // We prioritize DIRECT_URL, but fall back to DATABASE_URL if it's missing.
        url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
        ssl: {
            rejectUnauthorized: false,
        },
    },
});