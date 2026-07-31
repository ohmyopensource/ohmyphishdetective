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
  urls: ExtractedUrl[];
  hops: Hop[];
  iocs: Ioc[];
  verdict: VerdictResult;
}
export interface ExtractedUrl {
  displayed_text: string | null;
  actual_url: string;
  domain: string | null;
  is_mismatch: boolean;
}

export interface Hop {
  from_helo: string | null;
  from_ip: string | null;
  by_host: string | null;
  timestamp: string | null;
  raw: string;
}

export type IocType =
  | 'IpAddress'
  | 'Domain'
  | 'Url'
  | 'Sha256'
  | 'EmailAddress';

export interface Ioc {
  ioc_type: IocType;
  value: string;
  source: string;
}

export type Verdict = 'Clean' | 'Suspicious' | 'Malicious';

export interface ScoreReason {
  description: string;
  points: number;
}

export interface VerdictResult {
  verdict: Verdict;
  score: number;
  reasons: ScoreReason[];
}
