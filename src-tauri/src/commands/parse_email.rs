use crate::commands::analysis::{run_email_analysis, EmailAnalysis};

#[tauri::command]
pub fn parse_email_command(raw_eml: Vec<u8>) -> Result<EmailAnalysis, String> {
    run_email_analysis(&raw_eml)
}
