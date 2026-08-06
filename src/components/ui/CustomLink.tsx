import type { ReactNode } from 'react';
import { Link as LinkIcon } from 'lucide-react';

export type LinkMode = 'internal' | 'external';
export type LinkVariant = 'primary' | 'secondary' | 'neutral' | 'ghost';
export type LinkSize = 'sm' | 'md' | 'lg';

interface CustomLinkProps {
  href: string;
  label?: string;
  children?: ReactNode;
  mode?: LinkMode;
  target?: '_self' | '_blank';
  variant?: LinkVariant;
  size?: LinkSize;
  showExternalIcon?: boolean;
  onInternalNavigate?: (href: string) => void;
  className?: string;
}

const sizeClass: Record<LinkSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const iconSizeMap: Record<LinkSize, number> = { sm: 11, md: 13, lg: 15 };

const colorClass: Record<LinkVariant, string> = {
  primary: 'text-[var(--color-evidence)] hover:text-[#e0bc4d]',
  secondary: 'text-[#8b93a3] hover:text-[#aab1bd]',
  neutral: 'text-[var(--color-paper)] hover:text-white',
  ghost: 'text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]',
};

export function CustomLink({
  href,
  label,
  children,
  mode = 'internal',
  target = '_blank',
  variant = 'primary',
  size = 'md',
  showExternalIcon = true,
  onInternalNavigate,
  className = '',
}: CustomLinkProps) {
  const displayIcon = mode === 'external' && showExternalIcon;
  const iconSize = iconSizeMap[size];
  const content = children ?? label;

  const classes = [
    'inline-flex items-center gap-1.5 font-medium no-underline transition-colors duration-200',
    sizeClass[size],
    colorClass[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textClasses =
    'underline decoration-transparent hover:decoration-current transition-[text-decoration-color] duration-200';

  if (mode === 'internal') {
    return (
      <a
        href={href}
        className={classes}
        onClick={(e) => {
          if (onInternalNavigate) {
            e.preventDefault();
            onInternalNavigate(href);
          }
        }}
      >
        {displayIcon && (
          <span className="inline-flex items-center shrink-0" aria-hidden>
            <LinkIcon size={iconSize} />
          </span>
        )}
        <span className={textClasses}>{content}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className={classes}
    >
      {displayIcon && (
        <span className="inline-flex items-center shrink-0" aria-hidden>
          <LinkIcon size={iconSize} />
        </span>
      )}
      <span className={textClasses}>{content}</span>
    </a>
  );
}
