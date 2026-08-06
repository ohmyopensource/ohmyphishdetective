import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export type AccordionVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'info'
  | 'neutral'
  | 'error'
  | 'warning';
export type AccordionSize = 'sm' | 'md' | 'lg';
export type AccordionRadius = 'sm' | 'md' | 'lg';

export interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
  variant?: AccordionVariant;
}

interface CustomAccordionProps {
  items: AccordionItem[];
  defaultOpenIndex?: number;
  variant?: AccordionVariant;
  size?: AccordionSize;
  radius?: AccordionRadius;
  multiple?: boolean;
  className?: string;
}

const radiusClass: Record<AccordionRadius, string> = {
  sm: 'rounded-lg',
  md: 'rounded-2xl',
  lg: 'rounded-[20px]',
};

const sizeHeaderClass: Record<AccordionSize, string> = {
  sm: 'px-4 py-3.5 text-sm',
  md: 'px-5 py-4.5 text-[0.95rem]',
  lg: 'px-6 py-5.5 text-base',
};

const sizeContentClass: Record<AccordionSize, string> = {
  sm: 'px-4 pb-3.5 pt-3',
  md: 'px-5 pb-4.5 pt-3.5',
  lg: 'px-6 pb-5.5 pt-4.5',
};

const openBorderClass: Record<AccordionVariant, string> = {
  primary:
    'border-[var(--color-evidence)] shadow-[0_8px_24px_rgba(201,162,39,0.2)]',
  secondary: 'border-[#4a5163] shadow-[0_8px_24px_rgba(74,81,99,0.2)]',
  tertiary:
    'border-[var(--color-paper-dim)] shadow-[0_8px_24px_rgba(184,179,166,0.15)]',
  success:
    'border-[var(--color-clean)] shadow-[0_8px_24px_rgba(74,124,89,0.2)]',
  warning:
    'border-[var(--color-suspicious)] shadow-[0_8px_24px_rgba(201,138,44,0.2)]',
  error:
    'border-[var(--color-malicious)] shadow-[0_8px_24px_rgba(179,69,44,0.2)]',
  info: 'border-[#4a90c9] shadow-[0_8px_24px_rgba(74,144,201,0.2)]',
  neutral: 'border-[var(--color-line)] shadow-[0_8px_24px_rgba(0,0,0,0.15)]',
};

const openTitleClass: Record<AccordionVariant, string> = {
  primary: 'text-[var(--color-evidence)]',
  secondary: 'text-[#8b93a3]',
  tertiary: 'text-[var(--color-paper-dim)]',
  success: 'text-[var(--color-clean)]',
  warning: 'text-[var(--color-suspicious)]',
  error: 'text-[var(--color-malicious)]',
  info: 'text-[#4a90c9]',
  neutral: 'text-[var(--color-paper)]',
};

const openChevronClass: Record<AccordionVariant, string> = {
  primary: 'bg-[var(--color-evidence)] text-[var(--color-ink)]',
  secondary: 'bg-[#4a5163] text-white',
  tertiary: 'bg-[var(--color-paper-dim)] text-[var(--color-ink)]',
  success: 'bg-[var(--color-clean)] text-white',
  warning: 'bg-[var(--color-suspicious)] text-[var(--color-ink)]',
  error: 'bg-[var(--color-malicious)] text-white',
  info: 'bg-[#4a90c9] text-white',
  neutral: 'bg-[var(--color-paper-dim)] text-[var(--color-ink)]',
};

export function CustomAccordion({
  items,
  defaultOpenIndex = -1,
  variant = 'primary',
  size = 'md',
  radius = 'md',
  multiple = false,
  className = '',
}: CustomAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(
    defaultOpenIndex >= 0 ? new Set([defaultOpenIndex]) : new Set(),
  );

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (multiple) {
        next.has(index) ? next.delete(index) : next.add(index);
      } else {
        const wasOpen = next.has(index);
        next.clear();
        if (!wasOpen) next.add(index);
      }
      return next;
    });
  }

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {items.map((item, i) => {
        const isOpen = openIndexes.has(i);
        const itemVariant = item.variant ?? variant;

        return (
          <div
            key={i}
            className={[
              'overflow-hidden bg-ink-soft border transition-[border-color,box-shadow] duration-200',
              radiusClass[radius],
              isOpen
                ? openBorderClass[itemVariant]
                : 'border-line shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
            ].join(' ')}
          >
            <button
              type="button"
              className={[
                'flex w-full items-center justify-between gap-4 text-left font-display font-bold bg-transparent border-none cursor-pointer transition-colors duration-200',
                sizeHeaderClass[size],
                isOpen
                  ? openTitleClass[itemVariant]
                  : 'text-[var(--color-paper)]',
                'hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-evidence)]',
              ].join(' ')}
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
            >
              <span className="flex-1 min-w-0 leading-snug">{item.title}</span>
              <span
                className={[
                  'inline-flex items-center justify-center shrink-0 w-7 h-7 rounded-full transition-transform duration-200',
                  isOpen
                    ? `rotate-180 ${openChevronClass[itemVariant]}`
                    : 'bg-white/10 text-[var(--color-paper-dim)]',
                ].join(' ')}
              >
                <ChevronDown size={16} />
              </span>
            </button>

            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
              style={{ maxHeight: isOpen ? '2000px' : '0px' }}
            >
              <div
                className={`${sizeContentClass[size]} border-t border-white/5`}
              >
                {typeof item.content === 'string' ? (
                  <p className="m-0 text-sm leading-relaxed text-[var(--color-paper-dim)]">
                    {item.content}
                  </p>
                ) : (
                  item.content
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
