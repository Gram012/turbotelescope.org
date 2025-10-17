// lib/database.server.ts
import "server-only";
import { Pool } from "pg";

// Neon pool (hard-coded like your snippet)
const pool = new Pool({
    connectionString:
        "postgresql://neondb_owner:npg_KX2l1sVWRuDB@ep-winter-unit-ad3tfw03-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

export const revalidate = 0;

/**
 * Success / Failure KPIs over the last 7 days (+ delta vs previous 7 days).
 * Matches the fields your DashboardContent consumes.
 */
export async function getSuccessOrFail(): Promise<{
    success: number;
    failure: number;
    total: number;
    delta: { total: number; successRate: number };
    most_problematic_step: { pipeline_step: string; failures: number } | null;
}> {
    // Success is defined by pipeline_step = 'save' on the LATEST row per image_id.
    // We compute against the last 7 days, and delta vs the previous 7-day window.

    const text = `
    WITH bounds AS (
      SELECT
        now() - interval '7 days'  AS start_curr,
        now()                      AS end_curr,
        now() - interval '14 days' AS start_prev,
        now() - interval '7 days'  AS end_prev
    ),

    -- Current window: keep only latest row per image_id
    curr_raw AS (
      SELECT s.*
      FROM panstarrs_pipeline.image_status s
      WHERE s.time_of_run >= (SELECT start_curr FROM bounds)
        AND s.time_of_run <  (SELECT end_curr   FROM bounds)
    ),
    curr_latest AS (
      SELECT DISTINCT ON (image_id)
             image_id, pipeline_step, status, time_of_run
      FROM curr_raw
      ORDER BY image_id, time_of_run DESC
    ),

    -- Previous window: keep only latest row per image_id
    prev_raw AS (
      SELECT s.*
      FROM panstarrs_pipeline.image_status s
      WHERE s.time_of_run >= (SELECT start_prev FROM bounds)
        AND s.time_of_run <  (SELECT end_prev   FROM bounds)
    ),
    prev_latest AS (
      SELECT DISTINCT ON (image_id)
             image_id, pipeline_step, status, time_of_run
      FROM prev_raw
      ORDER BY image_id, time_of_run DESC
    ),

    curr_agg AS (
      SELECT
        COUNT(*)                                                   AS total,
        COUNT(*) FILTER (WHERE pipeline_step = 'save')            AS success,
        COUNT(*) FILTER (WHERE pipeline_step <> 'save')           AS failure
      FROM curr_latest
    ),
    prev_agg AS (
      SELECT
        COUNT(*)                                                   AS total,
        COUNT(*) FILTER (WHERE pipeline_step = 'save')            AS success
      FROM prev_latest
    ),

    -- Which step most often appears as the latest non-success?
    worst_step AS (
      SELECT pipeline_step, COUNT(*) AS failures
      FROM curr_latest
      WHERE pipeline_step <> 'save'
      GROUP BY pipeline_step
      ORDER BY failures DESC NULLS LAST
      LIMIT 1
    )

    SELECT
      curr_agg.total::int                                AS total,
      curr_agg.success::int                              AS success,
      curr_agg.failure::int                              AS failure,
      (curr_agg.total - prev_agg.total)                  AS delta_total,
      (
        COALESCE(curr_agg.success::numeric, 0) / NULLIF(curr_agg.total::numeric, 0)
        -
        COALESCE(prev_agg.success::numeric, 0) / NULLIF(prev_agg.total::numeric, 0)
      )                                                  AS delta_success_rate,
      (SELECT jsonb_build_object('pipeline_step', pipeline_step, 'failures', failures)
         FROM worst_step)                                AS most_problematic_step
    FROM curr_agg, prev_agg;
  `;

    const { rows } = await pool.query(text);
    const r = rows[0] ?? {
        total: 0,
        success: 0,
        failure: 0,
        delta_total: 0,
        delta_success_rate: 0,
        most_problematic_step: null,
    };

    return {
        success: Number(r.success || 0),
        failure: Number(r.failure || 0),
        total: Number(r.total || 0),
        delta: {
            total: Number(r.delta_total || 0),
            successRate: Number(r.delta_success_rate || 0),
        },
        most_problematic_step: r.most_problematic_step
            ? {
                pipeline_step: r.most_problematic_step.pipeline_step as string,
                failures: Number(r.most_problematic_step.failures || 0),
            }
            : null,
    };
}

/**
 * Recent image events: returns column arrays and derives image_names from file_path.
 */
export async function getRecentImageEvents(): Promise<{
    image_ids: number[];
    image_names: string[];
    statuses: string[];
    pipeline_steps: string[];
    times: string[];
}> {
    const { rows } = await pool.query(
        `
      SELECT image_id, file_path, status, pipeline_step, time_of_run
      FROM panstarrs_pipeline.image_status
      ORDER BY time_of_run DESC, image_id DESC
      LIMIT 20
    `
    );

    const image_ids: number[] = [];
    const image_names: string[] = [];
    const statuses: string[] = [];
    const pipeline_steps: string[] = [];
    const times: string[] = [];

    for (const row of rows) {
        const { image_id, file_path, status, pipeline_step, time_of_run } = row;
        const base = typeof file_path === "string" ? file_path : "";
        const slash = base.lastIndexOf("/") + 1;
        const dot = base.toLowerCase().lastIndexOf(".fits");
        const name =
            slash > 0 && dot > slash ? base.substring(slash, dot) : base || "unknown";

        image_ids.push(Number(image_id));
        image_names.push(name);
        statuses.push(String(status));
        pipeline_steps.push(String(pipeline_step));
        times.push(String(time_of_run));
    }

    return { image_ids, image_names, statuses, pipeline_steps, times };
}
