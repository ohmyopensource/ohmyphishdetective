use serde::{Deserialize, Serialize};

use crate::core::auth_check::{AuthCheckResult, AuthVerdict};
use crate::core::url_extractor::ExtractedUrl;
use crate::core::mail_parser::ParsedEmail;
use crate::core::brand_impersonation::BrandImpersonationResult;

const SUSPICIOUS_EXTENSIONS: &[&str] = &[
    ".exe", ".scr", ".js", ".vbs", ".bat", ".cmd", ".ps1", ".jar", ".msi",
];

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MitreTechnique {
    pub id: String,
    pub name: String,
    pub tactic: String,
    pub evidence: String,
}

/// Maps signals already detected by the other core modules onto the
/// corresponding MITRE ATT&CK techniques.
pub fn map_to_mitre(
    parsed: &ParsedEmail,
    auth: &AuthCheckResult,
    urls: &[ExtractedUrl],
    brand_check: &BrandImpersonationResult,
) -> Vec<MitreTechnique> {
    let mut techniques = Vec::new();

    // T1566.002 — Phishing: Spearphishing Link
    if let Some(mismatched) = urls.iter().find(|u| u.is_mismatch) {
        techniques.push(MitreTechnique {
            id: "T1566.002".to_string(),
            name: "Phishing: Spearphishing Link".to_string(),
            tactic: "Initial Access".to_string(),
            evidence: format!(
                "Displayed text '{}' does not match actual destination '{}'",
                mismatched.displayed_text.as_deref().unwrap_or("(no text)"),
                mismatched.actual_url
            ),
        });
    }

    // T1204.002 — User Execution: Malicious File
    let suspicious_attachments: Vec<&str> = parsed
        .attachments
        .iter()
        .filter_map(|att| att.filename.as_deref())
        .filter(|filename| {
            let lower = filename.to_lowercase();
            SUSPICIOUS_EXTENSIONS.iter().any(|ext| lower.ends_with(ext))
        })
        .collect();

    if !suspicious_attachments.is_empty() {
        techniques.push(MitreTechnique {
            id: "T1204.002".to_string(),
            name: "User Execution: Malicious File".to_string(),
            tactic: "Execution".to_string(),
            evidence: format!(
                "Attachment(s) with potentially dangerous extension: {}",
                suspicious_attachments.join(", ")
            ),
        });
    }

    // T1656 — Impersonation (aggregates auth failures, domain mismatch,
    // and brand impersonation into a single technique entry)
    let auth_failed = auth.spf == AuthVerdict::Fail
        || auth.dkim == AuthVerdict::Fail
        || auth.dmarc == AuthVerdict::Fail;

    let domain_mismatch = domain_mismatch(parsed);

    if auth_failed || domain_mismatch || brand_check.detected {
        let mut evidence_parts = Vec::new();
        if auth.spf == AuthVerdict::Fail {
            evidence_parts.push("SPF failed".to_string());
        }
        if auth.dkim == AuthVerdict::Fail {
            evidence_parts.push("DKIM failed".to_string());
        }
        if auth.dmarc == AuthVerdict::Fail {
            evidence_parts.push("DMARC failed".to_string());
        }
        if domain_mismatch {
            evidence_parts.push("From/Return-Path domain mismatch".to_string());
        }
        if let Some(reason) = &brand_check.reason {
            evidence_parts.push(reason.clone());
        }

        techniques.push(MitreTechnique {
            id: "T1656".to_string(),
            name: "Impersonation".to_string(),
            tactic: "Defense Evasion".to_string(),
            evidence: evidence_parts.join("; "),
        });
    }

    techniques
}

fn domain_mismatch(parsed: &ParsedEmail) -> bool {
    let (Some(from), Some(return_path)) = (&parsed.headers.from, &parsed.headers.return_path) else {
        return false;
    };

    let from_domain = extract_domain_from_email(from);
    let return_path_domain = extract_domain_from_email(return_path);

    from_domain != return_path_domain
}

fn extract_domain_from_email(address: &str) -> String {
    address
        .split('@')
        .nth(1)
        .unwrap_or("")
        .trim_end_matches('>')
        .to_lowercase()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::mail_parser::{EmailHeaders, Attachment};

    fn base_parsed(from: &str, return_path: &str) -> ParsedEmail {
        ParsedEmail {
            headers: EmailHeaders {
                from: Some(from.to_string()),
                reply_to: None,
                return_path: Some(return_path.to_string()),
                to: vec![],
                subject: None,
                date: None,
                message_id: None,
                received_chain: vec![],
                authentication_results: vec![],
            },
            body_text: None,
            body_html: None,
            attachments: vec![],
            raw_header_block: String::new(),
        }
    }

    fn clean_auth() -> AuthCheckResult {
        AuthCheckResult {
            spf: AuthVerdict::Pass,
            dkim: AuthVerdict::Pass,
            dmarc: AuthVerdict::Pass,
            raw_source: None,
        }
    }

    fn no_brand_impersonation() -> BrandImpersonationResult {
        BrandImpersonationResult {
            detected: false,
            brand: None,
            sender_domain: None,
            reason: None,
        }
    }

    #[test]
    fn clean_email_maps_to_no_techniques() {
        let parsed = base_parsed("a@example.com", "a@example.com");
        let result = map_to_mitre(&parsed, &clean_auth(), &[], &no_brand_impersonation());
        assert!(result.is_empty());
    }

    #[test]
    fn spf_fail_maps_to_impersonation() {
        let parsed = base_parsed("a@example.com", "a@example.com");
        let mut auth = clean_auth();
        auth.spf = AuthVerdict::Fail;
        let result = map_to_mitre(&parsed, &auth, &[], &no_brand_impersonation());
        assert!(result.iter().any(|t| t.id == "T1656"));
    }

    #[test]
    fn url_mismatch_maps_to_spearphishing_link() {
        let parsed = base_parsed("a@example.com", "a@example.com");
        let urls = vec![ExtractedUrl {
            displayed_text: Some("paypal.com".to_string()),
            actual_url: "https://evil.ru/login".to_string(),
            domain: Some("evil.ru".to_string()),
            is_mismatch: true,
            looks_like_credential_harvesting: false,
        }];
        let result = map_to_mitre(&parsed, &clean_auth(), &urls, &no_brand_impersonation());
        assert!(result.iter().any(|t| t.id == "T1566.002"));
    }

    #[test]
    fn dangerous_attachment_maps_to_user_execution() {
        let mut parsed = base_parsed("a@example.com", "a@example.com");
        parsed.attachments.push(Attachment {
            filename: Some("invoice.exe".to_string()),
            content_type: None,
            size_bytes: 100,
            sha256: "x".to_string(),
        });
        let result = map_to_mitre(&parsed, &clean_auth(), &[], &no_brand_impersonation());
        assert!(result.iter().any(|t| t.id == "T1204.002"));
    }

    #[test]
    fn brand_impersonation_maps_to_impersonation() {
        let parsed = base_parsed("a@example.com", "a@example.com");
        let brand_check = BrandImpersonationResult {
            detected: true,
            brand: Some("apple".to_string()),
            sender_domain: Some("example.com".to_string()),
            reason: Some("fake reason".to_string()),
        };
        let result = map_to_mitre(&parsed, &clean_auth(), &[], &brand_check);
        let t1656_count = result.iter().filter(|t| t.id == "T1656").count();
        assert_eq!(t1656_count, 1);
    }
}
