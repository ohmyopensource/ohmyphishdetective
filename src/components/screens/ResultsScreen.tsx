import {
  ArrowLeft,
  RotateCcw,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TriangleAlert,
} from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';
import { CustomText } from '../ui/CustomText';
import { CustomCardStat } from '../ui/CustomCardStat';
import { CustomAccordion } from '../ui/CustomAccordion';
import { CustomBadge } from '../ui/CustomBadge';
import { CustomCard } from '../ui/CustomCard';
import { EmailDetail } from '../results/EmailDetail';
import type { AccordionItem, AccordionVariant } from '../ui/CustomAccordion';
import type { BatchAnalysisResult, Verdict } from '../../types/email';

interface ResultsScreenProps {
  result: BatchAnalysisResult;
  onBack: () => void;
  onNewAnalysis: () => void;
}

const verdictAccordionVariant: Record<Verdict, AccordionVariant> = {
  Clean: 'success',
  Suspicious: 'warning',
  Malicious: 'error',
};

const verdictBadgeVariant: Record<Verdict, 'success' | 'warning' | 'error'> = {
  Clean: 'success',
  Suspicious: 'warning',
  Malicious: 'error',
};

const verdictIcon: Record<Verdict, React.ReactNode> = {
  Clean: <ShieldCheck size={16} />,
  Suspicious: <ShieldAlert size={16} />,
  Malicious: <ShieldX size={16} />,
};

export function ResultsScreen({
  result,
  onBack,
  onNewAnalysis,
}: ResultsScreenProps) {
  const { summary, results, failed_files } = result;

  const accordionItems: AccordionItem[] = [];
  for (const r of results) {
    if (!('Ok' in r.analysis)) continue;
    const analysis = r.analysis.Ok;
    const verdict = analysis.verdict.verdict as Verdict;

    accordionItems.push({
      title: (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="shrink-0">{verdictIcon[verdict]}</span>
          <span className="truncate flex-1">{r.filename}</span>
          <CustomBadge
            label={verdict}
            variant={verdictBadgeVariant[verdict]}
            size="sm"
          />
          <CustomBadge
            label={`${analysis.verdict.score}`}
            variant="neutral"
            size="sm"
            shape="rounded"
          />
        </div>
      ),
      variant: verdictAccordionVariant[verdict],
      content: <EmailDetail analysis={analysis} />,
    });
  }

  return (
    <div className="min-h-screen bg-[var(--color-ink)] px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <CustomButton
            label="Back to Menu"
            icon={<ArrowLeft size={16} />}
            variant="flat"
            size="sm"
            onClick={onBack}
          />
          <CustomButton
            label="New Analysis"
            icon={<RotateCcw size={16} />}
            variant="secondary"
            size="sm"
            onClick={onNewAnalysis}
          />
        </div>

        <CustomText as="h1" variant="h3" className="mb-1">
          Analysis Results
        </CustomText>
        <CustomText variant="body-sm" color="muted" className="mb-6">
          {summary.total_emails} email{summary.total_emails !== 1 ? 's' : ''}{' '}
          analyzed
        </CustomText>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <CustomCardStat
            value={summary.total_emails}
            label="Total"
            icon={<Mail size={18} />}
            variant="default"
          />
          <CustomCardStat
            value={summary.clean_count}
            suffix={`(${summary.clean_percentage.toFixed(0)}%)`}
            label="Clean"
            icon={<ShieldCheck size={18} />}
            variant="success"
          />
          <CustomCardStat
            value={summary.suspicious_count}
            suffix={`(${summary.suspicious_percentage.toFixed(0)}%)`}
            label="Suspicious"
            icon={<ShieldAlert size={18} />}
            variant="warning"
          />
          <CustomCardStat
            value={summary.malicious_count}
            suffix={`(${summary.malicious_percentage.toFixed(0)}%)`}
            label="Malicious"
            icon={<ShieldX size={18} />}
            variant="error"
          />
        </div>

        {/* Recurring IOCs */}
        {summary.recurring_iocs.length > 0 && (
          <CustomCard
            variant="warning"
            padding="md"
            shadow="sm"
            accentBar
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <TriangleAlert
                size={16}
                className="text-[var(--color-suspicious)]"
              />
              <CustomText variant="label" color="warning">
                Recurring indicators across multiple emails
              </CustomText>
            </div>
            <div className="flex flex-col gap-1.5">
              {summary.recurring_iocs.slice(0, 5).map((ioc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <CustomText
                    variant="body-sm"
                    className="font-mono truncate flex-1"
                  >
                    {ioc.value}
                  </CustomText>
                  <CustomBadge
                    label={`${ioc.occurrence_count}x`}
                    variant="warning"
                    size="xs"
                  />
                </div>
              ))}
            </div>
          </CustomCard>
        )}

        {/* Failed files */}
        {failed_files.length > 0 && (
          <CustomCard
            variant="neutral"
            padding="md"
            shadow="sm"
            className="mb-4"
          >
            <CustomText variant="label" color="muted" className="block mb-2">
              {failed_files.length} file{failed_files.length > 1 ? 's' : ''}{' '}
              could not be analyzed
            </CustomText>
            <div className="flex flex-col gap-1">
              {failed_files.map((f, i) => (
                <CustomText key={i} variant="caption" color="subtle">
                  {f.filename} — {f.error}
                </CustomText>
              ))}
            </div>
          </CustomCard>
        )}

        {/* Per-email results */}
        {accordionItems.length > 0 && (
          <>
            <CustomText variant="label" color="muted" className="block mb-3">
              Individual Results
            </CustomText>
            <CustomAccordion items={accordionItems} size="md" radius="md" />
          </>
        )}
      </div>
    </div>
  );
}
