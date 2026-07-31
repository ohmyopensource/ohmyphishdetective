use serde::{Deserialize, Serialize};
use crate::core::mail_parser::{parse_eml, ParsedEmail, ParseError};
use crate::core::auth_check::{check_auth, AuthCheckResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct EmailAnalysis {
    pub parsed: ParsedEmail,
    pub auth: AuthCheckResult,
}

#[tauri::command]
pub fn parse_email_command(raw_eml: Vec<u8>) -> Result<EmailAnalysis, String> {
    let parsed = parse_eml(&raw_eml).map_err(|e: ParseError| e.to_string())?;
    let auth = check_auth(&parsed.headers.authentication_results);

    Ok(EmailAnalysis { parsed, auth })
}
