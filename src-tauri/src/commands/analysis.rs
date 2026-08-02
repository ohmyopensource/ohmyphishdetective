use serde::{Deserialize, Serialize};
use crate::core::mail_parser::{parse_eml, ParsedEmail, ParseError};
use crate::core::auth_check::{check_auth, AuthCheckResult};
use crate::core::url_extractor::{extract_from_html, extract_from_text, ExtractedUrl};
use crate::core::header_trace::{parse_hops, Hop};
use crate::core::ioc_aggregator::{aggregate_iocs, Ioc};
use crate::core::verdict::{compute_verdict, VerdictResult};
use crate::core::mitre_mapper::{map_to_mitre, MitreTechnique};
use crate::core::brand_impersonation::{check_brand_impersonation, BrandImpersonationResult};
use crate::core::content_heuristics::{analyze_content, ContentHeuristicsResult};
use crate::core::file_validation::{validate_eml_bytes, ValidationError};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmailAnalysis {
    pub parsed: ParsedEmail,
    pub auth: AuthCheckResult,
    pub urls: Vec<ExtractedUrl>,
    pub hops: Vec<Hop>,
    pub iocs: Vec<Ioc>,
    pub verdict: VerdictResult,
    pub mitre_techniques: Vec<MitreTechnique>,
    pub brand_impersonation: BrandImpersonationResult,
    pub content_heuristics: ContentHeuristicsResult,
}

fn run_email_analysis_inner(raw_eml: &[u8]) -> Result<EmailAnalysis, String> {
    validate_eml_bytes(raw_eml).map_err(|e: ValidationError| e.to_string())?;

    let parsed = parse_eml(raw_eml).map_err(|e: ParseError| e.to_string())?;

    let auth = check_auth(&parsed.headers.authentication_results);

    let urls = if let Some(html) = &parsed.body_html {
        extract_from_html(html)
    } else if let Some(text) = &parsed.body_text {
        extract_from_text(text)
    } else {
        Vec::new()
    };

    let hops = parse_hops(&parsed.headers.received_chain);
    let iocs = aggregate_iocs(&parsed, &hops, &urls);

    let brand_impersonation = check_brand_impersonation(
        parsed.headers.from.as_deref(),
        parsed.headers.subject.as_deref(),
        parsed.body_text.as_deref(),
    );

    let content_heuristics = analyze_content(
        parsed.headers.subject.as_deref(),
        parsed.body_text.as_deref(),
    );

    let verdict = compute_verdict(&parsed, &auth, &urls, &brand_impersonation, &content_heuristics);
    let mitre_techniques = map_to_mitre(&parsed, &auth, &urls, &brand_impersonation);

    Ok(EmailAnalysis { parsed, auth, urls, hops, iocs, verdict, mitre_techniques, brand_impersonation, content_heuristics })
}

/// Public entry point. Wraps the analysis pipeline in catch_unwind so
/// that an unexpected panic anywhere in the parsing/detection chain
/// (e.g. triggered by a maliciously malformed .eml crafted to exploit
/// an edge case in a dependency) is converted into a normal error
/// response instead of crashing the whole Tauri application.
pub fn run_email_analysis(raw_eml: &[u8]) -> Result<EmailAnalysis, String> {
    std::panic::catch_unwind(|| run_email_analysis_inner(raw_eml))
        .unwrap_or_else(|_| {
            Err("Internal error while analyzing this email — the file may be malformed or corrupted".to_string())
        })
}
