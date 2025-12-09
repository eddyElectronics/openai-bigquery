// sqlBuilder.js

/**
 * สร้าง SQL query จาก argument ของฟังก์ชัน get_flight_statistics_from_APPS
 * 
 * args = {
 *   start_date, end_date, airports, flight_directions, airline_codes,
 *   origin_destinations, metrics, nationalities, group_by, limit
 * }
 */

export function buildSQL_APPS(args) {
  const {
    start_date,
    end_date,
    airports,
    flight_directions,
    airline_codes,
    origin_destinations,
    metrics,
    nationalities,
    group_by,
    limit = 1000
  } = args;

  // ---------- SELECT ----------
  let selectClauses = [];

  metrics.forEach(m => {
    if (m === "flight_count") {
      selectClauses.push("COUNT(DISTINCT FLIGHT_NO) AS flight_count");
    }

    if (m === "total_pax") {
      selectClauses.push("SUM(TOTAL_PAX) AS total_pax");
    }

    if (m === "pax_by_gender") {
      selectClauses.push("SUM(MALE) AS male_pax");
      selectClauses.push("SUM(FEMALE) AS female_pax");
      selectClauses.push("SUM(UNKNOW) AS unknown_gender_pax");
    }

    if (m === "pax_by_age_group") {
      selectClauses.push("SUM(UNDER16) AS pax_under16");
      selectClauses.push("SUM(UNDER26) AS pax_under26");
      selectClauses.push("SUM(UNDER46) AS pax_under46");
      selectClauses.push("SUM(UNDER66) AS pax_under66");
      selectClauses.push("SUM(OVER66) AS pax_over66");
    }

    if (m === "pax_by_nationality") {
      if (Array.isArray(nationalities)) {
        nationalities.forEach(nat => {
          selectClauses.push(`SUM(${nat}) AS pax_${nat.toLowerCase()}`);
        });
      }
    }
  });

  // ถ้าไม่มี metric เลย (ไม่ควรเกิดเพราะ required) ก็ใส่ SUM(TOTAL_PAX)
  if (selectClauses.length === 0) {
    selectClauses.push("SUM(TOTAL_PAX) AS total_pax");
  }

  // ---------- GROUP BY ----------
  let groupList = group_by || [];
  let groupSQL = groupList.length > 0 ? "GROUP BY " + groupList.join(", ") : "";

  // ใส่ group column ลงใน select ด้วย
  groupList.forEach(g => selectClauses.unshift(g));

  // ---------- FROM ----------
  const tableName = "`aotbigquery.FlightData.APPS`"; // ใช้ backticks สำหรับ table name

  // ---------- WHERE ----------
  const whereClauses = [
    `FLIGHT_DATE BETWEEN DATE('${start_date}') AND DATE('${end_date}')`
  ];

  if (airports && airports.length > 0) {
    const list = airports.map(a => `'${a}'`).join(",");
    whereClauses.push(`AOT_AIRPORT IN (${list})`);
  }

  if (flight_directions && flight_directions.length > 0) {
    const list = flight_directions.map(a => `'${a}'`).join(",");
    whereClauses.push(`FLIGHT_DIRECTION IN (${list})`);
  }

  if (airline_codes && airline_codes.length > 0) {
    const list = airline_codes.map(a => `'${a}'`).join(",");
    whereClauses.push(`AIRLINE_CODE IN (${list})`);
  }

  if (origin_destinations && origin_destinations.length > 0) {
    const list = origin_destinations.map(a => `'${a}'`).join(",");
    whereClauses.push(`ORIGIN_DESTINATION IN (${list})`);
  }

  const whereSQL = "WHERE " + whereClauses.join(" AND ");

  // ---------- ORDER BY ----------
  let orderBySQL = "";
  if (groupList.length > 0) {
    // ใช้คอลัมน์แรกที่ group by
    orderBySQL = `ORDER BY ${groupList[0]}`;
  } else if (selectClauses.length > 0) {
    // ถ้าไม่มี group by ให้ใช้คอลัมน์ aggregate แรก
    const firstMetric = selectClauses[0].split(' AS ')[1] || selectClauses[0];
    orderBySQL = `ORDER BY ${firstMetric} DESC`;
  }

  // ---------- FINAL SQL ----------
  const sql = `
SELECT
  ${selectClauses.join(",\n  ")}
FROM ${tableName}
${whereSQL}
${groupSQL}
${orderBySQL}
LIMIT ${limit}`;

  return sql;
}
