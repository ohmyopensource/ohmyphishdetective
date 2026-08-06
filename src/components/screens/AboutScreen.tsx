import { ArrowLeft, ShieldAlert, GitFork, Scale, Code2 } from 'lucide-react';
import { CustomCard } from '../ui/CustomCard';
import { CustomText } from '../ui/CustomText';
import { CustomButton } from '../ui/CustomButton';
import { CustomBadge } from '../ui/CustomBadge';

interface AboutScreenProps {
  onBack: () => void;
}

const techStack = ['Rust', 'Tauri 2', 'React', 'TypeScript', 'Tailwind CSS'];

export function AboutScreen({ onBack }: AboutScreenProps) {
  return (
    <div className="min-h-screen bg-[var(--color-ink)] px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Back */}
        <CustomButton
          label="Back"
          icon={<ArrowLeft size={16} />}
          variant="flat"
          size="sm"
          onClick={onBack}
          className="mb-8"
        />

        {/* Brand header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[var(--color-evidence)] to-[#a8841f] flex items-center justify-center shadow-[0_8px_32px_rgba(201,162,39,0.35)] mb-4 -rotate-2">
            <ShieldAlert
              size={32}
              className="text-[var(--color-ink)]"
              strokeWidth={2.2}
            />
          </div>
          <CustomText as="h1" variant="h3" align="center">
            OhMyPhishDetective
            <span className="text-[var(--color-evidence)]">!</span>
          </CustomText>
          <CustomBadge
            label="v0.1.0"
            variant="ghost"
            size="sm"
            className="mt-3"
          />
        </div>

        {/* Description */}
        <CustomCard padding="lg" shadow="sm" className="mb-4">
          <CustomText variant="body" color="muted" className="leading-relaxed">
            A cross-platform desktop application for analyzing suspicious emails
            (.eml / .msg). It inspects authentication headers, extracts links
            and indicators of compromise, maps findings to the MITRE ATT&CK
            framework, and produces a clear, exportable report — no data leaves
            your machine unless you opt in to third-party reputation lookups.
          </CustomText>
        </CustomCard>

        {/* Tech stack */}
        <CustomCard padding="lg" shadow="sm" className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={16} className="text-[var(--color-paper-dim)]" />
            <CustomText variant="label" color="muted">
              Built with
            </CustomText>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t) => (
              <CustomBadge
                key={t}
                label={t}
                variant="neutral"
                size="sm"
                shape="rounded"
              />
            ))}
          </div>
        </CustomCard>

        {/* License */}
        <CustomCard padding="lg" shadow="sm" className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={16} className="text-[var(--color-paper-dim)]" />
            <CustomText variant="label" color="muted">
              License
            </CustomText>
          </div>
          <CustomText variant="body-sm" color="muted">
            Released under the GNU Affero General Public License v3.0 (AGPLv3).
          </CustomText>
        </CustomCard>

        {/* Organization / links */}
        <CustomCard
          padding="lg"
          shadow="sm"
          hoverable
          clickable
          onCardClick={() =>
            window.open('https://github.com/OhMyOpenSource', '_blank')
          }
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-[var(--color-paper-dim)] shrink-0">
              <GitFork size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <CustomText variant="h6">OhMyOpenSource!</CustomText>
              <CustomText variant="caption" color="muted">
                github.com/OhMyOpenSource
              </CustomText>
            </div>
          </div>
        </CustomCard>

        <CustomText
          variant="caption"
          color="subtle"
          align="center"
          className="block mt-8"
        >
          Made by OhMyOpenSource!
        </CustomText>
      </div>
    </div>
  );
}
