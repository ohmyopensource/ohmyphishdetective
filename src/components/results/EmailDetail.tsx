import { useState } from 'react';
import {
  Mail,
  Link2,
  Fingerprint,
  Shield,
  MessageSquareWarning,
} from 'lucide-react';
import { CustomTabs } from '../ui/CustomTabs';
import { CustomText } from '../ui/CustomText';
import { CustomBadge } from '../ui/CustomBadge';
import type { EmailAnalysis, AuthVerdict } from '../../types/email';

interface EmailDetailProps {
  analysis: EmailAnalysis;
}

const authVerdictVariant: Record<
  AuthVerdict,
  'success' | 'error' | 'warning' | 'neutral'
> = {
  Pass: 'success',
  Fail: 'error',
  SoftFail: 'warning',
  Neutral: 'neutral',
  None: 'neutral',
  NotEvaluated: 'neutral',
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 py-2.5 border-b border-white/5 last:border-0">
      <CustomText variant="caption" color="subtle">
        {label}
      </CustomText>
      <div>{children}</div>
    </div>
  );
}

export function EmailDetail({ analysis }: EmailDetailProps) {
  const [tab, setTab] = useState('headers');

  return (
    <div>
      <CustomTabs
        tabs={[
          { id: 'headers', label: 'Headers', icon: <Mail size={14} /> },
          {
            id: 'urls',
            label: 'URLs',
            badge: analysis.urls.length || undefined,
          },
          {
            id: 'iocs',
            label: 'IOCs',
            badge: analysis.iocs.length || undefined,
          },
          {
            id: 'mitre',
            label: 'MITRE',
            badge: analysis.mitre_techniques.length || undefined,
          },
          {
            id: 'content',
            label: 'Content',
            icon: <MessageSquareWarning size={14} />,
          },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        tabStyle="underline"
        variant="primary"
        size="sm"
      />

      <div className="pt-4">
        {tab === 'headers' && (
          <div>
            <Row label="From">
              <CustomText variant="body-sm" className="font-mono break-all">
                {analysis.parsed.headers.from ?? '—'}
              </CustomText>
            </Row>
            <Row label="Return-Path">
              <CustomText variant="body-sm" className="font-mono break-all">
                {analysis.parsed.headers.return_path ?? '—'}
              </CustomText>
            </Row>
            <Row label="Subject">
              <CustomText variant="body-sm">
                {analysis.parsed.headers.subject ?? '—'}
              </CustomText>
            </Row>
            <Row label="Authentication">
              <div className="flex flex-wrap gap-2">
                <CustomBadge
                  label={`SPF: ${analysis.auth.spf}`}
                  variant={authVerdictVariant[analysis.auth.spf]}
                  size="sm"
                />
                <CustomBadge
                  label={`DKIM: ${analysis.auth.dkim}`}
                  variant={authVerdictVariant[analysis.auth.dkim]}
                  size="sm"
                />
                <CustomBadge
                  label={`DMARC: ${analysis.auth.dmarc}`}
                  variant={authVerdictVariant[analysis.auth.dmarc]}
                  size="sm"
                />
              </div>
            </Row>
            <Row label={`Received chain (${analysis.hops.length} hops)`}>
              <div className="flex flex-col gap-2">
                {analysis.hops.map((hop, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-[var(--color-paper-dim)] leading-relaxed"
                  >
                    <span className="text-[var(--color-evidence)]">
                      #{i + 1}
                    </span>{' '}
                    {hop.from_helo ?? '?'} {hop.from_ip && `[${hop.from_ip}]`} →{' '}
                    {hop.by_host ?? '?'}
                    {hop.timestamp && (
                      <span className="text-[var(--color-paper-dim)]/60">
                        {' '}
                        · {hop.timestamp}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Row>
          </div>
        )}

        {tab === 'urls' && (
          <div className="flex flex-col gap-2">
            {analysis.urls.length === 0 && (
              <CustomText variant="body-sm" color="muted">
                No links found in this email.
              </CustomText>
            )}
            {analysis.urls.map((url, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-white/[0.03] border border-white/5"
              >
                {url.displayed_text && (
                  <CustomText
                    variant="caption"
                    color="subtle"
                    className="block mb-1"
                  >
                    Displayed as: "{url.displayed_text.slice(0, 60)}"
                  </CustomText>
                )}
                <CustomText
                  variant="body-sm"
                  className="font-mono break-all block"
                >
                  {url.actual_url}
                </CustomText>
                <div className="flex gap-2 mt-2">
                  {url.is_mismatch && (
                    <CustomBadge
                      label="Text mismatch"
                      variant="error"
                      size="xs"
                    />
                  )}
                  {url.looks_like_credential_harvesting && (
                    <CustomBadge
                      label="Credential keywords"
                      variant="warning"
                      size="xs"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'iocs' && (
          <div className="flex flex-col gap-1.5">
            {analysis.iocs.map((ioc, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <CustomBadge
                  label={ioc.ioc_type}
                  variant="neutral"
                  size="xs"
                  shape="rounded"
                />
                <CustomText
                  variant="body-sm"
                  className="font-mono break-all flex-1"
                >
                  {ioc.value}
                </CustomText>
              </div>
            ))}
          </div>
        )}

        {tab === 'mitre' && (
          <div className="flex flex-col gap-3">
            {analysis.mitre_techniques.length === 0 && (
              <CustomText variant="body-sm" color="muted">
                No MITRE ATT&CK techniques detected.
              </CustomText>
            )}
            {analysis.mitre_techniques.map((t, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield size={14} className="text-[var(--color-evidence)]" />
                  <CustomText variant="label">
                    {t.id} — {t.name}
                  </CustomText>
                </div>
                <CustomBadge
                  label={t.tactic}
                  variant="info"
                  size="xs"
                  className="mb-2"
                />
                <CustomText variant="caption" color="muted" className="block">
                  {t.evidence}
                </CustomText>
              </div>
            ))}
          </div>
        )}

        {tab === 'content' && (
          <div className="flex flex-col gap-3">
            {analysis.brand_impersonation.detected && (
              <div className="p-3 rounded-lg bg-[var(--color-malicious-bg)] border border-[var(--color-malicious)]/30">
                <CustomText
                  variant="label"
                  color="error"
                  className="block mb-1"
                >
                  Brand impersonation detected
                </CustomText>
                <CustomText variant="body-sm" color="muted">
                  {analysis.brand_impersonation.reason}
                </CustomText>
              </div>
            )}
            {analysis.content_heuristics.matched_phrases.length > 0 && (
              <Row label="Urgency phrases">
                <div className="flex flex-wrap gap-1.5">
                  {analysis.content_heuristics.matched_phrases.map((p, i) => (
                    <CustomBadge
                      key={i}
                      label={p}
                      variant="warning"
                      size="xs"
                    />
                  ))}
                </div>
              </Row>
            )}
            <Row label="Score breakdown">
              <div className="flex flex-col gap-1.5">
                {analysis.verdict.reasons.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <CustomText
                      variant="body-sm"
                      color={r.points > 0 ? 'default' : 'muted'}
                      className="flex-1"
                    >
                      {r.description}
                    </CustomText>
                    {r.points > 0 && (
                      <CustomText variant="label" color="error">
                        +{r.points}
                      </CustomText>
                    )}
                  </div>
                ))}
              </div>
            </Row>
          </div>
        )}
      </div>
    </div>
  );
}
