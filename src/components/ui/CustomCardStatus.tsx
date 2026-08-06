import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react';
import { CustomCard } from './CustomCard';
import type { CardPadding, CardShadow } from './CustomCard';

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

interface CustomCardStatusProps {
  statusVariant?: StatusVariant;
  icon?: ReactNode;
  title: string;
  description?: string;
  padding?: CardPadding;
  shadow?: CardShadow;
  bordered?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  stretchHeight?: boolean;
  onCardClick?: (e: ReactMouseEvent) => void;
  className?: string;
  children?: ReactNode;
}

const iconWrapClass: Record<StatusVariant, string> = {
  success:
    'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] text-white',
  warning:
    'bg-gradient-to-br from-[#dba13f] to-[var(--color-suspicious)] text-[var(--color-ink)]',
  error:
    'bg-gradient-to-br from-[#c85a3d] to-[var(--color-malicious)] text-white',
  info: 'bg-gradient-to-br from-[#4a90c9] to-[#3573a3] text-white',
  neutral: 'bg-white/10 text-[var(--color-paper-dim)]',
};

const cardVariantMap: Record<
  StatusVariant,
  'success' | 'warning' | 'error' | 'info' | 'neutral'
> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  neutral: 'neutral',
};

export function CustomCardStatus({
  statusVariant = 'success',
  icon,
  title,
  description,
  padding = 'md',
  shadow = 'md',
  bordered = true,
  hoverable = false,
  clickable = false,
  stretchHeight = false,
  onCardClick,
  className = '',
  children,
}: CustomCardStatusProps) {
  return (
    <CustomCard
      variant={cardVariantMap[statusVariant]}
      padding={padding}
      shadow={shadow}
      bordered={bordered}
      accentBar
      hoverable={hoverable}
      clickable={clickable}
      stretchHeight={stretchHeight}
      onCardClick={onCardClick}
      className={className}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 pt-0.5">
          <div
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${iconWrapClass[statusVariant]}`}
          >
            {icon}
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="font-display text-sm font-bold text-[var(--color-paper)] leading-tight">
            {title}
          </span>
          {description && (
            <span className="font-body text-sm text-[var(--color-paper-dim)] leading-snug">
              {description}
            </span>
          )}
          {children}
        </div>
      </div>
    </CustomCard>
  );
}
