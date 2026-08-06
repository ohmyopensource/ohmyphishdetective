import type { ReactNode } from 'react';
import { CustomCard } from './CustomCard';
import type { CardVariant, CardPadding, CardShadow } from './CustomCard';

export interface StatTrend {
  direction: 'up' | 'down' | 'neutral';
  value: string;
}

interface CustomCardStatProps {
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  trend?: StatTrend;
  variant?: CardVariant;
  padding?: CardPadding;
  shadow?: CardShadow;
  bordered?: boolean;
  accentBar?: boolean;
  stretchHeight?: boolean;
  className?: string;
}

const iconWrapClass: Record<CardVariant, string> = {
  default: 'bg-white/5 text-[var(--color-paper)]',
  primary: 'bg-[var(--color-evidence)]/15 text-[var(--color-evidence)]',
  secondary: 'bg-white/5 text-[var(--color-paper)]',
  tertiary: 'bg-white/5 text-[var(--color-paper-dim)]',
  success: 'bg-[var(--color-clean)]/15 text-[var(--color-clean)]',
  warning: 'bg-[var(--color-suspicious)]/15 text-[var(--color-suspicious)]',
  error: 'bg-[var(--color-malicious)]/15 text-[var(--color-malicious)]',
  info: 'bg-[#4a90c9]/15 text-[#4a90c9]',
  neutral: 'bg-white/5 text-[var(--color-paper-dim)]',
};

const trendClass: Record<StatTrend['direction'], string> = {
  up: 'text-[var(--color-clean)]',
  down: 'text-[var(--color-malicious)]',
  neutral: 'text-[var(--color-paper-dim)]',
};

const trendArrow: Record<StatTrend['direction'], string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export function CustomCardStat({
  value,
  label,
  prefix,
  suffix,
  icon,
  trend,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  bordered = true,
  accentBar = false,
  stretchHeight = false,
  className = '',
}: CustomCardStatProps) {
  return (
    <CustomCard
      variant={variant}
      padding={padding}
      shadow={shadow}
      bordered={bordered}
      accentBar={accentBar}
      stretchHeight={stretchHeight}
      className={className}
    >
      <div className="flex flex-col gap-1.5">
        {icon && (
          <div
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-1 ${iconWrapClass[variant]}`}
          >
            {icon}
          </div>
        )}
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className="font-display text-lg font-bold text-[var(--color-paper-dim)]">
              {prefix}
            </span>
          )}
          <span className="font-display text-4xl font-extrabold text-[var(--color-paper)] leading-none">
            {value}
          </span>
          {suffix && (
            <span className="font-display text-lg font-bold text-[var(--color-paper-dim)]">
              {suffix}
            </span>
          )}
        </div>
        <span className="font-body text-sm font-medium text-[var(--color-paper-dim)]">
          {label}
        </span>
        {trend && (
          <span
            className={`font-body text-xs font-bold ${trendClass[trend.direction]}`}
          >
            {trendArrow[trend.direction]} {trend.value}
          </span>
        )}
      </div>
    </CustomCard>
  );
}
