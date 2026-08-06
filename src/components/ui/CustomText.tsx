import type { ElementType, ReactNode, HTMLAttributes } from 'react';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'label'
  | 'overline'
  | 'code'
  | 'blockquote';

export type TextColor =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'white'
  | 'inherit';

export type TextWeight =
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  align?: TextAlign;
  italic?: boolean;
  underline?: boolean;
  truncate?: boolean;
  noWrap?: boolean;
  gradient?: boolean;
  lineClamp?: number;
  children?: ReactNode;
}

const variantClass: Record<TextVariant, string> = {
  display:
    'font-display text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight',
  h1: 'font-display text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight',
  h2: 'font-display text-3xl md:text-4xl font-bold leading-[1.2] tracking-tight',
  h3: 'font-display text-2xl md:text-3xl font-bold leading-[1.25]',
  h4: 'font-display text-xl md:text-2xl font-bold leading-[1.3]',
  h5: 'font-display text-lg font-semibold leading-[1.35]',
  h6: 'font-display text-base font-semibold leading-[1.4]',
  'body-lg': 'font-body text-lg leading-[1.7]',
  body: 'font-body text-sm md:text-base leading-[1.6]',
  'body-sm': 'font-body text-sm leading-[1.55]',
  caption: 'font-body text-xs leading-[1.5] tracking-wide',
  label:
    'font-body text-xs md:text-sm font-semibold leading-[1.4] tracking-wide',
  overline:
    'font-body text-[0.7rem] font-bold leading-[1.4] tracking-[0.1em] uppercase',
  code: 'font-mono text-[0.875em] leading-[1.6] bg-black/25 px-1.5 py-0.5 rounded border border-[var(--color-line)]',
  blockquote:
    'font-body text-lg italic leading-[1.7] border-l-2 border-[var(--color-evidence)] pl-4',
};

const variantDefaultTag: Partial<Record<TextVariant, ElementType>> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  code: 'code',
  blockquote: 'blockquote',
  label: 'label',
};

const colorClass: Record<TextColor, string> = {
  default: 'text-[var(--color-paper)]',
  muted: 'text-[var(--color-paper-dim)]',
  subtle: 'text-[var(--color-paper-dim)]/70',
  primary: 'text-[var(--color-evidence)]',
  secondary: 'text-[#8b93a3]',
  tertiary: 'text-[#5a6270]',
  success: 'text-[var(--color-clean)]',
  warning: 'text-[var(--color-suspicious)]',
  error: 'text-[var(--color-malicious)]',
  info: 'text-[#4a90c9]',
  white: 'text-white',
  inherit: 'text-inherit',
};

const weightClass: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const alignClass: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const gradientColorClass: Partial<Record<TextColor, string>> = {
  primary: 'from-[var(--color-evidence)] to-[#8a6f1a]',
  success: 'from-[#5c9a6f] to-[var(--color-clean)]',
  secondary: 'from-[#a9b0bd] to-[#6d7585]',
};

export function CustomText({
  as,
  variant = 'body',
  color = 'default',
  weight,
  align,
  italic = false,
  underline = false,
  truncate = false,
  noWrap = false,
  gradient = false,
  lineClamp,
  className = '',
  style,
  children,
  ...rest
}: TextProps) {
  const Tag = as ?? variantDefaultTag[variant] ?? 'p';

  const classes = [
    variantClass[variant],
    gradient
      ? `bg-gradient-to-br ${gradientColorClass[color] ?? gradientColorClass.primary} bg-clip-text text-transparent`
      : colorClass[color],
    weight && weightClass[weight],
    align && alignClass[align],
    italic && 'italic',
    underline && 'underline underline-offset-4',
    truncate && 'overflow-hidden text-ellipsis whitespace-nowrap block',
    noWrap && 'whitespace-nowrap',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const clampStyle: React.CSSProperties | undefined = lineClamp
    ? {
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }
    : undefined;

  return (
    <Tag className={classes} style={{ ...clampStyle, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
