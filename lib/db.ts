import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
export const pool = new Pool({
    connectionString,
    // If your DB requires SSL in prod, uncomment:
    // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

export async function query<T = any>(text: string, params?: any[]) {
    const res = await pool.query<T>(text, params);
    return res;
}