use serde::{Deserialize, Serialize};
use regex::Regex;
use std::sync::OnceLock;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContentHeuristicsResult {
    pub urgency_detected: bool,
    pub excessive_punctuation: bool,
    pub repeated_word_detected: bool,
    pub matched_phrases: Vec<String>,
}

static URGENCY_PHRASES: OnceLock<Vec<String>> = OnceLock::new();

const URGENCY_PHRASES_JSON: &str =
    include_str!("../../resources/keywords/urgency_phrases.json");

fn urgency_phrases() -> &'static Vec<String> {
    URGENCY_PHRASES.get_or_init(|| {
        let parsed: HashMap<String, Vec<String>> =
            serde_json::from_str(URGENCY_PHRASES_JSON)
                .expect("urgency_phrases.json must be valid JSON");

        parsed.into_values().flatten().collect()
    })
}

static EXCESSIVE_PUNCTUATION_REGEX: OnceLock<Regex> = OnceLock::new();

/// Detects accidentally doubled consecutive words (e.g. "Copyright
/// Copyright"), common in poorly-assembled phishing templates.
fn has_repeated_word(text: &str) -> bool {
    let words: Vec<&str> = text.split_whitespace().collect();
    words.windows(2).any(|pair| {
        pair[0].len() > 2 && pair[0].eq_ignore_ascii_case(pair[1])
    })
}

fn excessive_punctuation_regex() -> &'static Regex {
    EXCESSIVE_PUNCTUATION_REGEX.get_or_init(|| {
        Regex::new(r"[!?]{3,}").unwrap()
    })
}

/// Lightweight, best-effort heuristics for the kind of "broken grammar
/// and manufactured urgency" patterns a human SOC analyst would notice
/// at a glance.
pub fn analyze_content(subject: Option<&str>, body_text: Option<&str>) -> ContentHeuristicsResult {
    let content = format!(
        "{} {}",
        subject.unwrap_or(""),
        body_text.unwrap_or("")
    ).to_lowercase();

    let matched_phrases: Vec<String> = urgency_phrases()
        .iter()
        .filter(|phrase| content.contains(phrase.as_str()))
        .cloned()
        .collect();

    ContentHeuristicsResult {
        urgency_detected: !matched_phrases.is_empty(),
        excessive_punctuation: excessive_punctuation_regex().is_match(&content),
        repeated_word_detected: has_repeated_word(&content),
        matched_phrases,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_urgency_phrase() {
        let result = analyze_content(
            Some("LAST ALERT"),
            Some("Your photos will be deleted!!"),
        );
        assert!(result.urgency_detected);
        assert!(result.matched_phrases.contains(&"will be deleted".to_string()));
    }

    #[test]
    fn detects_repeated_word() {
        let result = analyze_content(None, Some("Copyright Copyright 2025"));
        assert!(result.repeated_word_detected);
    }

    #[test]
    fn detects_excessive_punctuation() {
        let result = analyze_content(Some("URGENT!!!"), None);
        assert!(result.excessive_punctuation);
    }

    #[test]
    fn clean_content_flags_nothing() {
        let result = analyze_content(
            Some("Meeting notes"),
            Some("Let's meet tomorrow at 10am."),
        );
        assert!(!result.urgency_detected);
        assert!(!result.excessive_punctuation);
        assert!(!result.repeated_word_detected);
    }
}
