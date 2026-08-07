import { useEffect, useState } from 'react';
import { ArrowLeft, FileClock, Trash2 } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';
import { CustomText } from '../ui/CustomText';
import { CustomCard } from '../ui/CustomCard';
import { CustomBadge } from '../ui/CustomBadge';
import { SkeletonListItem } from '../ui/SkeletonPresets';
import { listReports, getReport, deleteReport } from '../../lib/tauri';
import type { ReportSummary, BatchAnalysisResult } from '../../types/email';

interface ReportsScreenProps {
  onBack: () => void;
  onOpenReport: (result: BatchAnalysisResult) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReportsScreen({ onBack, onOpenReport }: ReportsScreenProps) {
  const [reports, setReports] = useState<ReportSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listReports()
      .then(setReports)
      .catch((err) => setError(String(err)));
  }, []);

  async function handleOpen(id: number) {
    try {
      const result = await getReport(id);
      if (result) onOpenReport(result);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteReport(id);
      setReports((prev) => prev?.filter((r) => r.id !== id) ?? null);
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-ink)] px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <CustomButton
          label="Back"
          icon={<ArrowLeft size={16} />}
          variant="flat"
          size="sm"
          onClick={onBack}
          className="mb-6"
        />

        <CustomText as="h1" variant="h3" className="mb-1">
          My Reports
        </CustomText>
        <CustomText variant="body-sm" color="muted" className="mb-8">
          Previously saved analysis batches
        </CustomText>

        {error && (
          <CustomCard
            variant="error"
            padding="md"
            shadow="none"
            className="mb-4"
          >
            <CustomText variant="body-sm" color="error">
              {error}
            </CustomText>
          </CustomCard>
        )}

        {reports === null && (
          <div className="flex flex-col gap-3">
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </div>
        )}

        {reports !== null && reports.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <FileClock size={32} className="text-[var(--color-paper-dim)]" />
            <CustomText variant="body-sm" color="muted" align="center">
              No saved reports yet. Analyze some emails and save the results to
              see them here.
            </CustomText>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {reports?.map((r) => (
            <CustomCard
              key={r.id}
              padding="md"
              shadow="sm"
              hoverable
              clickable
              onCardClick={() => handleOpen(r.id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col flex-1 min-w-0">
                  <CustomText variant="body-sm">
                    {formatDate(r.created_at)}
                  </CustomText>
                  <CustomText variant="caption" color="muted">
                    {r.total_emails} email{r.total_emails !== 1 ? 's' : ''}{' '}
                    analyzed
                  </CustomText>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.clean_count > 0 && (
                    <CustomBadge
                      label={`${r.clean_count}`}
                      variant="success"
                      size="xs"
                    />
                  )}
                  {r.suspicious_count > 0 && (
                    <CustomBadge
                      label={`${r.suspicious_count}`}
                      variant="warning"
                      size="xs"
                    />
                  )}
                  {r.malicious_count > 0 && (
                    <CustomBadge
                      label={`${r.malicious_count}`}
                      variant="error"
                      size="xs"
                    />
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(r.id, e)}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-[var(--color-paper-dim)] hover:bg-white/10 hover:text-[var(--color-malicious)] transition-colors duration-150 shrink-0"
                  aria-label="Delete report"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </CustomCard>
          ))}
        </div>
      </div>
    </div>
  );
}
