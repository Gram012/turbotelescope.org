import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_KX2l1sVWRuDB@ep-winter-unit-ad3tfw03-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

export const revalidate = 0;

interface TableRow {
  image_id: number;
  file_path: string;
  status: string;
  processing_time: number;
  pipeline_step: string;
  step_message: string;
  time_of_run: string;
}

async function getTableData(): Promise<Array<TableRow>> {
  try {
    const result = await pool.query(`
      SELECT * FROM panstarrs_pipeline.image_status
      ORDER BY image_id ASC
      LIMIT 100
    `);
    return result.rows as Array<TableRow>;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export default async function HomePage() {
  const tableData = await getTableData();

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "monospace",
      }}
    >
      <h1>Image Processing Database</h1>

      {tableData.length === 0 ? (
        <p>No data found in the table.</p>
      ) : (
        <table
          style={{
            border: "1px solid white",
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid white", padding: "8px" }}>
                Image ID
              </th>
              <th style={{ border: "1px solid white", padding: "8px" }}>
                File Path
              </th>
              <th style={{ border: "1px solid white", padding: "8px" }}>
                Status
              </th>
              <th style={{ border: "1px solid white", padding: "8px" }}>
                Processing Time
              </th>
              <th style={{ border: "1px solid white", padding: "8px" }}>
                Pipeline Step
              </th>
              <th style={{ border: "1px solid white", padding: "8px" }}>
                Step Message
              </th>
              <th style={{ border: "1px solid white", padding: "8px" }}>
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.image_id}>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {row.image_id}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {row.file_path}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {row.status}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {row.processing_time}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {row.pipeline_step}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {row.step_message}
                </td>
                <td style={{ border: "1px solid white", padding: "8px" }}>
                  {row.time_of_run}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: "20px" }}>Total rows: {tableData.length}</p>
    </div>
  );
}
