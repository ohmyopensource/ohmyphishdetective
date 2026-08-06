import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export type PaginationSize = 'xs' | 'sm' | 'md' | 'lg';
export type PaginationEmphasis = 'filled' | 'soft' | 'minimal';
export type PaginationVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

type PageItem =
  | { type: 'page'; value: number }
  | { type: 'ellipsis'; id: string };

interface CustomPaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
  showPageSizeSelector?: boolean;
  showInfo?: boolean;
  showFirstLast?: boolean;
  showJumpToPage?: boolean;
  disabled?: boolean;
  variant?: PaginationVariant;
  size?: PaginationSize;
  emphasis?: PaginationEmphasis;
  showFirstLastOnMobile?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

const sizeClass: Record<PaginationSize, string> = {
  xs: 'text-[0.7rem] gap-1',
  sm: 'text-[0.8rem] gap-1.5',
  md: 'text-[0.875rem] gap-2',
  lg: 'text-base gap-2.5',
};

const pageBtnSizeClass: Record<PaginationSize, string> = {
  xs: 'min-w-[1.8em] px-1.5 py-1',
  sm: 'min-w-[2em] px-2 py-1.5',
  md: 'min-w-[2.2em] px-2.5 py-1.5',
  lg: 'min-w-[2.5em] px-3 py-2',
};

const activeFilled: Record<PaginationVariant, string> = {
  primary:
    'bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] border-[#a8841f] text-[var(--color-ink)] shadow-[0_2px_8px_rgba(201,162,39,0.3)]',
  secondary:
    'bg-gradient-to-br from-[#4a5163] to-[#3a4150] border-[#3a4150] text-white',
  tertiary: 'bg-white/10 border-[var(--color-line)] text-[var(--color-paper)]',
  success:
    'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] border-[var(--color-clean)] text-white',
  warning:
    'bg-gradient-to-br from-[#dba13f] to-[var(--color-suspicious)] border-[var(--color-suspicious)] text-[var(--color-ink)]',
  error:
    'bg-gradient-to-br from-[#c85a3d] to-[var(--color-malicious)] border-[var(--color-malicious)] text-white',
  info: 'bg-gradient-to-br from-[#4a90c9] to-[#3573a3] border-[#3573a3] text-white',
};

const activeSoft: Record<PaginationVariant, string> = {
  primary:
    'bg-[var(--color-evidence)]/20 border-[var(--color-evidence)] text-[var(--color-evidence)]',
  secondary: 'bg-white/10 border-[#8b93a3] text-[#8b93a3]',
  tertiary:
    'bg-white/10 border-[var(--color-paper-dim)] text-[var(--color-paper-dim)]',
  success:
    'bg-[var(--color-clean)]/20 border-[var(--color-clean)] text-[var(--color-clean)]',
  warning:
    'bg-[var(--color-suspicious)]/20 border-[var(--color-suspicious)] text-[var(--color-suspicious)]',
  error:
    'bg-[var(--color-malicious)]/20 border-[var(--color-malicious)] text-[var(--color-malicious)]',
  info: 'bg-[#4a90c9]/20 border-[#4a90c9] text-[#4a90c9]',
};

const activeMinimal: Record<PaginationVariant, string> = {
  primary:
    'bg-transparent border-transparent text-[var(--color-evidence)] font-extrabold',
  secondary: 'bg-transparent border-transparent text-[#8b93a3] font-extrabold',
  tertiary:
    'bg-transparent border-transparent text-[var(--color-paper-dim)] font-extrabold',
  success:
    'bg-transparent border-transparent text-[var(--color-clean)] font-extrabold',
  warning:
    'bg-transparent border-transparent text-[var(--color-suspicious)] font-extrabold',
  error:
    'bg-transparent border-transparent text-[var(--color-malicious)] font-extrabold',
  info: 'bg-transparent border-transparent text-[#4a90c9] font-extrabold',
};

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function buildPageItems(
  total: number,
  current: number,
  max: number,
): PageItem[] {
  if (total <= max) {
    return range(1, total).map((v) => ({ type: 'page', value: v }));
  }
  const inner = max - 2;
  const half = Math.floor(inner / 2);
  let start = Math.max(2, current - half);
  let end = start + inner - 1;
  if (end >= total) {
    end = total - 1;
    start = Math.max(2, end - inner + 1);
  }
  const items: PageItem[] = [{ type: 'page', value: 1 }];
  if (start > 2) items.push({ type: 'ellipsis', id: 'left' });
  for (const v of range(start, end)) items.push({ type: 'page', value: v });
  if (end < total - 1) items.push({ type: 'ellipsis', id: 'right' });
  items.push({ type: 'page', value: total });
  return items;
}

export function CustomPagination({
  totalItems,
  pageSize,
  currentPage,
  pageSizeOptions = [10, 25, 50, 100],
  maxVisiblePages = 5,
  showPageSizeSelector = true,
  showInfo = true,
  showFirstLast = true,
  showJumpToPage = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  emphasis = 'filled',
  showFirstLastOnMobile = false,
  onPageChange,
  onPageSizeChange,
  className = '',
}: CustomPaginationProps) {
  const [jumpValue, setJumpValue] = useState<string>('');

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);
  const pageItems = buildPageItems(totalPages, currentPage, maxVisiblePages);
  const iconSize = { xs: 12, sm: 14, md: 16, lg: 18 }[size];

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, currentPage]);

  function goTo(page: number) {
    if (disabled) return;
    const clamped = Math.max(1, Math.min(page, totalPages));
    if (clamped === currentPage) return;
    onPageChange(clamped);
  }

  function handleJump() {
    const num = Number(jumpValue);
    if (!jumpValue || Number.isNaN(num)) return;
    goTo(num);
    setJumpValue('');
  }

  const activeClass =
    emphasis === 'filled'
      ? activeFilled[variant]
      : emphasis === 'soft'
        ? activeSoft[variant]
        : activeMinimal[variant];

  return (
    <nav
      aria-label="Page navigation"
      aria-disabled={disabled || undefined}
      className={[
        'flex items-center flex-wrap font-body font-medium select-none',
        sizeClass[size],
        disabled ? 'opacity-50 pointer-events-none' : '',
        className,
      ].join(' ')}
    >
      {showPageSizeSelector && onPageSizeChange && (
        <label className="flex items-center gap-1.5 text-[var(--color-paper-dim)] mr-2">
          <span className="hidden sm:inline">Rows</span>
          <select
            disabled={disabled}
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="appearance-none bg-white/5 border border-[var(--color-line)] rounded text-[var(--color-paper)] font-semibold cursor-pointer outline-none py-1 pl-2 pr-6 focus:border-[var(--color-evidence)]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239aa0ad' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.4em center',
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      )}

      <div
        role="group"
        aria-label="Page controls"
        className="flex items-center gap-0.5"
      >
        {showFirstLast && (
          <button
            type="button"
            disabled={isFirst || disabled}
            aria-label="First page"
            onClick={() => goTo(1)}
            className={`inline-flex items-center justify-center p-1.5 rounded text-[var(--color-paper-dim)] border border-transparent transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-white/5 hover:not-disabled:text-[var(--color-paper)] ${
              showFirstLastOnMobile ? '' : 'hidden sm:inline-flex'
            }`}
          >
            <ChevronsLeft size={iconSize} />
          </button>
        )}

        <button
          type="button"
          disabled={isFirst || disabled}
          aria-label="Previous page"
          onClick={() => goTo(currentPage - 1)}
          className="inline-flex items-center justify-center p-1.5 rounded text-[var(--color-paper-dim)] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-white/5 hover:not-disabled:text-[var(--color-paper)]"
        >
          <ChevronLeft size={iconSize} />
        </button>

        <div role="list" className="hidden sm:flex items-center gap-0.5">
          {pageItems.map((item) =>
            item.type === 'page' ? (
              <button
                key={`page-${item.value}`}
                type="button"
                role="listitem"
                disabled={disabled}
                aria-label={`Page ${item.value}`}
                aria-current={item.value === currentPage ? 'page' : undefined}
                onClick={() => goTo(item.value)}
                className={[
                  'inline-flex items-center justify-center rounded border font-semibold transition-all duration-150',
                  pageBtnSizeClass[size],
                  item.value === currentPage
                    ? `${activeClass} cursor-default pointer-events-none`
                    : 'border-transparent text-[var(--color-paper-dim)] hover:bg-white/5 hover:border-[var(--color-line)] hover:text-[var(--color-paper)]',
                ].join(' ')}
              >
                {item.value}
              </button>
            ) : (
              <span
                key={`ellipsis-${item.id}`}
                role="listitem"
                aria-hidden
                className="inline-flex items-center justify-center min-w-[2.2em] text-[var(--color-paper-dim)]/60 font-bold tracking-wide"
              >
                &hellip;
              </span>
            ),
          )}
        </div>

        <span
          aria-live="polite"
          className="sm:hidden inline-flex items-center justify-center min-w-[4em] font-bold text-[var(--color-paper-dim)]"
        >
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={isLast || disabled}
          aria-label="Next page"
          onClick={() => goTo(currentPage + 1)}
          className="inline-flex items-center justify-center p-1.5 rounded text-[var(--color-paper-dim)] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-white/5 hover:not-disabled:text-[var(--color-paper)]"
        >
          <ChevronRight size={iconSize} />
        </button>

        {showFirstLast && (
          <button
            type="button"
            disabled={isLast || disabled}
            aria-label="Last page"
            onClick={() => goTo(totalPages)}
            className={`inline-flex items-center justify-center p-1.5 rounded text-[var(--color-paper-dim)] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-white/5 hover:not-disabled:text-[var(--color-paper)] ${
              showFirstLastOnMobile ? '' : 'hidden sm:inline-flex'
            }`}
          >
            <ChevronsRight size={iconSize} />
          </button>
        )}
      </div>

      {showJumpToPage && (
        <label className="hidden sm:flex items-center gap-1.5 text-[var(--color-paper-dim)] ml-2">
          <span>Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            disabled={disabled}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onBlur={handleJump}
            onKeyDown={(e) => e.key === 'Enter' && handleJump()}
            aria-label="Jump to page"
            className="w-16 px-2 py-1 bg-white/5 border border-[var(--color-line)] rounded text-[var(--color-paper)] font-semibold text-center outline-none focus:border-[var(--color-evidence)]"
          />
        </label>
      )}

      {showInfo && totalItems > 0 && (
        <span className="w-full text-center mt-1 text-[var(--color-paper-dim)]">
          <span className="font-bold text-[var(--color-paper)]">
            {rangeStart}–{rangeEnd}
          </span>{' '}
          of{' '}
          <span className="font-bold text-[var(--color-paper)]">
            {totalItems}
          </span>
        </span>
      )}
      {showInfo && totalItems === 0 && (
        <span className="w-full text-center mt-1 italic text-[var(--color-paper-dim)]">
          No results
        </span>
      )}
    </nav>
  );
}
