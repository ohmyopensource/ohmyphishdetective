import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'ghost'
  | 'outline'
  | 'flat'
  | 'neutral';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgeShape = 'pill' | 'rounded' | 'square';
export type IconPosition = 'left' | 'right';

interface CustomBadgeProps {
  label?: string;
  count?: number;
  maxCount?: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  dot?: boolean;
  removable?: boolean;
  ariaLabel?: string;
  onRemove?: () => void;
  className?: string;
}

const iconSizeMap: Record<BadgeSize, number> = {
  xs: 10,
  sm: 11,
  md: 12,
  lg: 14,
};
const closeSizeMap: Record<BadgeSize, number> = {
  xs: 9,
  sm: 10,
  md: 11,
  lg: 12,
};

const sizeClass: Record<BadgeSize, string> = {
  xs: 'px-2.5 py-0.5 text-[0.6rem] min-h-[18px] gap-1',
  sm: 'px-2.5 py-1 text-[0.7rem] min-h-[22px] gap-1',
  md: 'px-3 py-1 text-xs min-h-[26px] gap-1.5',
  lg: 'px-4 py-1.5 text-sm min-h-[32px] gap-1.5',
};

const dotOnlySizeClass: Record<BadgeSize, string> = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const shapeClass: Record<BadgeShape, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-lg',
  square: 'rounded',
};

const variantClass: Record<BadgeVariant, string> = {
  primary:
    'bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] text-[var(--color-ink)] border-[#a8841f] shadow-[0_2px_8px_rgba(201,162,39,0.3)]',
  secondary:
    'bg-gradient-to-br from-[#4a5163] to-[#3a4150] text-[var(--color-paper)] border-[#3a4150] shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
  tertiary:
    'bg-gradient-to-br from-[var(--color-ink-soft)] to-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-line)]',
  success:
    'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] text-white border-[var(--color-clean)] shadow-[0_2px_8px_rgba(74,124,89,0.3)]',
  warning:
    'bg-gradient-to-br from-[#dba13f] to-[var(--color-suspicious)] text-[var(--color-ink)] border-[var(--color-suspicious)] shadow-[0_2px_8px_rgba(201,138,44,0.3)]',
  error:
    'bg-gradient-to-br from-[#c85a3d] to-[var(--color-malicious)] text-white border-[var(--color-malicious)] shadow-[0_2px_8px_rgba(179,69,44,0.3)]',
  info: 'bg-gradient-to-br from-[#4a90c9] to-[#3573a3] text-white border-[#3573a3] shadow-[0_2px_8px_rgba(53,115,163,0.3)]',
  neutral:
    'bg-gradient-to-br from-[#3a4150] to-[#2b313c] text-[var(--color-paper-dim)] border-[var(--color-line)]',
  ghost:
    'bg-transparent text-[var(--color-paper-dim)] border-[var(--color-line)]',
  outline:
    'bg-transparent text-[var(--color-evidence)] border-[var(--color-evidence)]',
  flat: 'bg-transparent text-[var(--color-evidence)] border-transparent',
};

const dotColorClass: Record<BadgeVariant, string> = {
  primary: 'bg-[var(--color-evidence)]',
  secondary: 'bg-[#4a5163]',
  tertiary: 'bg-[var(--color-paper-dim)]',
  success: 'bg-[var(--color-clean)]',
  warning: 'bg-[var(--color-suspicious)]',
  error: 'bg-[var(--color-malicious)]',
  info: 'bg-[#4a90c9]',
  neutral: 'bg-[var(--color-paper-dim)]',
  ghost: 'bg-[var(--color-paper-dim)]',
  outline: 'bg-[var(--color-evidence)]',
  flat: 'bg-[var(--color-evidence)]',
};

export function CustomBadge({
  label,
  count = 0,
  maxCount = 99,
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  icon,
  iconPosition = 'left',
  dot = false,
  removable = false,
  ariaLabel,
  onRemove,
  className = '',
}: CustomBadgeProps) {
  const isCountMode = count > 0;
  const isDotOnly = dot && !label && !isCountMode;
  const displayCount = count > maxCount ? `${maxCount}+` : `${count}`;

  const classes = [
    'inline-flex items-center justify-center font-display font-bold tracking-wide whitespace-nowrap select-none border',
    'transition-[box-shadow,transform] duration-200',
    isDotOnly ? dotOnlySizeClass[size] : sizeClass[size],
    shapeClass[shape],
    isDotOnly
      ? 'p-0 border-none bg-transparent shadow-none'
      : variantClass[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classes}
      aria-label={ariaLabel || label || undefined}
      role={removable ? 'status' : undefined}
    >
      {isDotOnly && (
        <span
          className={`w-full h-full rounded-full ${dotColorClass[variant]}`}
          aria-hidden
        />
      )}

      {dot && !isDotOnly && (
        <span
          className={`inline-block rounded-full shrink-0 w-1.5 h-1.5 ${dotColorClass[variant]}`}
          aria-hidden
        />
      )}

      {icon && iconPosition === 'left' && !isCountMode && !isDotOnly && (
        <span
          className="flex items-center"
          style={{ fontSize: iconSizeMap[size] }}
          aria-hidden
        >
          {icon}
        </span>
      )}

      {!isDotOnly &&
        (isCountMode ? <span>{displayCount}</span> : <span>{label}</span>)}

      {icon && iconPosition === 'right' && !isCountMode && !isDotOnly && (
        <span
          className="flex items-center"
          style={{ fontSize: iconSizeMap[size] }}
          aria-hidden
        >
          {icon}
        </span>
      )}

      {removable && (
        <button
          type="button"
          aria-label={`Remove ${label || 'badge'}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="inline-flex items-center justify-center ml-0.5 bg-transparent border-none cursor-pointer opacity-60 rounded-full hover:opacity-100 hover:bg-black/10 transition-[opacity,background] duration-150"
        >
          <X size={closeSizeMap[size]} />
        </button>
      )}
    </span>
  );
}
