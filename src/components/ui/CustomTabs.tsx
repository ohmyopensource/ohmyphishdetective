import type { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export type TabVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type TabSize = 'sm' | 'md' | 'lg';
export type TabStyleKind = 'line' | 'pill' | 'card' | 'underline';

interface CustomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  tabStyle?: TabStyleKind;
  variant?: TabVariant;
  size?: TabSize;
  fullWidth?: boolean;
  vertical?: boolean;
  onTabChange: (id: string) => void;
  className?: string;
}

const sizeClass: Record<TabSize, string> = {
  sm: 'px-3.5 py-2 text-[0.78rem]',
  md: 'px-4.5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const activeTextClass: Record<TabVariant, string> = {
  primary: 'text-[var(--color-evidence)]',
  secondary: 'text-[#8b93a3]',
  tertiary: 'text-[var(--color-paper-dim)]',
  success: 'text-[var(--color-clean)]',
  warning: 'text-[var(--color-suspicious)]',
  error: 'text-[var(--color-malicious)]',
  info: 'text-[#4a90c9]',
};

const indicatorBgClass: Record<TabVariant, string> = {
  primary: 'bg-[var(--color-evidence)]',
  secondary: 'bg-[#8b93a3]',
  tertiary: 'bg-[var(--color-paper-dim)]',
  success: 'bg-[var(--color-clean)]',
  warning: 'bg-[var(--color-suspicious)]',
  error: 'bg-[var(--color-malicious)]',
  info: 'bg-[#4a90c9]',
};

const pillActiveClass: Record<TabVariant, string> = {
  primary:
    'bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] text-[var(--color-ink)] shadow-[0_2px_8px_rgba(201,162,39,0.35)]',
  secondary:
    'bg-gradient-to-br from-[#4a5163] to-[#3a4150] text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
  tertiary: 'bg-white/10 text-[var(--color-paper)] shadow-none',
  success:
    'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] text-white shadow-[0_2px_8px_rgba(74,124,89,0.35)]',
  warning:
    'bg-gradient-to-br from-[#dba13f] to-[var(--color-suspicious)] text-[var(--color-ink)] shadow-[0_2px_8px_rgba(201,138,44,0.35)]',
  error:
    'bg-gradient-to-br from-[#c85a3d] to-[var(--color-malicious)] text-white shadow-[0_2px_8px_rgba(179,69,44,0.35)]',
  info: 'bg-gradient-to-br from-[#4a90c9] to-[#3573a3] text-white shadow-[0_2px_8px_rgba(53,115,163,0.35)]',
};

export function CustomTabs({
  tabs,
  activeTab,
  tabStyle = 'line',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  vertical = false,
  onTabChange,
  className = '',
}: CustomTabsProps) {
  const iconSize = { sm: 14, md: 16, lg: 18 }[size];

  const wrapperBase = [
    'flex relative font-body',
    vertical ? 'flex-col items-stretch' : 'items-stretch overflow-x-auto',
    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    tabStyle === 'line' && !vertical && 'border-b-2 border-[var(--color-line)]',
    tabStyle === 'line' &&
      vertical &&
      'border-l-2 border-[var(--color-line)] gap-0',
    tabStyle === 'underline' && 'border-b border-[var(--color-line)] gap-0',
    tabStyle === 'card' &&
      'gap-1 items-end border-b border-[var(--color-line)]',
    tabStyle === 'pill' &&
      'bg-white/5 rounded-2xl p-1 gap-0.5 border border-[var(--color-line)]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperBase} role="tablist" aria-label="Tabs">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        function handleClick() {
          if (tab.disabled || isActive) return;
          onTabChange(tab.id);
        }

        const base = [
          'inline-flex items-center justify-center gap-1.5 relative bg-transparent border-none font-medium whitespace-nowrap outline-none flex-shrink-0',
          'transition-colors duration-150',
          sizeClass[size],
          (fullWidth || vertical) && 'flex-1',
          tab.disabled
            ? 'opacity-40 cursor-not-allowed pointer-events-none'
            : 'cursor-pointer',
          'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-evidence)] rounded',
        ];

        let styleClasses = '';
        if (tabStyle === 'line') {
          styleClasses = [
            vertical ? 'justify-start text-left -ml-0.5' : '-mb-0.5',
            isActive
              ? `${activeTextClass[variant]} font-semibold`
              : 'text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]',
          ].join(' ');
        } else if (tabStyle === 'underline') {
          styleClasses = [
            '-mb-px',
            isActive
              ? `${activeTextClass[variant]} font-bold`
              : 'text-[var(--color-paper-dim)]/70 hover:text-[var(--color-paper-dim)]',
          ].join(' ');
        } else if (tabStyle === 'card') {
          styleClasses = [
            '-mb-px rounded-t-lg border border-b-0',
            isActive
              ? `bg-[var(--color-ink-soft)] border-[var(--color-line)] ${activeTextClass[variant]} font-semibold`
              : 'bg-[var(--color-ink)] border-[var(--color-line)] text-[var(--color-paper-dim)] hover:bg-white/5',
          ].join(' ');
        } else if (tabStyle === 'pill') {
          styleClasses = [
            vertical ? 'justify-start text-left rounded-lg' : 'rounded-xl',
            isActive
              ? `${pillActiveClass[variant]} font-semibold`
              : 'text-[var(--color-paper-dim)] hover:bg-white/10 hover:text-[var(--color-paper)]',
          ].join(' ');
        }

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled || undefined}
            tabIndex={tab.disabled ? -1 : 0}
            aria-label={tab.label}
            className={[...base, styleClasses].join(' ')}
            onClick={handleClick}
          >
            {tab.icon && (
              <span
                className="flex items-center shrink-0"
                aria-hidden
                style={{ width: iconSize, height: iconSize }}
              >
                {tab.icon}
              </span>
            )}
            <span className="leading-none">{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={[
                  'inline-flex items-center justify-center min-w-[1.4em] h-[1.4em] px-1.5 rounded-full text-[0.7em] font-bold transition-colors duration-150',
                  isActive
                    ? tabStyle === 'pill'
                      ? 'bg-white/25 text-inherit'
                      : `${indicatorBgClass[variant]} text-white`
                    : 'bg-white/10 text-[var(--color-paper-dim)]',
                ].join(' ')}
              >
                {tab.badge}
              </span>
            )}
            {(tabStyle === 'line' || tabStyle === 'underline') && (
              <span
                aria-hidden
                className={[
                  'absolute transition-colors duration-150 rounded-sm',
                  vertical
                    ? 'top-0 -left-0.5 right-auto w-0.5 h-full'
                    : '-bottom-0.5 left-0 right-0 h-0.5',
                  isActive ? indicatorBgClass[variant] : 'bg-transparent',
                ].join(' ')}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
