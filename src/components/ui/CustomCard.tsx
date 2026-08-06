import type {
  ReactNode,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';

export type CardVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardShadow = 'none' | 'sm' | 'md' | 'lg';
export type CardRadius = 'sm' | 'md' | 'lg';
export type CardMode = 'default' | 'link-internal' | 'link-external';

interface CustomCardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  shadow?: CardShadow;
  radius?: CardRadius;
  stretchHeight?: boolean;
  bordered?: boolean;
  accentBar?: boolean;
  mode?: CardMode;
  clickable?: boolean;
  hoverable?: boolean;
  href?: string;
  target?: '_self' | '_blank';
  ariaLabel?: string;
  onCardClick?: (e: ReactMouseEvent) => void;
  className?: string;
  children?: ReactNode;
}

const paddingClass: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

const radiusClass: Record<CardRadius, string> = {
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
};

const shadowClass: Record<CardShadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-[0_1px_4px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.15)]',
  md: 'shadow-[0_4px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.15)]',
  lg: 'shadow-[0_8px_32px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]',
};

const hoverShadow: Record<CardShadow, string> = {
  none: '',
  sm: 'hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]',
  md: 'hover:shadow-[0_12px_36px_rgba(0,0,0,0.35)]',
  lg: 'hover:shadow-[0_16px_44px_rgba(0,0,0,0.4)]',
};

const variantStyle: Record<
  CardVariant,
  { bg: string; border: string; accent: string }
> = {
  default: {
    bg: 'bg-[var(--color-ink-soft)]',
    border: 'border-[var(--color-line)]',
    accent: 'bg-[var(--color-evidence)]',
  },
  primary: {
    bg: 'bg-gradient-to-br from-[color-mix(in_srgb,var(--color-evidence)_12%,var(--color-ink-soft))] to-[var(--color-ink-soft)]',
    border: 'border-[var(--color-evidence)]/40',
    accent: 'bg-[var(--color-evidence)]',
  },
  secondary: {
    bg: 'bg-gradient-to-br from-[#333a48] to-[var(--color-ink-soft)]',
    border: 'border-[#4a5163]/50',
    accent: 'bg-[#4a5163]',
  },
  tertiary: {
    bg: 'bg-[var(--color-ink)]',
    border: 'border-[var(--color-line)]',
    accent: 'bg-[var(--color-paper-dim)]',
  },
  success: {
    bg: 'bg-gradient-to-br from-[var(--color-clean-bg)] to-[var(--color-ink-soft)]',
    border: 'border-[var(--color-clean)]/40',
    accent: 'bg-[var(--color-clean)]',
  },
  warning: {
    bg: 'bg-gradient-to-br from-[var(--color-suspicious-bg)] to-[var(--color-ink-soft)]',
    border: 'border-[var(--color-suspicious)]/40',
    accent: 'bg-[var(--color-suspicious)]',
  },
  error: {
    bg: 'bg-gradient-to-br from-[var(--color-malicious-bg)] to-[var(--color-ink-soft)]',
    border: 'border-[var(--color-malicious)]/40',
    accent: 'bg-[var(--color-malicious)]',
  },
  info: {
    bg: 'bg-gradient-to-br from-[#1a2b38] to-[var(--color-ink-soft)]',
    border: 'border-[#4a90c9]/40',
    accent: 'bg-[#4a90c9]',
  },
  neutral: {
    bg: 'bg-[var(--color-ink)]',
    border: 'border-[var(--color-line)]',
    accent: 'bg-[var(--color-paper-dim)]',
  },
};

export function CustomCard({
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  radius = 'md',
  stretchHeight = false,
  bordered = true,
  accentBar = false,
  mode = 'default',
  clickable = false,
  hoverable = false,
  href = '',
  target = '_self',
  ariaLabel,
  onCardClick,
  className = '',
  children,
}: CustomCardProps) {
  const isInteractive = clickable || mode !== 'default';
  const style = variantStyle[variant];

  const classes = [
    'relative flex flex-col box-border font-body',
    'transition-[box-shadow,transform,border-color] duration-200',
    style.bg,
    bordered ? `border ${style.border}` : 'border border-transparent',
    paddingClass[padding],
    radiusClass[radius],
    shadowClass[shadow],
    stretchHeight ? 'h-full' : '',
    accentBar
      ? "pl-[calc(1.25rem+4px)] before:content-[''] before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1 before:rounded-l-[inherit]"
      : '',
    hoverable || isInteractive
      ? `hover:-translate-y-[3px] ${hoverShadow[shadow]}`
      : '',
    isInteractive
      ? 'cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-evidence)]'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const accentStyle = accentBar
    ? ({ ['--tw-accent' as string]: undefined } as React.CSSProperties)
    : undefined;

  function handleClick(e: ReactMouseEvent) {
    if (!clickable) return;
    onCardClick?.(e);
  }

  function handleKeyDown(e: ReactKeyboardEvent) {
    if (!clickable) return;
    if (e.key === 'Enter') {
      onCardClick?.(e as unknown as ReactMouseEvent);
    }
  }

  const content = (
    <>
      {accentBar && (
        <span
          className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-[inherit] ${style.accent}`}
          aria-hidden
        />
      )}
      {children}
    </>
  );

  if (mode === 'link-internal' || mode === 'link-external') {
    return (
      <a
        href={href}
        target={mode === 'link-external' ? target : undefined}
        rel={
          mode === 'link-external' && target === '_blank'
            ? 'noopener noreferrer'
            : undefined
        }
        className={classes}
        style={accentStyle}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={classes}
      style={accentStyle}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {content}
    </div>
  );
}
