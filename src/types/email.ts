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
  mitre_techniques: MitreTechnique[];
  brand_impersonation: BrandImpersonationResult;
  content_heuristics: ContentHeuristicsResult;
}

export interface ExtractedUrl {
  displayed_text: string | null;
  actual_url: string;
  domain: string | null;
  is_mismatch: boolean;
  looks_like_credential_harvesting: boolean;
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

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  evidence: string;
}

export interface BrandImpersonationResult {
  detected: boolean;
  brand: string | null;
  sender_domain: string | null;
  reason: string | null;
}

export interface ContentHeuristicsResult {
  urgency_detected: boolean;
  excessive_punctuation: boolean;
  repeated_word_detected: boolean;
  matched_phrases: string[];
}

export interface EmailFileInput {
  filename: string;
  raw_eml: number[];
}

export interface EmailBatchResultItem {
  filename: string;
  analysis: { Ok: EmailAnalysis } | { Err: string };
}

export interface RecurringIoc {
  ioc_type: string;
  value: string;
  occurrence_count: number;
  seen_in_emails: string[];
}

export interface RecurringTechnique {
  id: string;
  name: string;
  occurrence_count: number;
}

export interface BatchSummary {
  total_emails: number;
  clean_count: number;
  suspicious_count: number;
  malicious_count: number;
  clean_percentage: number;
  suspicious_percentage: number;
  malicious_percentage: number;
  recurring_iocs: RecurringIoc[];
  recurring_mitre_techniques: RecurringTechnique[];
}

export interface BatchAnalysisResult {
  results: EmailBatchResultItem[];
  summary: BatchSummary;
  failed_files: FailedFile[];
}

export interface FailedFile {
  filename: string;
  error: string;
}

export interface ReportSummary {
  id: number;
  created_at: string;
  total_emails: number;
  clean_count: number;
  suspicious_count: number;
  malicious_count: number;
}
