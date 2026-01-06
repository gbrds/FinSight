import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.SUPABASE_URL_PRISMA,
  },
  generator: {
    client: {
      provider: "prisma-client-js",
      engineType: "binary", // <---- THIS IS KEY
    },
  },
  migrations: {
    path: "prisma/migrations",
  },
});