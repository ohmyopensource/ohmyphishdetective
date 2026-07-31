use serde::{Deserialize, Serialize};
use regex::Regex;
use std::sync::OnceLock;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Hop {
    pub from_helo: Option<String>,
    pub from_ip: Option<String>,
    pub by_host: Option<String>,
    pub timestamp: Option<String>,
    pub raw: String,
}

static FROM_HELO_REGEX: OnceLock<Regex> = OnceLock::new();
static IP_REGEX: OnceLock<Regex> = OnceLock::new();
static BY_HOST_REGEX: OnceLock<Regex> = OnceLock::new();
static TIMESTAMP_REGEX: OnceLock<Regex> = OnceLock::new();

fn from_helo_regex() -> &'static Regex {
    FROM_HELO_REGEX.get_or_init(|| Regex::new(r"(?i)^from\s+([^\s(]+)").unwrap())
}

fn ip_regex() -> &'static Regex {
    IP_REGEX.get_or_init(|| {
        Regex::new(r"\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]").unwrap()
    })
}

fn by_host_regex() -> &'static Regex {
    BY_HOST_REGEX.get_or_init(|| Regex::new(r"(?i)\bby\s+([^\s]+)").unwrap())
}

fn timestamp_regex() -> &'static Regex {
    TIMESTAMP_REGEX.get_or_init(|| Regex::new(r";\s*([^;]+)$").unwrap())
}

/// Parses each raw "Received" header string into a structured Hop,
/// extracting the claimed sender host, the real IP (from reverse-DNS
/// lookup performed by the receiving server), the receiving host, and
/// the timestamp of that hop.
pub fn parse_hops(received_chain: &[String]) -> Vec<Hop> {
    received_chain
        .iter()
        .map(|raw| Hop {
            from_helo: from_helo_regex()
                .captures(raw)
                .map(|c| c[1].trim_end_matches('.').to_string()),
            from_ip: ip_regex()
                .captures(raw)
                .map(|c| c[1].to_string()),
            by_host: by_host_regex()
                .captures(raw)
                .map(|c| c[1].trim_end_matches('.').to_string()),
            timestamp: timestamp_regex()
                .captures(raw)
                .map(|c| c[1].trim().to_string()),
            raw: raw.clone(),
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_typical_ebay_hop() {
        let chain = vec![
            "from mxphxpool1008.ebay.com (mxphxpool1008.ebay.com. [66.211.184.74]) by mx.google.com with ESMTPS id abc; Tue, 14 Jul 2026 03:45:41 -0700 (PDT)".to_string()
        ];
        let hops = parse_hops(&chain);
        assert_eq!(hops.len(), 1);
        assert_eq!(hops[0].from_helo.as_deref(), Some("mxphxpool1008.ebay.com"));
        assert_eq!(hops[0].from_ip.as_deref(), Some("66.211.184.74"));
        assert_eq!(hops[0].by_host.as_deref(), Some("mx.google.com"));
        assert!(hops[0].timestamp.is_some());
    }

    #[test]
    fn handles_hop_without_ip() {
        let chain = vec![
            "by 2002:adf:e9c7:0:b0:47f:47e9:965 with SMTP id l7csp124565wrn; Tue, 14 Jul 2026 03:45:41 -0700 (PDT)".to_string()
        ];
        let hops = parse_hops(&chain);
        assert_eq!(hops[0].from_ip, None);
        assert_eq!(hops[0].from_helo, None);
    }

    #[test]
    fn handles_empty_chain() {
        let hops = parse_hops(&[]);
        assert!(hops.is_empty());
    }
}
