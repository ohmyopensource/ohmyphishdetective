import { invoke } from '@tauri-apps/api/core';
import type {
  EmailAnalysis,
  EmailFileInput,
  BatchAnalysisResult,
  ReportSummary,
} from '../types/email';

export async function parseEmail(rawBytes: Uint8Array): Promise<EmailAnalysis> {
  return invoke<EmailAnalysis>('parse_email_command', {
    rawEml: Array.from(rawBytes),
  });
}

export async function analyzeBatch(
  files: EmailFileInput[],
): Promise<BatchAnalysisResult> {
  return invoke<BatchAnalysisResult>('analyze_batch_command', { files });
}

export async function saveReport(result: BatchAnalysisResult): Promise<number> {
  return invoke<number>('save_report_command', { result });
}

export async function listReports(): Promise<ReportSummary[]> {
  return invoke<ReportSummary[]>('list_reports_command');
}

export async function getReport(
  id: number,
): Promise<BatchAnalysisResult | null> {
  return invoke<BatchAnalysisResult | null>('get_report_command', { id });
}

export async function deleteReport(id: number): Promise<number> {
  return invoke<number>('delete_report_command', { id });
}
