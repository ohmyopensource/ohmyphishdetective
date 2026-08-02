use msg_parser::Outlook;
use crate::core::mail_parser::{ParsedEmail, EmailHeaders, Attachment, ParseError};
use sha2::{Digest, Sha256};

/// OLE Compound File signature — every valid .msg file starts with these
/// exact bytes. Used to detect .msg files before attempting to parse
/// them as either .eml or .msg.
const OLE_SIGNATURE: &[u8] = &[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];

pub fn looks_like_msg_file(bytes: &[u8]) -> bool {
    bytes.starts_with(OLE_SIGNATURE)
}

/// msg_parser sometimes returns strings with trailing NUL bytes/control
/// characters, leftover from fixed-length OLE buffer reads. Strip them
/// so downstream comparisons (domain matching, etc.) and displayed
/// values are clean.
fn clean_string(s: &str) -> String {
    s.trim_end_matches('\0').trim().to_string()
}

/// Decodes a hex-encoded string into UTF-8 text. Some msg_parser
/// versions return the .html field as a hex dump of the raw bytes
/// rather than already-decoded text, so this normalizes it.
fn decode_hex_html(hex_str: &str) -> Option<String> {
    let hex_str = hex_str.trim();

    if hex_str.is_empty() || hex_str.len() % 2 != 0 || !hex_str.chars().all(|c| c.is_ascii_hexdigit()) {
        return None;
    }

    let bytes: Option<Vec<u8>> = (0..hex_str.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&hex_str[i..i + 2], 16).ok())
        .collect();

    bytes.and_then(|b| String::from_utf8(b).ok())
}

/// Parses a raw .msg (Outlook) file and normalizes it into the same
/// ParsedEmail structure used for .eml files, so the rest of the
/// analysis pipeline (auth checks, URL extraction, verdict scoring,
/// etc.) works identically regardless of source format.
pub fn parse_msg(raw_bytes: &[u8]) -> Result<ParsedEmail, ParseError> {
    let outlook = Outlook::from_slice(raw_bytes)
        .map_err(|e| ParseError::InvalidFormat(format!("Could not parse .msg file: {}", e)))?;

    let from = if outlook.sender.email.is_empty() {
        None
    } else {
        Some(clean_string(&outlook.sender.email))
    };

    let to: Vec<String> = outlook
        .to
        .iter()
        .filter(|p| !p.email.is_empty())
        .map(|p| clean_string(&p.email))
        .collect();

    let raw_header_block = clean_string(&outlook.headers.raw);
    let received_chain = crate::core::mail_parser::extract_received_chain(&raw_header_block);
    let authentication_results: Vec<String> = raw_header_block
        .lines()
        .filter(|l| l.to_lowercase().starts_with("authentication-results:"))
        .map(|l| l.to_string())
        .collect();

    let headers = EmailHeaders {
        from,
        reply_to: None,
        return_path: None,
        to,
        subject: Some(clean_string(&outlook.subject)),
        date: None,
        message_id: None,
        received_chain,
        authentication_results,
    };

    let body_text = if outlook.body.is_empty() { None } else { Some(clean_string(&outlook.body)) };
    let body_html = if outlook.html.is_empty() {
        None
    } else {
        let cleaned = clean_string(&outlook.html);
        Some(decode_hex_html(&cleaned).unwrap_or(cleaned))
    };

    let attachments: Vec<Attachment> = outlook
        .attachments
        .iter()
        .map(|att| {
            let content = &att.payload;
            let mut hasher = Sha256::new();
            hasher.update(content);
            let sha256 = format!("{:x}", hasher.finalize());

            Attachment {
                filename: Some(clean_string(&att.display_name)),
                content_type: None,
                size_bytes: content.len(),
                sha256,
            }
        })
        .collect();

    Ok(ParsedEmail {
        headers,
        body_text,
        body_html,
        attachments,
        raw_header_block,
    })
}
