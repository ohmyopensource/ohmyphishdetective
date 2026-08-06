import { useEffect, useState } from 'react';
import { Search, X, Filter as FilterIcon, RotateCcw } from 'lucide-react';
import { CustomInput } from './CustomInput';

export interface FilterSelectOption {
  label: string;
  value: string | number;
}

export interface FilterSelectConfig {
  key: string;
  label: string;
  placeholder?: string;
  options: FilterSelectOption[];
}

export interface FilterChipConfig {
  key: string;
  label: string;
  options: FilterSelectOption[];
  multiple?: boolean;
}

export interface FilterState {
  search: string;
  selects: Record<string, string | number | null>;
  chips: Record<string, (string | number)[]>;
}

export type FilterVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'info';
export type FilterSize = 'sm' | 'md' | 'lg';

interface CustomFilterProps {
  searchPlaceholder?: string;
  selects?: FilterSelectConfig[];
  chips?: FilterChipConfig[];
  showActiveCount?: boolean;
  searchLabel?: string;
  resetLabel?: string;
  variant?: FilterVariant;
  size?: FilterSize;
  initialState?: Partial<FilterState>;
  onFilterChange: (state: FilterState) => void;
  onFilterReset?: (state: FilterState) => void;
  className?: string;
}

const sizeTextClass: Record<FilterSize, string> = {
  sm: 'text-[0.8rem]',
  md: 'text-[0.875rem]',
  lg: 'text-base',
};

const searchBtnClass: Record<FilterVariant, string> = {
  primary:
    'bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] text-[var(--color-ink)] border-[#a8841f] shadow-[0_2px_8px_rgba(201,162,39,0.3)] hover:brightness-105',
  secondary:
    'bg-gradient-to-br from-[#4a5163] to-[#3a4150] text-white border-[#3a4150] hover:brightness-110',
  tertiary:
    'bg-white/10 text-[var(--color-paper)] border-[var(--color-line)] hover:bg-white/15',
  success:
    'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] text-white border-[var(--color-clean)] hover:brightness-105',
  info: 'bg-gradient-to-br from-[#4a90c9] to-[#3573a3] text-white border-[#3573a3] hover:brightness-105',
};

const activeBadgeClass: Record<FilterVariant, string> = {
  primary:
    'bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] text-[var(--color-ink)] border-[#a8841f]',
  secondary:
    'bg-gradient-to-br from-[#4a5163] to-[#3a4150] text-white border-[#3a4150]',
  tertiary: 'bg-white/10 text-[var(--color-paper)] border-[var(--color-line)]',
  success:
    'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] text-white border-[var(--color-clean)]',
  info: 'bg-gradient-to-br from-[#4a90c9] to-[#3573a3] text-white border-[#3573a3]',
};

const chipActiveClass: Record<FilterVariant, string> = {
  primary:
    'bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] text-[var(--color-ink)] border-[#a8841f]',
  secondary:
    'bg-gradient-to-br from-[#4a5163] to-[#3a4150] text-white border-[#3a4150]',
  tertiary:
    'bg-white/15 text-[var(--color-paper)] border-[var(--color-paper-dim)]',
  success:
    'bg-gradient-to-br from-[#5c9a6f] to-[var(--color-clean)] text-white border-[var(--color-clean)]',
  info: 'bg-gradient-to-br from-[#4a90c9] to-[#3573a3] text-white border-[#3573a3]',
};

export function CustomFilter({
  searchPlaceholder = 'Search...',
  selects = [],
  chips = [],
  showActiveCount = true,
  searchLabel = 'Search',
  resetLabel = 'Reset',
  variant = 'primary',
  size = 'md',
  initialState,
  onFilterChange,
  onFilterReset,
  className = '',
}: CustomFilterProps) {
  const [searchValue, setSearchValue] = useState(initialState?.search ?? '');
  const [selectValues, setSelectValues] = useState<
    Record<string, string | number | null>
  >(() => {
    const base: Record<string, string | number | null> = {};
    selects.forEach((s) => (base[s.key] = null));
    return { ...base, ...(initialState?.selects ?? {}) };
  });
  const [chipValues, setChipValues] = useState<
    Record<string, (string | number)[]>
  >(() => {
    const base: Record<string, (string | number)[]> = {};
    chips.forEach((c) => (base[c.key] = []));
    return { ...base, ...(initialState?.chips ?? {}) };
  });

  useEffect(() => {
    setSelectValues((prev) => {
      const next = { ...prev };
      selects.forEach((s) => {
        if (!(s.key in next)) next[s.key] = null;
      });
      return next;
    });
  }, [selects]);

  useEffect(() => {
    setChipValues((prev) => {
      const next = { ...prev };
      chips.forEach((c) => {
        if (!(c.key in next)) next[c.key] = [];
      });
      return next;
    });
  }, [chips]);

  const activeFilterCount =
    Object.values(selectValues).filter((v) => v !== null && v !== '').length +
    Object.values(chipValues).filter((arr) => arr.length > 0).length;

  const hasAnyFilter = searchValue.trim().length > 0 || activeFilterCount > 0;

  function buildState(): FilterState {
    return {
      search: searchValue.trim(),
      selects: { ...selectValues },
      chips: { ...chipValues },
    };
  }

  function handleSearch() {
    onFilterChange(buildState());
  }

  function toggleChip(
    groupKey: string,
    value: string | number,
    multiple: boolean,
  ) {
    setChipValues((prev) => {
      const current = prev[groupKey] ?? [];
      let next: (string | number)[];
      if (multiple) {
        next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
      } else {
        next = current.includes(value) ? [] : [value];
      }
      return { ...prev, [groupKey]: next };
    });
  }

  function handleReset() {
    setSearchValue('');
    const resetSelects: Record<string, string | number | null> = {};
    selects.forEach((s) => (resetSelects[s.key] = null));
    const resetChips: Record<string, (string | number)[]> = {};
    chips.forEach((c) => (resetChips[c.key] = []));
    setSelectValues(resetSelects);
    setChipValues(resetChips);

    const empty: FilterState = {
      search: '',
      selects: resetSelects,
      chips: resetChips,
    };
    onFilterReset?.(empty);
    onFilterChange(empty);
  }

  const btnIconSize = { sm: 13, md: 15, lg: 17 }[size];

  return (
    <div
      className={`flex flex-col gap-3 w-full font-body ${sizeTextClass[size]} ${className}`}
    >
      {/* Main row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-55">
          <CustomInput
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder={searchPlaceholder}
            size={size}
            variant={variant === 'tertiary' ? 'primary' : (variant as any)}
            iconLeft={<Search size={btnIconSize} />}
            clearable
            onEnter={handleSearch}
            fullWidth
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-lg font-display font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.97] ${searchBtnClass[variant]}`}
        >
          <Search size={btnIconSize} />
          <span>{searchLabel}</span>
        </button>

        {hasAnyFilter && (
          <button
            type="button"
            onClick={handleReset}
            aria-label={resetLabel}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--color-line)] rounded-lg font-display font-semibold text-[var(--color-paper-dim)] hover:bg-white/5 hover:text-[var(--color-paper)] transition-colors duration-150"
          >
            <RotateCcw size={btnIconSize} />
            <span className="hidden sm:inline">{resetLabel}</span>
          </button>
        )}

        {showActiveCount && activeFilterCount > 0 && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.7em] font-bold border whitespace-nowrap ${activeBadgeClass[variant]}`}
            aria-label={`${activeFilterCount} active filters`}
          >
            <FilterIcon size={10} />
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* Select filters */}
      {selects.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selects.map((sel) => (
            <div key={sel.key} className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-[0.72rem] font-bold text-[var(--color-paper-dim)] uppercase tracking-wide">
                {sel.label}
              </span>
              <CustomInput
                type="select"
                value={selectValues[sel.key] ?? ''}
                onValueChange={(v) =>
                  setSelectValues((prev) => ({ ...prev, [sel.key]: v || null }))
                }
                options={sel.options}
                selectPlaceholder={sel.placeholder ?? 'All'}
                size={size}
                variant={variant === 'tertiary' ? 'primary' : (variant as any)}
                fullWidth
              />
            </div>
          ))}
        </div>
      )}

      {/* Chip filters */}
      {chips.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {chips.map((group) => (
            <div key={group.key} className="flex flex-col gap-1.5">
              <span className="text-[0.72rem] font-bold text-[var(--color-paper-dim)] uppercase tracking-wide">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((opt) => {
                  const isActive = (chipValues[group.key] ?? []).includes(
                    opt.value,
                  );
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={opt.label}
                      onClick={() =>
                        toggleChip(
                          group.key,
                          opt.value,
                          group.multiple ?? false,
                        )
                      }
                      className={[
                        'inline-flex items-center px-3.5 py-1.5 rounded-full border font-semibold text-[0.82em] whitespace-nowrap transition-all duration-150 active:scale-[0.96]',
                        isActive
                          ? chipActiveClass[variant]
                          : 'bg-transparent border-[var(--color-line)] text-[var(--color-paper-dim)] hover:bg-white/5 hover:border-[#4a5163] hover:text-[var(--color-paper)]',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
