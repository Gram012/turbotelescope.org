// lib/db.ts
import { Pool, type QueryResult, type QueryResultRow, type PoolClient } from "pg";

const connectionString = process.env.DATABASE_URL!;

export const pool = new Pool({
    connectionString,
    // If your DB needs TLS in prod, either add ?sslmode=require to the URL
    // or uncomment the line below:
    // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> {
    return pool.query<T>(text, params);
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
): Promise<T | null> {
    const { rows } = await pool.query<T>(text, params);
    return rows[0] ?? null;
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}
