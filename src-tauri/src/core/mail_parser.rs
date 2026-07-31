use serde::{Deserialize, Serialize};
use mail_parser::{MessageParser, MimeHeaders};
use sha2::{Digest, Sha256};
use regex::Regex;
use std::sync::OnceLock;

static RECEIVED_REGEX: OnceLock<Regex> = OnceLock::new();

fn received_regex() -> &'static Regex {
    RECEIVED_REGEX.get_or_init(|| {
        Regex::new(r"(?im)^Received:[ \t]*(.*(?:\r?\n[ \t]+.*)*)").unwrap()
    })
}

fn extract_received_chain(raw_header_block: &str) -> Vec<String> {
    received_regex()
        .captures_iter(raw_header_block)
        .map(|cap| {
            cap[1]
                .lines()
                .map(|line| line.trim())
                .collect::<Vec<_>>()
                .join(" ")
        })
        .collect()
}

/// Fully parsed representation of an .eml file as JSON.
#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedEmail {
    pub headers: EmailHeaders,
    pub body_text: Option<String>,
    pub body_html: Option<String>,
    pub attachments: Vec<Attachment>,
    pub raw_header_block: String,
}

/// Subset of headers relevant to phishing analysis.
#[derive(Debug, Serialize, Deserialize)]
pub struct EmailHeaders {
    pub from: Option<String>,
    pub reply_to: Option<String>,
    pub return_path: Option<String>,
    pub to: Vec<String>,
    pub subject: Option<String>,
    pub date: Option<String>,
    pub message_id: Option<String>,
    pub received_chain: Vec<String>,
    pub authentication_results: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Attachment {
    pub filename: Option<String>,
    pub content_type: Option<String>,
    pub size_bytes: usize,
    pub sha256: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ParseError {
    InvalidFormat(String),
    EmptyInput,
}

impl std::fmt::Display for ParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ParseError::InvalidFormat(msg) => write!(f, "Invalid email format: {}", msg),
            ParseError::EmptyInput => write!(f, "Empty input provided"),
        }
    }
}

impl std::error::Error for ParseError {}

/// Parses raw .eml bytes into ParsedEmail structure.
pub fn parse_eml(raw_bytes: &[u8]) -> Result<ParsedEmail, ParseError> {
    if raw_bytes.is_empty() {
        return Err(ParseError::EmptyInput);
    }

    let message = MessageParser::default()
        .parse(raw_bytes)
        .ok_or_else(|| ParseError::InvalidFormat("Could not parse message structure".into()))?;

    let raw_header_block = String::from_utf8_lossy(
        &raw_bytes[..message.raw_message().len().min(raw_bytes.len())]
        ).lines()
        .take_while(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n");

    // --- Headers ---
    let from = message
        .from()
        .and_then(|addrs| addrs.first())
        .and_then(|addr| addr.address())
        .map(|s| s.to_string());

    let reply_to = message
        .reply_to()
        .and_then(|addrs| addrs.first())
        .and_then(|addr| addr.address())
        .map(|s| s.to_string());

    let return_path = message
        .return_path()
        .as_text()
        .map(|s| s.to_string());

    let to = message
        .to()
        .map(|addrs| {
            addrs
                .iter()
                .filter_map(|a| a.address().map(|s| s.to_string()))
                .collect()
        })
        .unwrap_or_default();

    let subject = message.subject().map(|s| s.to_string());
    let date = message.date().map(|d| d.to_rfc3339());
    let message_id = message.message_id().map(|s| s.to_string());

    let received_chain = extract_received_chain(&raw_header_block);

    let authentication_results: Vec<String> = message
        .header_values("Authentication-Results")
        .filter_map(|v| v.as_text())
        .map(|s| s.to_string())
        .collect();

    let headers = EmailHeaders {
        from,
        reply_to,
        return_path,
        to,
        subject,
        date,
        message_id,
        received_chain,
        authentication_results,
    };

    // --- Body ---
    let body_text = message.body_text(0).map(|s| s.to_string());
    let body_html = message.body_html(0).map(|s| s.to_string());

    // --- Attachments ---
    let attachments: Vec<Attachment> = message
        .attachments()
        .map(|att| {
            let content = att.contents();
            let mut hasher = Sha256::new();
            hasher.update(content);
            let sha256 = format!("{:x}", hasher.finalize());

            Attachment {
                filename: att.attachment_name().map(|s| s.to_string()),
                content_type: att.content_type().map(|ct| ct.ctype().to_string()),
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
