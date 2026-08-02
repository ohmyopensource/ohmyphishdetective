import { invoke } from '@tauri-apps/api/core';
import type {
  EmailAnalysis,
  EmailFileInput,
  BatchAnalysisResult,
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
