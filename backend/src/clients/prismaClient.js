// src/clients/prismaClient.js
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

const adapter = new PrismaPg({
  connectionString: process.env.SUPABASE_URL_PRISMA,
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

export default prisma;
