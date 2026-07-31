use serde::{Deserialize, Serialize};
use scraper::{Html, Selector};
use regex::Regex;
use std::sync::OnceLock;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExtractedUrl {
    pub displayed_text: Option<String>,
    pub actual_url: String,
    pub domain: Option<String>,
    pub is_mismatch: bool,
}

static PLAIN_URL_REGEX: OnceLock<Regex> = OnceLock::new();
static DOMAIN_LIKE_REGEX: OnceLock<Regex> = OnceLock::new();

fn plain_url_regex() -> &'static Regex {
    PLAIN_URL_REGEX.get_or_init(|| {
        Regex::new(r"https?://[^\s<>\x22\x27]+").unwrap()
    })
}

/// Extracts URLs from an HTML body, capturing both the visible anchor
/// text and the real href
pub fn extract_from_html(html: &str) -> Vec<ExtractedUrl> {
    let document = Html::parse_document(html);
    let selector = Selector::parse("a[href]").unwrap();

    document
        .select(&selector)
        .filter_map(|el| {
            let href = el.value().attr("href")?.trim().to_string();

            if !href.starts_with("http://") && !href.starts_with("https://") {
                return None;
            }

            let displayed_text: String = el.text().collect::<Vec<_>>().join(" ").trim().to_string();
            let displayed_text = if displayed_text.is_empty() { None } else { Some(displayed_text) };

            let domain = extract_domain(&href);
            let is_mismatch = check_mismatch(&displayed_text, &href);

            Some(ExtractedUrl {
                displayed_text,
                actual_url: href,
                domain,
                is_mismatch,
            })
        })
        .collect()
}

/// Extracts bare URLs from a plain-text body.
pub fn extract_from_text(text: &str) -> Vec<ExtractedUrl> {
    plain_url_regex()
        .find_iter(text)
        .map(|m| {
            let url = m.as_str().to_string();
            let domain = extract_domain(&url);
            ExtractedUrl {
                displayed_text: None,
                actual_url: url,
                domain,
                is_mismatch: false,
            }
        })
        .collect()
}

fn extract_domain(raw_url: &str) -> Option<String> {
    url::Url::parse(raw_url)
        .ok()
        .and_then(|u| u.host_str().map(|h| h.to_string()))
}

fn domain_like_regex() -> &'static Regex {
    DOMAIN_LIKE_REGEX.get_or_init(|| {
        Regex::new(r"^(?:https?://)?(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9][a-zA-Z0-9-]*)+\.[a-zA-Z]{2,}").unwrap()
    })
}

/// Flags the classic phishing pattern where the visible anchor text looks
/// like a legitimate URL/domain
fn check_mismatch(displayed_text: &Option<String>, actual_url: &str) -> bool {
    let Some(text) = displayed_text else {
        return false;
    };

    let trimmed = text.trim();

    if !domain_like_regex().is_match(trimmed) {
        return false;
    }

    let text_domain = if trimmed.starts_with("http") {
        extract_domain(trimmed)
    } else {
        Some(trimmed.to_lowercase())
    };

    let actual_domain = extract_domain(actual_url).map(|d| d.to_lowercase());

    match (text_domain, actual_domain) {
        (Some(t), Some(a)) => !a.contains(&t) && !t.contains(&a),
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_mismatched_link() {
        let html = r#"<a href="https://evil-phish.ru/login">https://www.paypal.com/login</a>"#;
        let urls = extract_from_html(html);
        assert_eq!(urls.len(), 1);
        assert!(urls[0].is_mismatch);
    }

    #[test]
    fn does_not_flag_legit_link() {
        let html = r#"<a href="https://www.paypal.com/login">Click here to verify</a>"#;
        let urls = extract_from_html(html);
        assert_eq!(urls.len(), 1);
        assert!(!urls[0].is_mismatch);
    }

    #[test]
    fn extracts_plain_text_urls() {
        let text = "Please visit https://example.com/reset?token=abc for details.";
        let urls = extract_from_text(text);
        assert_eq!(urls.len(), 1);
        assert_eq!(urls[0].actual_url, "https://example.com/reset?token=abc");
    }

    #[test]
    fn ignores_non_http_hrefs() {
        let html = r#"<a href="mailto:test@example.com">Email us</a>"#;
        let urls = extract_from_html(html);
        assert_eq!(urls.len(), 0);
    }

    #[test]
    fn does_not_flag_ellipsis_as_domain() {
        let html = r#"<a href="https://www.ebay.it/itm/123">ANARCHY REIGNS Limited Edition PS3 ITA -...</a>"#;
        let urls = extract_from_html(html);
        assert_eq!(urls.len(), 1);
        assert!(!urls[0].is_mismatch);
}
}
