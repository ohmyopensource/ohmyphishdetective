use serde::{Deserialize, Serialize};
use crate::core::msg_adapter::looks_like_msg_file;

const MAX_FILE_SIZE_BYTES: usize = 25 * 1024 * 1024;
const HEADER_SNIFF_WINDOW: usize = 4096;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum ValidationError {
    EmptyFile,
    FileTooLarge { size_bytes: usize, max_bytes: usize },
    DoesNotLookLikeEmail,
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ValidationError::EmptyFile => write!(f, "The file is empty"),
            ValidationError::FileTooLarge { size_bytes, max_bytes } => write!(
                f,
                "File is too large ({} bytes, max allowed is {} bytes)",
                size_bytes, max_bytes
            ),
            ValidationError::DoesNotLookLikeEmail => write!(
                f,
                "This file does not look like a valid email message (.eml)"
            ),
        }
    }
}

impl std::error::Error for ValidationError {}

/// A set of cheap, fast checks run BEFORE the real MIME parser is invoked.
/// The goal is to reject obviously-wrong input early (wrong file type,
/// absurd size) rather than handing arbitrary bytes to the parser and
/// hoping it fails gracefully.
pub fn validate_eml_bytes(bytes: &[u8]) -> Result<(), ValidationError> {
    if bytes.is_empty() {
        return Err(ValidationError::EmptyFile);
    }

    if bytes.len() > MAX_FILE_SIZE_BYTES {
        return Err(ValidationError::FileTooLarge {
            size_bytes: bytes.len(),
            max_bytes: MAX_FILE_SIZE_BYTES,
        });
    }

    if !looks_like_email(bytes) && !looks_like_msg_file(bytes) {
        return Err(ValidationError::DoesNotLookLikeEmail);
    }

    Ok(())
}

/// Heuristic: a real .eml file is plain text and its first few KB should
/// contain at least one recognizable RFC 5322 header field
/// (e.g. "From:", "Received:", "Subject:", "Return-Path:") on its own
/// line. This is intentionally permissive — it exists to reject
/// obviously-wrong files (images, executables, random binaries), not to
/// validate full RFC compliance (that's the real parser's job).
fn looks_like_email(bytes: &[u8]) -> bool {
    let window = &bytes[..bytes.len().min(HEADER_SNIFF_WINDOW)];

    let Ok(text) = std::str::from_utf8(window) else {
        return false;
    };

    const KNOWN_HEADERS: &[&str] = &[
        "from:", "to:", "subject:", "received:", "return-path:",
        "date:", "message-id:", "mime-version:", "delivered-to:",
    ];

    text.lines()
        .take(50)
        .any(|line| {
            let lower = line.to_lowercase();
            KNOWN_HEADERS.iter().any(|h| lower.starts_with(h))
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_empty_file() {
        let result = validate_eml_bytes(&[]);
        assert_eq!(result, Err(ValidationError::EmptyFile));
    }

    #[test]
    fn rejects_oversized_file() {
        let huge = vec![b'a'; MAX_FILE_SIZE_BYTES + 1];
        let result = validate_eml_bytes(&huge);
        assert!(matches!(result, Err(ValidationError::FileTooLarge { .. })));
    }

    #[test]
    fn rejects_binary_garbage() {
        let binary: Vec<u8> = vec![0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46];
        let result = validate_eml_bytes(&binary);
        assert_eq!(result, Err(ValidationError::DoesNotLookLikeEmail));
    }

    #[test]
    fn rejects_plain_text_that_is_not_email() {
        let text = b"Hello, this is just a random text file with no email headers at all.";
        let result = validate_eml_bytes(text);
        assert_eq!(result, Err(ValidationError::DoesNotLookLikeEmail));
    }

    #[test]
    fn accepts_valid_looking_eml() {
        let eml = b"Return-Path: <test@example.com>\r\nFrom: test@example.com\r\nTo: me@example.com\r\nSubject: Hello\r\n\r\nBody text here.";
        let result = validate_eml_bytes(eml);
        assert!(result.is_ok());
    }
}
