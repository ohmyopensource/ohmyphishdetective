import { useRef, useState, forwardRef } from 'react';
import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'ghost'
  | 'outline'
  | 'outline-error'
  | 'flat';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

interface RippleState {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface SharedProps {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: ButtonRounded;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  loading?: boolean;
  succeeded?: boolean;
  succeededStyle?: 'filled' | 'ghost';
  succeededLabel?: string;
  children?: ReactNode;
}

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };

type ButtonAsAnchor = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' };

type Props = ButtonAsButton | ButtonAsAnchor;

const sizeIconPx: Record<ButtonSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
};

const roundedClass: Record<ButtonRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

const sizeClass: Record<ButtonSize, string> = {
  xs: 'px-3 py-1.5 text-xs min-h-[28px]',
  sm: 'px-4 py-2 text-sm min-h-[34px]',
  md: 'px-5 py-2.5 text-sm min-h-[42px]',
  lg: 'px-7 py-3 text-base min-h-[52px]',
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] text-[var(--color-ink)] shadow-[0_4px_14px_rgba(201,162,39,0.35)] hover:shadow-[0_8px_24px_rgba(201,162,39,0.45)] hover:brightness-105',
  secondary:
    'bg-gradient-to-br from-[#3a4150] to-[#2b313c] text-[var(--color-paper)] shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:brightness-110',
  tertiary:
    'bg-gradient-to-br from-[var(--color-ink-soft)] to-[var(--color-ink)] text-[var(--color-paper)] border border-[var(--color-line)] hover:brightness-125',
  success:
    'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] text-white shadow-[0_4px_14px_rgba(74,124,89,0.35)] hover:brightness-105',
  warning:
    'bg-gradient-to-br from-[#dba13f] to-[var(--color-suspicious)] text-[var(--color-ink)] shadow-[0_4px_14px_rgba(201,138,44,0.35)] hover:brightness-105',
  error:
    'bg-gradient-to-br from-[#c85a3d] to-[var(--color-malicious)] text-white shadow-[0_4px_14px_rgba(179,69,44,0.35)] hover:brightness-105',
  info: 'bg-gradient-to-br from-[#4a90c9] to-[#3573a3] text-white shadow-[0_4px_14px_rgba(53,115,163,0.35)] hover:brightness-105',
  ghost:
    'bg-white/5 text-[var(--color-paper)] border border-white/10 hover:bg-white/10',
  outline:
    'bg-transparent text-[var(--color-evidence)] border border-[var(--color-evidence)] hover:bg-[var(--color-evidence)]/10',
  'outline-error':
    'bg-transparent text-[var(--color-malicious)] border border-[var(--color-malicious)] hover:bg-[var(--color-malicious)]/10',
  flat: 'bg-transparent text-[var(--color-paper)] hover:bg-white/5',
};

export const CustomButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  Props
>(function CustomButton(props, ref) {
  const {
    label,
    children,
    variant = 'primary',
    size = 'md',
    rounded = 'md',
    fullWidth = false,
    icon,
    iconPosition = 'left',
    iconOnly = false,
    loading = false,
    succeeded = false,
    succeededStyle = 'filled',
    succeededLabel,
    className = '',
    ...rest
  } = props;

  const [ripples, setRipples] = useState<RippleState[]>([]);
  const rippleId = useRef(0);

  const isInert = Boolean(
    (rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled ||
    loading ||
    succeeded,
  );

  const displayLabel =
    succeeded && succeededLabel ? succeededLabel : (label ?? children);
  const iconSize = sizeIconPx[size];

  function handleRipple(e: React.MouseEvent<HTMLElement>) {
    if (isInert) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height);
    const id = rippleId.current++;
    setRipples((prev) => [
      ...prev,
      {
        id,
        size: diameter,
        x: e.clientX - rect.left - diameter / 2,
        y: e.clientY - rect.top - diameter / 2,
      },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }

  const succeededClass =
    succeeded && succeededStyle === 'filled'
      ? 'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] text-white cursor-not-allowed'
      : succeeded && succeededStyle === 'ghost'
        ? 'bg-[var(--color-clean-bg)] text-[var(--color-clean)] border border-[var(--color-clean)] cursor-not-allowed'
        : '';

  const classes = [
    'relative inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide overflow-hidden select-none',
    'transition-[filter,transform,box-shadow,opacity] duration-200 ease-out outline-none',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-evidence)]',
    !isInert && 'active:translate-y-px active:scale-[0.97]',
    sizeClass[size],
    roundedClass[rounded],
    fullWidth ? 'w-full' : '',
    iconOnly ? 'aspect-square p-0' : '',
    succeeded ? succeededClass : variantClass[variant],
    isInert && !succeeded
      ? 'opacity-60 cursor-not-allowed pointer-events-none'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && (
        <Loader2 size={iconSize} className="animate-spin" aria-hidden />
      )}
      {succeeded && !loading && <CheckCircle2 size={iconSize} aria-hidden />}
      {icon && !loading && !succeeded && iconPosition === 'left' && (
        <span className="flex items-center" aria-hidden>
          {icon}
        </span>
      )}
      {!iconOnly && <span className="truncate">{displayLabel}</span>}
      {icon && !loading && !succeeded && iconPosition === 'right' && (
        <span className="flex items-center" aria-hidden>
          {icon}
        </span>
      )}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/25 pointer-events-none animate-[btn-ripple_550ms_linear_forwards]"
          style={{ width: r.size, height: r.size, left: r.x, top: r.y }}
        />
      ))}
    </>
  );

  if (props.as === 'a') {
    const { as: _as, ...anchorRest } =
      rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
        as?: 'a';
      };
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        aria-disabled={isInert || undefined}
        onClick={(e) => {
          if (isInert) {
            e.preventDefault();
            return;
          }
          handleRipple(e);
          anchorRest.onClick?.(e);
        }}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonRest.type ?? 'button'}
      className={classes}
      disabled={isInert}
      aria-busy={loading || undefined}
      {...buttonRest}
      onClick={(e) => {
        if (isInert) return;
        handleRipple(e);
        buttonRest.onClick?.(e);
      }}
    >
      {content}
    </button>
  );
});
