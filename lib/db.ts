import { Pool, Client, PoolConfig, QueryResultRow } from "pg";

/**
 * Creates a PostgreSQL connection configuration from environment variables.
 * 
 * Environment variables:
 * - PGHOST: Database host (default: localhost)
 * - PGPORT: Database port (default: 5432)
 * - PGUSER: Database user (default: postgres)
 * - PGPASSWORD: Database password
 * - PGDATABASE: Database name (default: postgres)
 * - PGSSLMODE: SSL mode - "require", "prefer", "disable" (default: false/disable)
 */
function getDbConfig(): PoolConfig {
    const sslMode = process.env.PGSSLMODE;
    let ssl: boolean | { rejectUnauthorized: boolean } = false;

    if (sslMode === "require") {
        ssl = { rejectUnauthorized: false };
    } else if (sslMode === "prefer") {
        ssl = { rejectUnauthorized: false };
    } else if (sslMode === "disable" || !sslMode) {
        ssl = false;
    }

    return {
        host: process.env.PGHOST || "localhost",
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || "postgres",
        ssl,
    };
}

/**
 * Shared database connection pool for server-side operations.
 * Use this for most database operations to benefit from connection pooling.
 */
export const pool = new Pool(getDbConfig());

/**
 * Creates a new database client for one-off operations.
 * Remember to call client.end() when done.
 */
export function createClient(): Client {
    const config = getDbConfig();
    return new Client(config);
}

/**
 * Helper function to execute parameterized queries using the pool.
 * This provides a similar API to @vercel/postgres sql template tag.
 */
export async function query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
): Promise<{ rows: T[] }> {
    const result = await pool.query<T>(text, params);
    return { rows: result.rows };
}

