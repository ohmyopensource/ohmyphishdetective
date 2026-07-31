use serde::{Deserialize, Serialize};
use crate::core::mail_parser::{parse_eml, ParsedEmail, ParseError};
use crate::core::auth_check::{check_auth, AuthCheckResult};
use crate::core::url_extractor::{extract_from_html, extract_from_text, ExtractedUrl};
use crate::core::header_trace::{parse_hops, Hop};

#[derive(Debug, Serialize, Deserialize)]
pub struct EmailAnalysis {
    pub parsed: ParsedEmail,
    pub auth: AuthCheckResult,
    pub urls: Vec<ExtractedUrl>,
    pub hops: Vec<Hop>,
}

#[tauri::command]
pub fn parse_email_command(raw_eml: Vec<u8>) -> Result<EmailAnalysis, String> {
    let parsed = parse_eml(&raw_eml).map_err(|e: ParseError| e.to_string())?;
    let auth = check_auth(&parsed.headers.authentication_results);

    let urls = if let Some(html) = &parsed.body_html {
        extract_from_html(html)
    } else if let Some(text) = &parsed.body_text {
        extract_from_text(text)
    } else {
        Vec::new()
    };

    let hops = parse_hops(&parsed.headers.received_chain);

    Ok(EmailAnalysis { parsed, auth, urls, hops })
}
