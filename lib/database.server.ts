"use server";

import { Pool } from "pg";

const pool = new Pool({
    connectionString:
        "postgresql://neondb_owner:npg_KX2l1sVWRuDB@ep-winter-unit-ad3tfw03-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

export const revalidate = 0;

export async function getTableData() {
    try {
        const result = await pool.query(`
      SELECT image_id,
             file_path,
             status,
             processing_time,
             pipeline_step,
             step_message,
             time_of_run
      FROM panstarrs_pipeline.image_status
      ORDER BY image_id ASC
      LIMIT 100
    `);
        return result.rows;
    } catch (err) {
        console.error("Database error:", err);
        return [];
    }
}

export async function getSuccessOrFail() {
    try {
        const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'save') AS'success_count,
        COUNT(*) FILTER (WHERE status != 'save') AS failure_count,
        COUNT(*) AS total_count,
        AVG(processing_time) AS avg_processing_time,
        (
          SELECT pipeline_step
          FROM panstarrs_pipeline.image_status
          WHERE status != 'save'
          GROUP BY pipeline_step
          ORDER BY COUNT(*) DESC
          LIMIT 1
        ) AS most_problematic_step
      FROM panstarrs_pipeline.image_status
      WHERE time_of_run >= NOW() - INTERVAL '7 days'
    `);
        return result.rows[0];
    } catch (err) {
        console.error("Database error:", err);
        return null;
    }
}

export async function getRecentImageEvents() {
    try {
        const result = await pool.query(`
      SELECT image_id, file_path, status, pipeline_step, time_of_run
      FROM panstarrs_pipeline.image_status
      ORDER BY time_of_run DESC
      LIMIT 20
    `);

        const image_ids: number[] = [];
        const image_names: string[] = [];
        const statuses: string[] = [];
        const pipeline_steps: string[] = [];
        const times: string[] = [];

        for (const row of result.rows) {
            const { image_id, file_path, status, pipeline_step, time_of_run } = row;

            // Extract substring between last '/' and '.fits'
            const image_name = file_path
                ? file_path.substring(file_path.lastIndexOf("/") + 1, file_path.lastIndexOf(".fits"))
                : "unknown";

            image_ids.push(image_id);
            image_names.push(image_name);
            statuses.push(status);
            pipeline_steps.push(pipeline_step);
            times.push(time_of_run);
        }

        return {
            image_ids,
            image_names,
            statuses,
            pipeline_steps,
            times,
        };
    } catch (err) {
        console.error("Database error:", err);
        return {
            image_ids: [],
            image_names: [],
            statuses: [],
            pipeline_steps: [],
            times: [],
        };
    }
}
