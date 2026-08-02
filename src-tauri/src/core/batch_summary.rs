use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::core::verdict::Verdict;
use crate::core::ioc_aggregator::Ioc;
use crate::core::mitre_mapper::MitreTechnique;

/// A lightweight per-email summary used for batch aggregation.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmailBatchEntry {
    pub filename: String,
    pub verdict: Verdict,
    pub score: u32,
    pub iocs: Vec<Ioc>,
    pub mitre_techniques: Vec<MitreTechnique>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecurringIoc {
    pub ioc_type: String,
    pub value: String,
    pub occurrence_count: u32,
    pub seen_in_emails: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecurringTechnique {
    pub id: String,
    pub name: String,
    pub occurrence_count: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchSummary {
    pub total_emails: u32,
    pub clean_count: u32,
    pub suspicious_count: u32,
    pub malicious_count: u32,
    pub clean_percentage: f32,
    pub suspicious_percentage: f32,
    pub malicious_percentage: f32,
    pub recurring_iocs: Vec<RecurringIoc>,
    pub recurring_mitre_techniques: Vec<RecurringTechnique>,
}

/// Aggregates per-email results into a batch-level summary: verdict
/// distribution with percentages, plus IOCs and MITRE techniques that
/// recur across multiple emails.
pub fn compute_batch_summary(entries: &[EmailBatchEntry]) -> BatchSummary {
    let total_emails = entries.len() as u32;

    let clean_count = entries.iter().filter(|e| e.verdict == Verdict::Clean).count() as u32;
    let suspicious_count = entries.iter().filter(|e| e.verdict == Verdict::Suspicious).count() as u32;
    let malicious_count = entries.iter().filter(|e| e.verdict == Verdict::Malicious).count() as u32;

    let pct = |count: u32| -> f32 {
        if total_emails == 0 {
            0.0
        } else {
            (count as f32 / total_emails as f32) * 100.0
        }
    };

    let recurring_iocs = find_recurring_iocs(entries);
    let recurring_mitre_techniques = find_recurring_techniques(entries);

    BatchSummary {
        total_emails,
        clean_count,
        suspicious_count,
        malicious_count,
        clean_percentage: pct(clean_count),
        suspicious_percentage: pct(suspicious_count),
        malicious_percentage: pct(malicious_count),
        recurring_iocs,
        recurring_mitre_techniques,
    }
}

fn find_recurring_iocs(entries: &[EmailBatchEntry]) -> Vec<RecurringIoc> {
    let mut occurrences: HashMap<(String, String), Vec<String>> = HashMap::new();

    for entry in entries {
        for ioc in &entry.iocs {
            let key = (format!("{:?}", ioc.ioc_type), ioc.value.clone());
            occurrences
                .entry(key)
                .or_default()
                .push(entry.filename.clone());
        }
    }

    let mut recurring: Vec<RecurringIoc> = occurrences
        .into_iter()
        .filter(|(_, filenames)| filenames.len() > 1)
        .map(|((ioc_type, value), filenames)| RecurringIoc {
            ioc_type,
            value,
            occurrence_count: filenames.len() as u32,
            seen_in_emails: filenames,
        })
        .collect();

    recurring.sort_by(|a, b| b.occurrence_count.cmp(&a.occurrence_count));
    recurring
}

fn find_recurring_techniques(entries: &[EmailBatchEntry]) -> Vec<RecurringTechnique> {
    let mut occurrences: HashMap<(String, String), u32> = HashMap::new();

    for entry in entries {
        for technique in &entry.mitre_techniques {
            let key = (technique.id.clone(), technique.name.clone());
            *occurrences.entry(key).or_insert(0) += 1;
        }
    }

    let mut recurring: Vec<RecurringTechnique> = occurrences
        .into_iter()
        .map(|((id, name), count)| RecurringTechnique {
            id,
            name,
            occurrence_count: count,
        })
        .collect();

    recurring.sort_by(|a, b| b.occurrence_count.cmp(&a.occurrence_count));
    recurring
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::ioc_aggregator::IocType;

    fn make_entry(filename: &str, verdict: Verdict, iocs: Vec<Ioc>) -> EmailBatchEntry {
        EmailBatchEntry {
            filename: filename.to_string(),
            verdict,
            score: 0,
            iocs,
            mitre_techniques: vec![],
        }
    }

    #[test]
    fn computes_percentages_correctly() {
        let entries = vec![
            make_entry("a.eml", Verdict::Clean, vec![]),
            make_entry("b.eml", Verdict::Suspicious, vec![]),
            make_entry("c.eml", Verdict::Malicious, vec![]),
            make_entry("d.eml", Verdict::Malicious, vec![]),
        ];
        let summary = compute_batch_summary(&entries);
        assert_eq!(summary.total_emails, 4);
        assert_eq!(summary.clean_count, 1);
        assert_eq!(summary.suspicious_count, 1);
        assert_eq!(summary.malicious_count, 2);
        assert_eq!(summary.clean_percentage, 25.0);
        assert_eq!(summary.malicious_percentage, 50.0);
    }

    #[test]
    fn detects_recurring_ioc_across_emails() {
        let shared_ioc = Ioc {
            ioc_type: IocType::Domain,
            value: "evil.com".to_string(),
            source: "Body link domain".to_string(),
        };
        let entries = vec![
            make_entry("a.eml", Verdict::Malicious, vec![shared_ioc.clone()]),
            make_entry("b.eml", Verdict::Malicious, vec![shared_ioc.clone()]),
            make_entry("c.eml", Verdict::Clean, vec![]),
        ];
        let summary = compute_batch_summary(&entries);
        assert_eq!(summary.recurring_iocs.len(), 1);
        assert_eq!(summary.recurring_iocs[0].occurrence_count, 2);
        assert_eq!(summary.recurring_iocs[0].seen_in_emails, vec!["a.eml", "b.eml"]);
    }

    #[test]
    fn ioc_seen_once_is_not_recurring() {
        let unique_ioc = Ioc {
            ioc_type: IocType::Domain,
            value: "onlyonce.com".to_string(),
            source: "Body link domain".to_string(),
        };
        let entries = vec![make_entry("a.eml", Verdict::Malicious, vec![unique_ioc])];
        let summary = compute_batch_summary(&entries);
        assert!(summary.recurring_iocs.is_empty());
    }

    #[test]
    fn empty_batch_does_not_panic() {
        let summary = compute_batch_summary(&[]);
        assert_eq!(summary.total_emails, 0);
        assert_eq!(summary.clean_percentage, 0.0);
    }
}
