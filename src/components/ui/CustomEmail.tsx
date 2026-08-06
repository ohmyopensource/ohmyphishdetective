import { Mail } from 'lucide-react';

export type EmailVariant = 'primary' | 'secondary' | 'neutral' | 'ghost';
export type EmailSize = 'sm' | 'md' | 'lg';

interface CustomEmailProps {
  email: string;
  label?: string;
  subject?: string;
  body?: string;
  variant?: EmailVariant;
  size?: EmailSize;
  showIcon?: boolean;
  underline?: boolean;
  className?: string;
}

const sizeClass: Record<EmailSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const iconSizeMap: Record<EmailSize, number> = { sm: 12, md: 14, lg: 16 };

const colorClass: Record<EmailVariant, string> = {
  primary: 'text-[var(--color-evidence)] hover:text-[#e0bc4d]',
  secondary: 'text-[#8b93a3] hover:text-[#aab1bd]',
  neutral: 'text-[var(--color-paper)] hover:text-white',
  ghost: 'text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]',
};

export function CustomEmail({
  email,
  label,
  subject,
  body,
  variant = 'primary',
  size = 'md',
  showIcon = true,
  underline = true,
  className = '',
}: CustomEmailProps) {
  const displayLabel = label || email;
  const iconSize = iconSizeMap[size];

  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  const mailtoHref = `mailto:${email}${query ? '?' + query : ''}`;

  const classes = [
    'inline-flex items-center gap-1.5 font-medium no-underline transition-colors duration-200',
    sizeClass[size],
    colorClass[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={mailtoHref}
      className={classes}
      aria-label={`Send email to ${email}`}
    >
      {showIcon && (
        <span className="inline-flex items-center shrink-0" aria-hidden>
          <Mail size={iconSize} />
        </span>
      )}
      <span className={underline ? 'hover:underline' : ''}>{displayLabel}</span>
    </a>
  );
}
