use serde::{Deserialize, Serialize};

use crate::commands::analysis::{run_email_analysis, EmailAnalysis};
use crate::core::batch_summary::{compute_batch_summary, BatchSummary, EmailBatchEntry};

#[derive(Debug, Deserialize)]
pub struct EmailFileInput {
    pub filename: String,
    pub raw_eml: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmailBatchResultItem {
    pub filename: String,
    pub analysis: Result<EmailAnalysis, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FailedFile {
    pub filename: String,
    pub error: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchAnalysisResult {
    pub results: Vec<EmailBatchResultItem>,
    pub summary: BatchSummary,
    pub failed_files: Vec<FailedFile>,
}

#[tauri::command]
pub fn analyze_batch_command(files: Vec<EmailFileInput>) -> BatchAnalysisResult {
    let mut results = Vec::new();
    let mut summary_entries = Vec::new();
    let mut failed_files = Vec::new();

    for file in files {
        let analysis = run_email_analysis(&file.raw_eml);

        match &analysis {
            Ok(a) => {
                summary_entries.push(EmailBatchEntry {
                    filename: file.filename.clone(),
                    verdict: a.verdict.verdict.clone(),
                    score: a.verdict.score,
                    iocs: a.iocs.clone(),
                    mitre_techniques: a.mitre_techniques.clone(),
                });
            }
            Err(e) => {
                failed_files.push(FailedFile {
                    filename: file.filename.clone(),
                    error: e.clone(),
                });
            }
        }

        results.push(EmailBatchResultItem {
            filename: file.filename,
            analysis,
        });
    }

    let summary = compute_batch_summary(&summary_entries);

    BatchAnalysisResult { results, summary, failed_files }
}
