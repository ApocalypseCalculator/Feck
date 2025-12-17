import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../prisma/generated/client';

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set.");
    process.exit(1);
}

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL
}, {
    timestampFormat: 'unixepoch-ms'
});

const prisma = new PrismaClient({
    adapter: adapter
});

export default prisma;