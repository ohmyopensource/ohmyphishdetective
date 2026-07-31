use crate::core::mail_parser::{parse_eml, ParsedEmail, ParseError};

#[tauri::command]
pub fn parse_email_command(raw_eml: Vec<u8>) -> Result<ParsedEmail, String> {
    parse_eml(&raw_eml).map_err(|e: ParseError| e.to_string())
}
