use serde::{Deserialize, Serialize};

/// A small curated list of frequently-impersonated brands and their
/// official domains.
const KNOWN_BRANDS: &[(&str, &str)] = &[
    ("google", "google.com"),
    ("apple", "apple.com"),
    ("icloud", "apple.com"),
    ("microsoft", "microsoft.com"),
    ("paypal", "paypal.com"),
    ("amazon", "amazon.com"),
    ("ebay", "ebay.com"),
    ("facebook", "facebook.com"),
    ("netflix", "netflix.com"),
    ("dhl", "dhl.com"),
    ("fedex", "fedex.com"),
    ("ups", "ups.com"),
    ("poste italiane", "poste.it"),
    ("intesa sanpaolo", "intesasanpaolo.com"),
];

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BrandImpersonationResult {
    pub detected: bool,
    pub brand: Option<String>,
    pub sender_domain: Option<String>,
    pub reason: Option<String>,
}

/// Checks whether the email content references a well-known brand
/// while the sending domain does not belong to that brand
pub fn check_brand_impersonation(
    from_email: Option<&str>,
    subject: Option<&str>,
    body_text: Option<&str>,
) -> BrandImpersonationResult {
    let sender_domain = from_email.and_then(extract_domain);

    let content = format!(
        "{} {}",
        subject.unwrap_or(""),
        body_text.unwrap_or("")
    ).to_lowercase();

    for (brand_keyword, official_domain) in KNOWN_BRANDS {
        if !content.contains(brand_keyword) {
            continue;
        }

        let Some(domain) = &sender_domain else {
            continue;
        };

        if domain == official_domain || domain.ends_with(&format!(".{}", official_domain)) {
            continue;
        }

        // Sender domain contains the brand name as a substring but isn't
        // the real domain
        let reason = if domain.contains(brand_keyword) {
            format!(
                "Sender domain '{}' contains brand name '{}' but is not the official domain ({})",
                domain, brand_keyword, official_domain
            )
        } else {
            format!(
                "Email content references '{}' but sender domain '{}' does not belong to {}",
                brand_keyword, domain, official_domain
            )
        };

        return BrandImpersonationResult {
            detected: true,
            brand: Some(brand_keyword.to_string()),
            sender_domain: Some(domain.clone()),
            reason: Some(reason),
        };
    }

    BrandImpersonationResult {
        detected: false,
        brand: None,
        sender_domain,
        reason: None,
    }
}

fn extract_domain(address: &str) -> Option<String> {
    address
        .split('@')
        .nth(1)
        .map(|d| d.trim_end_matches('>').to_lowercase())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_icloud_lookalike_domain() {
        let result = check_brand_impersonation(
            Some("xfqqvqy@nhrprsjw.google.dataoption.biz"),
            Some("ALERT: your iCloud storage is full"),
            Some("Your photos will be deleted"),
        );
        assert!(result.detected);
        assert_eq!(result.brand.as_deref(), Some("icloud"));
    }

    #[test]
    fn does_not_flag_legit_sender() {
        let result = check_brand_impersonation(
            Some("noreply@apple.com"),
            Some("Your iCloud storage"),
            Some("Some content"),
        );
        assert!(!result.detected);
    }

    #[test]
    fn does_not_flag_legit_subdomain() {
        let result = check_brand_impersonation(
            Some("noreply@mail.apple.com"),
            Some("Your iCloud storage"),
            Some("Some content"),
        );
        assert!(!result.detected);
    }

    #[test]
    fn no_brand_mentioned_no_detection() {
        let result = check_brand_impersonation(
            Some("someone@randomsite.com"),
            Some("Meeting notes"),
            Some("Let's meet tomorrow"),
        );
        assert!(!result.detected);
    }

    #[test]
    fn no_sender_domain_no_crash() {
        let result = check_brand_impersonation(None, Some("iCloud alert"), Some("body"));
        assert!(!result.detected);
    }
}
