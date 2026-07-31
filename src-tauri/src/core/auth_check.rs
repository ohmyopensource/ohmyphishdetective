use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum AuthVerdict {
    Pass,
    Fail,
    SoftFail,
    Neutral,
    None,
    NotEvaluated, // header was missing entirely
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthCheckResult {
    pub spf: AuthVerdict,
    pub dkim: AuthVerdict,
    pub dmarc: AuthVerdict,
    pub raw_source: Option<String>,
}

/// Parses the raw "Authentication-Results" header lines already
/// extracted by the mail parser and derives a verdict for each
/// mechanism (SPF/DKIM/DMARC).
///
/// This relies on the receiving mail server having already performed
/// the check — it does NOT do its own DNS-based verification.
pub fn check_auth(auth_results_headers: &[String]) -> AuthCheckResult {
    if auth_results_headers.is_empty() {
        return AuthCheckResult {
            spf: AuthVerdict::NotEvaluated,
            dkim: AuthVerdict::NotEvaluated,
            dmarc: AuthVerdict::NotEvaluated,
            raw_source: None,
        };
    }

    // If there are multiple Authentication-Results headers (some
    // messages hop through several servers), we join them and scan
    // for the first mechanism=value occurrence of each type.
    let combined = auth_results_headers.join(" ; ");

    AuthCheckResult {
        spf: extract_verdict(&combined, "spf="),
        dkim: extract_verdict(&combined, "dkim="),
        dmarc: extract_verdict(&combined, "dmarc="),
        raw_source: Some(combined),
    }
}

fn extract_verdict(text: &str, marker: &str) -> AuthVerdict {
    let lower = text.to_lowercase();

    let Some(pos) = lower.find(marker) else {
        return AuthVerdict::NotEvaluated;
    };

    let after = &lower[pos + marker.len()..];
    let value: String = after
        .chars()
        .take_while(|c| c.is_alphabetic())
        .collect();

    match value.as_str() {
        "pass" => AuthVerdict::Pass,
        "fail" => AuthVerdict::Fail,
        "softfail" => AuthVerdict::SoftFail,
        "neutral" => AuthVerdict::Neutral,
        "none" => AuthVerdict::None,
        _ => AuthVerdict::NotEvaluated,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_typical_gmail_header() {
        let headers = vec![
            "mx.google.com; spf=pass smtp.mailfrom=x@y.com; dkim=pass header.i=@y.com; dmarc=pass (p=REJECT) header.from=y.com".to_string()
        ];
        let result = check_auth(&headers);
        assert_eq!(result.spf, AuthVerdict::Pass);
        assert_eq!(result.dkim, AuthVerdict::Pass);
        assert_eq!(result.dmarc, AuthVerdict::Pass);
    }

    #[test]
    fn handles_missing_header() {
        let result = check_auth(&[]);
        assert_eq!(result.spf, AuthVerdict::NotEvaluated);
    }

    #[test]
    fn detects_spf_fail() {
        let headers = vec!["spf=fail (sender IP not authorized); dkim=none".to_string()];
        let result = check_auth(&headers);
        assert_eq!(result.spf, AuthVerdict::Fail);
        assert_eq!(result.dkim, AuthVerdict::None);
    }
}
