import { invoke } from '@tauri-apps/api/core';
import type { ParsedEmail } from '../types/email';

export async function parseEmail(rawBytes: Uint8Array): Promise<ParsedEmail> {
  return invoke<ParsedEmail>('parse_email_command', {
    rawEml: Array.from(rawBytes),
  });
}
