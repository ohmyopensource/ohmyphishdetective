export interface EmailHeaders {
  from: string | null;
  reply_to: string | null;
  return_path: string | null;
  to: string[];
  subject: string | null;
  date: string | null;
  message_id: string | null;
  received_chain: string[];
  authentication_results: string[];
}

export interface Attachment {
  filename: string | null;
  content_type: string | null;
  size_bytes: number;
  sha256: string;
}

export interface ParsedEmail {
  headers: EmailHeaders;
  body_text: string | null;
  body_html: string | null;
  attachments: Attachment[];
  raw_header_block: string;
}

export type AuthVerdict =
  | 'Pass'
  | 'Fail'
  | 'SoftFail'
  | 'Neutral'
  | 'None'
  | 'NotEvaluated';

export interface AuthCheckResult {
  spf: AuthVerdict;
  dkim: AuthVerdict;
  dmarc: AuthVerdict;
  raw_source: string | null;
}

export interface EmailAnalysis {
  parsed: ParsedEmail;
  auth: AuthCheckResult;
}
