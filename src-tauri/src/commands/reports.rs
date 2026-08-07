use tauri::State;
use crate::storage::db::{Database, ReportSummary, save_report, list_reports, get_report, delete_report};
use crate::commands::analyze_batch::BatchAnalysisResult;

#[tauri::command]
pub fn save_report_command(
    db: State<Database>,
    result: BatchAnalysisResult,
) -> Result<i64, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    save_report(&conn, &result).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_reports_command(db: State<Database>) -> Result<Vec<ReportSummary>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    list_reports(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_report_command(
    db: State<Database>,
    id: i64,
) -> Result<Option<BatchAnalysisResult>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    get_report(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_report_command(db: State<Database>, id: i64) -> Result<usize, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    delete_report(&conn, id).map_err(|e| e.to_string())
}
