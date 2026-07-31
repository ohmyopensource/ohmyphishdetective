use serde::{Deserialize, Serialize};
use std::collections::HashSet;

use crate::core::mail_parser::ParsedEmail;
use crate::core::header_trace::Hop;
use crate::core::url_extractor::ExtractedUrl;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
pub enum IocType {
    IpAddress,
    Domain,
    Url,
    Sha256,
    EmailAddress,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ioc {
    pub ioc_type: IocType,
    pub value: String,
    pub source: String,
}

/// Aggregates every indicator of compromise extracted by the other
/// core modules into a single, deduplicated list.
pub fn aggregate_iocs(
    parsed: &ParsedEmail,
    hops: &[Hop],
    urls: &[ExtractedUrl],
) -> Vec<Ioc> {
    let mut iocs = Vec::new();
    let mut seen: HashSet<(IocType, String)> = HashSet::new();

    let mut push = |ioc_type: IocType, value: String, source: &str| {
        let key = (ioc_type.clone(), value.clone());
        if seen.insert(key) {
            iocs.push(Ioc { ioc_type, value, source: source.to_string() });
        }
    };

    // IPs from the hop chain
    for (i, hop) in hops.iter().enumerate() {
        if let Some(ip) = &hop.from_ip {
            push(IocType::IpAddress, ip.clone(), &format!("Received header, hop {}", i + 1));
        }
    }

    // Domains and URLs from extracted links
    for url in urls {
        push(IocType::Url, url.actual_url.clone(), "Body link");
        if let Some(domain) = &url.domain {
            push(IocType::Domain, domain.clone(), "Body link domain");
        }
    }

    // Sender-related email addresses
    if let Some(from) = &parsed.headers.from {
        push(IocType::EmailAddress, from.clone(), "From header");
    }
    if let Some(return_path) = &parsed.headers.return_path {
        push(IocType::EmailAddress, return_path.clone(), "Return-Path header");
    }

    // Attachment hashes
    for att in &parsed.attachments {
        push(
            IocType::Sha256,
            att.sha256.clone(),
            &format!(
                "Attachment: {}",
                att.filename.as_deref().unwrap_or("unnamed")
            ),
        );
    }

    iocs
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::mail_parser::{EmailHeaders, Attachment};

    fn empty_parsed_email() -> ParsedEmail {
        ParsedEmail {
            headers: EmailHeaders {
                from: Some("attacker@evil.com".to_string()),
                reply_to: None,
                return_path: Some("bounce@evil.com".to_string()),
                to: vec![],
                subject: None,
                date: None,
                message_id: None,
                received_chain: vec![],
                authentication_results: vec![],
            },
            body_text: None,
            body_html: None,
            attachments: vec![Attachment {
                filename: Some("invoice.pdf".to_string()),
                content_type: Some("application/pdf".to_string()),
                size_bytes: 1024,
                sha256: "abc123".to_string(),
            }],
            raw_header_block: String::new(),
        }
    }

    #[test]
    fn aggregates_all_ioc_types() {
        let parsed = empty_parsed_email();
        let hops = vec![Hop {
            from_helo: Some("evil-relay.com".to_string()),
            from_ip: Some("1.2.3.4".to_string()),
            by_host: Some("mx.gmail.com".to_string()),
            timestamp: None,
            raw: String::new(),
        }];
        let urls = vec![crate::core::url_extractor::ExtractedUrl {
            displayed_text: None,
            actual_url: "https://evil.com/login".to_string(),
            domain: Some("evil.com".to_string()),
            is_mismatch: false,
            looks_like_credential_harvesting: false,
        }];

        let iocs = aggregate_iocs(&parsed, &hops, &urls);

        assert!(iocs.iter().any(|i| i.ioc_type == IocType::IpAddress && i.value == "1.2.3.4"));
        assert!(iocs.iter().any(|i| i.ioc_type == IocType::Domain && i.value == "evil.com"));
        assert!(iocs.iter().any(|i| i.ioc_type == IocType::EmailAddress && i.value == "attacker@evil.com"));
        assert!(iocs.iter().any(|i| i.ioc_type == IocType::Sha256 && i.value == "abc123"));
    }

    #[test]
    fn deduplicates_repeated_iocs() {
        let parsed = empty_parsed_email();
        let urls = vec![
            crate::core::url_extractor::ExtractedUrl {
                displayed_text: None,
                actual_url: "https://evil.com/a".to_string(),
                domain: Some("evil.com".to_string()),
                is_mismatch: false,
                looks_like_credential_harvesting: false,
            },
            crate::core::url_extractor::ExtractedUrl {
                displayed_text: None,
                actual_url: "https://evil.com/b".to_string(),
                domain: Some("evil.com".to_string()),
                is_mismatch: false,
                looks_like_credential_harvesting: false,
            },
        ];

        let iocs = aggregate_iocs(&parsed, &[], &urls);
        let domain_count = iocs.iter().filter(|i| i.ioc_type == IocType::Domain && i.value == "evil.com").count();
        assert_eq!(domain_count, 1);
    }
}
