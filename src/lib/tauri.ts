import { invoke } from '@tauri-apps/api/core';
import type { EmailAnalysis } from '../types/email';

export async function parseEmail(rawBytes: Uint8Array): Promise<EmailAnalysis> {
  return invoke<EmailAnalysis>('parse_email_command', {
    rawEml: Array.from(rawBytes),
  });
}
