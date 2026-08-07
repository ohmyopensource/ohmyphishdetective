mod core;
mod commands;
mod storage;

use storage::db::Database;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()
                .expect("failed to resolve app data dir");
            let db = Database::new(&app_data_dir)
                .expect("failed to initialize database");
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::parse_email::parse_email_command,
            commands::analyze_batch::analyze_batch_command,
            commands::reports::save_report_command,
            commands::reports::list_reports_command,
            commands::reports::get_report_command,
            commands::reports::delete_report_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
