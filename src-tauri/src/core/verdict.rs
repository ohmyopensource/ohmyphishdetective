use serde::{Deserialize, Serialize};

use crate::core::auth_check::{AuthCheckResult, AuthVerdict};
use crate::core::url_extractor::ExtractedUrl;
use crate::core::mail_parser::ParsedEmail;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum Verdict {
    Clean,
    Suspicious,
    Malicious,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScoreReason {
    pub description: String,
    pub points: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerdictResult {
    pub verdict: Verdict,
    pub score: u32,
    pub reasons: Vec<ScoreReason>,
}

const SUSPICIOUS_EXTENSIONS: &[&str] = &[
    ".exe", ".scr", ".js", ".vbs", ".bat", ".cmd", ".ps1", ".jar", ".msi",
];

/// Aggregates every signal collected by the other core modules into a
/// single transparent score. Each contributing signal is recorded with
/// its own weight so the final verdict can always be explained back to
/// the user — no black-box scoring.
pub fn compute_verdict(
    parsed: &ParsedEmail,
    auth: &AuthCheckResult,
    urls: &[ExtractedUrl],
    brand_check: &crate::core::brand_impersonation::BrandImpersonationResult,
) -> VerdictResult {
    let mut reasons = Vec::new();
    let mut score: u32 = 0;

    // --- SPF ---
    let spf_points = if auth.spf == AuthVerdict::Fail { 30 } else { 0 };
    reasons.push(ScoreReason {
        description: describe_auth_check("SPF", &auth.spf),
        points: spf_points,
    });
    score += spf_points;

    // --- DKIM ---
    let dkim_points = if auth.dkim == AuthVerdict::Fail { 25 } else { 0 };
    reasons.push(ScoreReason {
        description: describe_auth_check("DKIM", &auth.dkim),
        points: dkim_points,
    });
    score += dkim_points;

    // --- DMARC ---
    let dmarc_points = if auth.dmarc == AuthVerdict::Fail { 25 } else { 0 };
    reasons.push(ScoreReason {
        description: describe_auth_check("DMARC", &auth.dmarc),
        points: dmarc_points,
    });
    score += dmarc_points;

    // --- URL mismatch ---
    let has_mismatch = urls.iter().any(|u| u.is_mismatch);
    let url_points = if has_mismatch { 20 } else { 0 };
    reasons.push(ScoreReason {
        description: if has_mismatch {
            "Displayed link text does not match its real destination".to_string()
        } else {
            "No link text/destination mismatches found".to_string()
        },
        points: url_points,
    });
    score += url_points;

    // --- From / Return-Path domain match ---
    let (from_return_points, from_return_desc) = match check_from_return_path_mismatch(parsed) {
        Some(desc) => (15, desc),
        None => (0, "From and Return-Path domains match".to_string()),
    };
    reasons.push(ScoreReason {
        description: from_return_desc,
        points: from_return_points,
    });
    score += from_return_points;

    // --- Attachment extensions ---
    let suspicious_attachments: Vec<&str> = parsed
        .attachments
        .iter()
        .filter_map(|att| att.filename.as_deref())
        .filter(|filename| {
            let lower = filename.to_lowercase();
            SUSPICIOUS_EXTENSIONS.iter().any(|ext| lower.ends_with(ext))
        })
        .collect();

    let attachment_points = if suspicious_attachments.is_empty() { 0 } else { 30 };
    reasons.push(ScoreReason {
        description: if suspicious_attachments.is_empty() {
            if parsed.attachments.is_empty() {
                "No attachments present".to_string()
            } else {
                "No attachments with dangerous extensions found".to_string()
            }
        } else {
            format!(
                "Potentially dangerous attachment(s): {}",
                suspicious_attachments.join(", ")
            )
        },
        points: attachment_points,
    });
    score += attachment_points;

    // --- Brand impersonation ---
    let brand_points = if brand_check.detected { 35 } else { 0 };
    reasons.push(ScoreReason {
        description: brand_check.reason.clone().unwrap_or_else(|| {
            "No brand impersonation pattern detected".to_string()
        }),
        points: brand_points,
    });
    score += brand_points;

    let verdict = match score {
        0..=20 => Verdict::Clean,
        21..=50 => Verdict::Suspicious,
        _ => Verdict::Malicious,
    };

    VerdictResult { verdict, score, reasons }
}

fn describe_auth_check(mechanism: &str, result: &AuthVerdict) -> String {
    match result {
        AuthVerdict::Pass => format!("{} authentication passed", mechanism),
        AuthVerdict::Fail => format!("{} authentication failed", mechanism),
        AuthVerdict::SoftFail => format!("{} soft-failed (suspicious but not conclusive)", mechanism),
        AuthVerdict::Neutral => format!("{} returned a neutral result", mechanism),
        AuthVerdict::None => format!("{} was not present on the sending domain", mechanism),
        AuthVerdict::NotEvaluated => format!("{} could not be evaluated (no Authentication-Results header)", mechanism),
    }
}

fn check_from_return_path_mismatch(parsed: &ParsedEmail) -> Option<String> {
    let from_domain = extract_domain_from_email(parsed.headers.from.as_deref()?);
    let return_path_domain = extract_domain_from_email(parsed.headers.return_path.as_deref()?);

    if from_domain != return_path_domain {
        Some(format!(
            "From domain ('{}') differs from Return-Path domain ('{}')",
            from_domain, return_path_domain
        ))
    } else {
        None
    }
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
    use crate::core::auth_check::AuthVerdict;
    use crate::core::brand_impersonation::BrandImpersonationResult;

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
    fn clean_email_scores_zero_but_lists_all_checks() {
        let parsed = base_parsed("a@example.com", "a@example.com");
        let result = compute_verdict(&parsed, &clean_auth(), &[], &no_brand_impersonation());
        assert_eq!(result.score, 0);
        assert_eq!(result.verdict, Verdict::Clean);
        assert_eq!(result.reasons.len(), 7);
        assert!(result.reasons.iter().all(|r| r.points == 0));
    }

    #[test]
    fn spf_fail_pushes_to_suspicious() {
        let parsed = base_parsed("a@example.com", "a@example.com");
        let mut auth = clean_auth();
        auth.spf = AuthVerdict::Fail;
        let result = compute_verdict(&parsed, &auth, &[], &no_brand_impersonation());
        assert_eq!(result.score, 30);
        assert_eq!(result.verdict, Verdict::Suspicious);
    }

    #[test]
    fn multiple_signals_reach_malicious() {
        let parsed = base_parsed("a@example.com", "b@evil.com");
        let mut auth = clean_auth();
        auth.spf = AuthVerdict::Fail;
        auth.dkim = AuthVerdict::Fail;
        let result = compute_verdict(&parsed, &auth, &[], &no_brand_impersonation());
        assert_eq!(result.score, 70);
        assert_eq!(result.verdict, Verdict::Malicious);
    }

    #[test]
    fn suspicious_attachment_extension_detected() {
        let mut parsed = base_parsed("a@example.com", "a@example.com");
        parsed.attachments.push(Attachment {
            filename: Some("invoice.exe".to_string()),
            content_type: None,
            size_bytes: 100,
            sha256: "x".to_string(),
        });
        let result = compute_verdict(&parsed, &clean_auth(), &[], &no_brand_impersonation());
        assert_eq!(result.score, 30);
    }

    #[test]
    fn brand_impersonation_adds_points() {
        let parsed = base_parsed("a@example.com", "a@example.com");
        let brand_check = BrandImpersonationResult {
            detected: true,
            brand: Some("apple".to_string()),
            sender_domain: Some("example.com".to_string()),
            reason: Some("fake reason".to_string()),
        };
        let result = compute_verdict(&parsed, &clean_auth(), &[], &brand_check);
        assert_eq!(result.score, 35);
        assert_eq!(result.verdict, Verdict::Suspicious);
    }
}
