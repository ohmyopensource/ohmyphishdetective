use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

use crate::commands::analyze_batch::BatchAnalysisResult;

/// A saved report entry, as listed in the Reports screen — lightweight
/// metadata only, without the full analysis payload.
#[derive(Debug, Serialize, Deserialize)]
pub struct ReportSummary {
    pub id: i64,
    pub created_at: String,
    pub total_emails: i64,
    pub clean_count: i64,
    pub suspicious_count: i64,
    pub malicious_count: i64,
}

/// Wraps the SQLite connection behind a Mutex.
pub struct Database(pub Mutex<Connection>);

impl Database {
    pub fn new(app_data_dir: &std::path::Path) -> rusqlite::Result<Self> {
        std::fs::create_dir_all(app_data_dir).ok();
        let db_path = app_data_dir.join("reports.sqlite");
        let conn = Connection::open(db_path)?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                total_emails INTEGER NOT NULL,
                clean_count INTEGER NOT NULL,
                suspicious_count INTEGER NOT NULL,
                malicious_count INTEGER NOT NULL,
                payload TEXT NOT NULL
            )",
            [],
        )?;

        Ok(Database(Mutex::new(conn)))
    }
}

pub fn save_report(conn: &Connection, result: &BatchAnalysisResult) -> rusqlite::Result<i64> {
    let payload = serde_json::to_string(result)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    let created_at = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO reports (created_at, total_emails, clean_count, suspicious_count, malicious_count, payload)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            created_at,
            result.summary.total_emails,
            result.summary.clean_count,
            result.summary.suspicious_count,
            result.summary.malicious_count,
            payload,
        ],
    )?;

    Ok(conn.last_insert_rowid())
}

pub fn list_reports(conn: &Connection) -> rusqlite::Result<Vec<ReportSummary>> {
    let mut stmt = conn.prepare(
        "SELECT id, created_at, total_emails, clean_count, suspicious_count, malicious_count
         FROM reports ORDER BY id DESC",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ReportSummary {
            id: row.get(0)?,
            created_at: row.get(1)?,
            total_emails: row.get(2)?,
            clean_count: row.get(3)?,
            suspicious_count: row.get(4)?,
            malicious_count: row.get(5)?,
        })
    })?;

    rows.collect()
}

pub fn get_report(conn: &Connection, id: i64) -> rusqlite::Result<Option<BatchAnalysisResult>> {
    let mut stmt = conn.prepare("SELECT payload FROM reports WHERE id = ?1")?;
    let mut rows = stmt.query(params![id])?;

    if let Some(row) = rows.next()? {
        let payload: String = row.get(0)?;
        let result: BatchAnalysisResult = serde_json::from_str(&payload)
            .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
        Ok(Some(result))
    } else {
        Ok(None)
    }
}

pub fn delete_report(conn: &Connection, id: i64) -> rusqlite::Result<usize> {
    conn.execute("DELETE FROM reports WHERE id = ?1", params![id])
}
