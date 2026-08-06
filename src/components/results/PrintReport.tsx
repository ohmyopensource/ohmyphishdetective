import { forwardRef } from 'react';
import type {
  BatchAnalysisResult,
  EmailAnalysis,
  Verdict,
} from '../../types/email';

interface PrintReportProps {
  result: BatchAnalysisResult;
  generatedAt: Date;
}

const verdictLabel: Record<Verdict, string> = {
  Clean: 'CLEAN',
  Suspicious: 'SUSPICIOUS',
  Malicious: 'MALICIOUS',
};

const verdictColor: Record<Verdict, string> = {
  Clean: '#2f6b45',
  Suspicious: '#8a5a10',
  Malicious: '#8a2e10',
};

function formatDate(d: Date): string {
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const PrintReport = forwardRef<HTMLDivElement, PrintReportProps>(
  function PrintReport({ result, generatedAt }, ref) {
    const { summary, results, failed_files } = result;

    const analyzedEntries = results
      .filter(
        (r): r is typeof r & { analysis: { Ok: EmailAnalysis } } =>
          'Ok' in r.analysis,
      )
      .map((r) => ({ filename: r.filename, analysis: r.analysis.Ok }));

    return (
      <div ref={ref} className="print-report">
        {/* Cover / header */}
        <div className="pr-header">
          <div className="pr-header-brand">OhMyPhishDetective!</div>
          <h1 className="pr-title">Email Security Analysis Report</h1>
          <div className="pr-meta">
            Generated on {formatDate(generatedAt)} &middot;{' '}
            {summary.total_emails} email
            {summary.total_emails !== 1 ? 's' : ''} analyzed
          </div>
        </div>

        {/* Executive summary */}
        <section className="pr-section">
          <h2 className="pr-h2">Executive Summary</h2>
          <table className="pr-summary-table">
            <tbody>
              <tr>
                <td className="pr-summary-label">Total emails analyzed</td>
                <td className="pr-summary-value">{summary.total_emails}</td>
              </tr>
              <tr>
                <td
                  className="pr-summary-label"
                  style={{ color: verdictColor.Clean }}
                >
                  Clean
                </td>
                <td className="pr-summary-value">
                  {summary.clean_count} ({summary.clean_percentage.toFixed(1)}%)
                </td>
              </tr>
              <tr>
                <td
                  className="pr-summary-label"
                  style={{ color: verdictColor.Suspicious }}
                >
                  Suspicious
                </td>
                <td className="pr-summary-value">
                  {summary.suspicious_count} (
                  {summary.suspicious_percentage.toFixed(1)}%)
                </td>
              </tr>
              <tr>
                <td
                  className="pr-summary-label"
                  style={{ color: verdictColor.Malicious }}
                >
                  Malicious
                </td>
                <td className="pr-summary-value">
                  {summary.malicious_count} (
                  {summary.malicious_percentage.toFixed(1)}%)
                </td>
              </tr>
              {failed_files.length > 0 && (
                <tr>
                  <td className="pr-summary-label">Files not analyzable</td>
                  <td className="pr-summary-value">{failed_files.length}</td>
                </tr>
              )}
            </tbody>
          </table>

          {summary.recurring_iocs.length > 0 && (
            <div className="pr-callout">
              <strong>Note:</strong> {summary.recurring_iocs.length} indicator
              {summary.recurring_iocs.length > 1 ? 's' : ''} recur across
              multiple emails in this batch, which may indicate a coordinated
              phishing campaign rather than isolated incidents.
            </div>
          )}
        </section>

        {/* Recurring IOCs table */}
        {summary.recurring_iocs.length > 0 && (
          <section className="pr-section">
            <h2 className="pr-h2">Recurring Indicators of Compromise</h2>
            <table className="pr-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Occurrences</th>
                  <th>Seen in</th>
                </tr>
              </thead>
              <tbody>
                {summary.recurring_iocs.map((ioc, i) => (
                  <tr key={i}>
                    <td>{ioc.ioc_type}</td>
                    <td className="pr-mono">{ioc.value}</td>
                    <td>{ioc.occurrence_count}</td>
                    <td className="pr-small">
                      {ioc.seen_in_emails.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Per-email detail */}
        <section className="pr-section">
          <h2 className="pr-h2">Individual Email Analysis</h2>

          {analyzedEntries.map((entry, idx) => {
            const { analysis } = entry;
            const verdict = analysis.verdict.verdict as Verdict;

            return (
              <div className="pr-email-block" key={idx}>
                <div className="pr-email-header">
                  <div>
                    <div className="pr-email-index">Email #{idx + 1}</div>
                    <div className="pr-email-filename">{entry.filename}</div>
                  </div>
                  <div
                    className="pr-verdict-stamp"
                    style={{
                      borderColor: verdictColor[verdict],
                      color: verdictColor[verdict],
                    }}
                  >
                    {verdictLabel[verdict]}
                    <span className="pr-verdict-score">
                      Score: {analysis.verdict.score}/100
                    </span>
                  </div>
                </div>

                <table className="pr-kv-table">
                  <tbody>
                    <tr>
                      <td className="pr-kv-key">From</td>
                      <td className="pr-mono">
                        {analysis.parsed.headers.from ?? '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-kv-key">Return-Path</td>
                      <td className="pr-mono">
                        {analysis.parsed.headers.return_path ?? '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-kv-key">Subject</td>
                      <td>{analysis.parsed.headers.subject ?? '—'}</td>
                    </tr>
                    <tr>
                      <td className="pr-kv-key">Authentication</td>
                      <td>
                        SPF: {analysis.auth.spf} &middot; DKIM:{' '}
                        {analysis.auth.dkim} &middot; DMARC:{' '}
                        {analysis.auth.dmarc}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="pr-subheading">Why this verdict</div>
                <table className="pr-table pr-table-compact">
                  <tbody>
                    {analysis.verdict.reasons
                      .filter((r) => r.points > 0)
                      .map((r, i) => (
                        <tr key={i}>
                          <td>{r.description}</td>
                          <td className="pr-points">+{r.points}</td>
                        </tr>
                      ))}
                    {analysis.verdict.reasons.every((r) => r.points === 0) && (
                      <tr>
                        <td colSpan={2} className="pr-small">
                          No risk signals detected — all checks passed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {analysis.mitre_techniques.length > 0 && (
                  <>
                    <div className="pr-subheading">MITRE ATT&CK Techniques</div>
                    <table className="pr-table pr-table-compact">
                      <tbody>
                        {analysis.mitre_techniques.map((t, i) => (
                          <tr key={i}>
                            <td
                              className="pr-mono"
                              style={{ whiteSpace: 'nowrap' }}
                            >
                              {t.id}
                            </td>
                            <td>{t.name}</td>
                            <td className="pr-small">{t.tactic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {analysis.iocs.length > 0 && (
                  <>
                    <div className="pr-subheading">
                      Indicators of Compromise
                    </div>
                    <table className="pr-table pr-table-compact">
                      <tbody>
                        {analysis.iocs.map((ioc, i) => (
                          <tr key={i}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {ioc.ioc_type}
                            </td>
                            <td className="pr-mono">{ioc.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            );
          })}
        </section>

        <div className="pr-footer">
          Generated by OhMyPhishDetective! — automated analysis. Findings should
          be reviewed by a qualified security professional before acting on
          them.
        </div>
      </div>
    );
  },
);
