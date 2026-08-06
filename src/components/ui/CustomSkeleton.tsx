export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'button' | 'badge';
export type SkeletonAnimation =
  | 'shimmer'
  | 'pulse'
  | 'wave'
  | 'spinner'
  | 'none';
export type SkeletonSize = 'sm' | 'md' | 'lg' | 'full';
export type SkeletonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

interface CustomSkeletonProps {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  size?: SkeletonSize;
  width?: string | number;
  height?: string | number;
  rounded?: SkeletonRounded;
  count?: number;
  gap?: string;
  lastLineWidth?: string;
  inline?: boolean;
  ariaLabel?: string;
  className?: string;
}

const shapeBaseClass: Record<SkeletonVariant, string> = {
  text: 'w-full h-[0.9em] rounded',
  circle: 'rounded-full aspect-square',
  rect: 'w-full',
  button: 'h-[42px] min-w-[96px]',
  badge: 'h-[22px] min-w-[56px]',
};

const roundedClass: Record<SkeletonRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

const circleSizeClass: Record<SkeletonSize, string> = {
  sm: 'w-7',
  md: 'w-11',
  lg: 'w-16',
  full: 'w-full',
};

const rectSizeClass: Record<SkeletonSize, string> = {
  sm: 'h-20',
  md: 'h-40',
  lg: 'h-[260px]',
  full: 'h-full',
};

const buttonSizeClass: Record<SkeletonSize, string> = {
  sm: 'h-[34px] min-w-[72px]',
  md: 'h-[42px] min-w-[96px]',
  lg: 'h-[52px] min-w-[128px]',
  full: 'w-full',
};

const textSizeClass: Record<SkeletonSize, string> = {
  sm: 'h-[0.7em]',
  md: 'h-[0.9em]',
  lg: 'h-[1.2em]',
  full: 'h-[0.9em]',
};

const spinnerSizeClass: Record<SkeletonSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-[3px]',
  lg: 'w-9 h-9 border-4',
  full: 'w-12 h-12 border-4',
};

function animationClass(animation: SkeletonAnimation): string {
  switch (animation) {
    case 'shimmer':
      return 'bg-[linear-gradient(100deg,var(--color-line)_30%,rgba(255,255,255,0.08)_50%,var(--color-line)_70%)] bg-[length:200%_100%] animate-[skeleton-shimmer_1.6s_ease-in-out_infinite]';
    case 'wave':
      return 'bg-[linear-gradient(115deg,var(--color-line)_25%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.08)_60%,var(--color-line)_75%)] bg-[length:250%_100%] animate-[skeleton-wave_1.8s_linear_infinite]';
    case 'pulse':
      return 'bg-[var(--color-line)] animate-[skeleton-pulse_1.4s_ease-in-out_infinite]';
    case 'none':
      return 'bg-[var(--color-line)]';
    default:
      return 'bg-[var(--color-line)]';
  }
}

function toCssLength(value: string | number | undefined): string {
  if (value === undefined || value === '') return '';
  return typeof value === 'number' ? `${value}px` : value;
}

export function CustomSkeleton({
  variant = 'text',
  animation = 'shimmer',
  size = 'md',
  width,
  height,
  rounded = 'md',
  count = 1,
  gap = '0.6rem',
  lastLineWidth = '70%',
  inline = false,
  ariaLabel = 'Loading content',
  className = '',
}: CustomSkeletonProps) {
  const isSpinner = animation === 'spinner';
  const items = Array.from({ length: Math.max(1, count) }, (_, i) => i);

  const groupClasses = [
    'flex',
    inline ? 'flex-row items-center flex-wrap' : 'flex-col items-start',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isSpinner) {
    return (
      <div
        className={groupClasses}
        style={{ gap }}
        role="status"
        aria-busy="true"
        aria-label={ariaLabel}
      >
        <span
          className={`inline-block rounded-full border-[var(--color-line)] border-t-[var(--color-evidence)] animate-spin shrink-0 ${spinnerSizeClass[size]}`}
        />
      </div>
    );
  }

  return (
    <div
      className={groupClasses}
      style={{ gap }}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {items.map((i) => {
        const isLastTextLine =
          variant === 'text' && count > 1 && i === count - 1;
        const resolvedWidth =
          toCssLength(width) || (isLastTextLine ? lastLineWidth : undefined);
        const resolvedHeight = toCssLength(height);

        const sizeClass =
          variant === 'circle'
            ? circleSizeClass[size]
            : variant === 'rect'
              ? rectSizeClass[size]
              : variant === 'button'
                ? buttonSizeClass[size]
                : variant === 'text'
                  ? textSizeClass[size]
                  : '';

        const classes = [
          'block relative overflow-hidden flex-shrink-0',
          shapeBaseClass[variant],
          sizeClass,
          variant !== 'circle' ? roundedClass[rounded] : '',
          animationClass(animation),
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <span
            key={i}
            className={classes}
            style={{
              width: resolvedWidth || undefined,
              height: resolvedHeight || undefined,
            }}
          />
        );
      })}
    </div>
  );
}
