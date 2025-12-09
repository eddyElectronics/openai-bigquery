// bigquery.js
import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery();

/**
 * รัน SQL บน BigQuery แบบ read-only
 */
export async function runBigQuery(sql) {
  const upper = sql.toUpperCase();
  const blockedKeywords = ["INSERT", "UPDATE", "DELETE", "ALTER", "DROP", "TRUNCATE"];
  if (blockedKeywords.some(k => upper.includes(k))) {
    throw new Error("Only SELECT queries are allowed.");
  }

  const [job] = await bigquery.createQueryJob({ query: sql });
  const [rows] = await job.getQueryResults();
  return rows;
}
