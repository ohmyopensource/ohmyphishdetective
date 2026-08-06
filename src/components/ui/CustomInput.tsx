import { useId, useState, forwardRef } from 'react';
import type { ReactNode, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { Eye, EyeOff, X, CircleAlert, CircleCheck } from 'lucide-react';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'number'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type InputStatus = 'default' | 'success' | 'error';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface CustomInputProps {
  type?: InputType;
  label?: string;
  placeholder?: string;
  hint?: string;
  errorMessage?: string;
  successMessage?: string;
  options?: SelectOption[];
  selectPlaceholder?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  prefix?: string;
  suffix?: string;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  rows?: number;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  value: string | number;
  onValueChange: (value: string) => void;
  onFocus?: (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onBlur?: (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
}

const fieldSizeClass: Record<InputSize, string> = {
  sm: 'min-h-[34px]',
  md: 'min-h-[42px]',
  lg: 'min-h-[52px]',
};

const inputSizeClass: Record<InputSize, string> = {
  sm: 'py-1.5 px-3 text-[0.8rem]',
  md: 'py-2 px-3.5 text-sm',
  lg: 'py-2.5 px-4 text-base',
};

const iconSizeMap: Record<InputSize, number> = { sm: 14, md: 16, lg: 18 };

const focusRing: Record<InputVariant, string> = {
  primary:
    'focus-within:border-[var(--color-evidence)] focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.25)]',
  secondary:
    'focus-within:border-[#8b93a3] focus-within:shadow-[0_0_0_3px_rgba(139,147,163,0.25)]',
  success:
    'focus-within:border-[var(--color-clean)] focus-within:shadow-[0_0_0_3px_rgba(74,124,89,0.25)]',
  warning:
    'focus-within:border-[var(--color-suspicious)] focus-within:shadow-[0_0_0_3px_rgba(201,138,44,0.25)]',
  error:
    'focus-within:border-[var(--color-malicious)] focus-within:shadow-[0_0_0_3px_rgba(179,69,44,0.25)]',
  info: 'focus-within:border-[#4a90c9] focus-within:shadow-[0_0_0_3px_rgba(74,144,201,0.25)]',
};

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  function CustomInput(
    {
      type = 'text',
      label,
      placeholder,
      hint,
      errorMessage,
      successMessage,
      options = [],
      selectPlaceholder = 'Select',
      variant = 'primary',
      size = 'md',
      fullWidth = true,
      iconLeft,
      iconRight,
      prefix,
      suffix,
      clearable = false,
      disabled = false,
      readOnly = false,
      required = false,
      rows = 4,
      autoComplete = 'off',
      min,
      max,
      minLength,
      maxLength,
      pattern,
      value,
      onValueChange,
      onFocus,
      onBlur,
      onEnter,
      onClear,
      className = '',
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = generatedId;
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const status: InputStatus = errorMessage
      ? 'error'
      : successMessage
        ? 'success'
        : 'default';
    const showClearBtn = clearable && Boolean(value) && !disabled && !readOnly;
    const showPasswordToggle = type === 'password';
    const iconSize = iconSizeMap[size];
    const effectiveType =
      type === 'password' ? (showPassword ? 'text' : 'password') : type;

    function handleChange(
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) {
      onValueChange(e.target.value);
    }

    function handleFocus(
      e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) {
      setIsFocused(true);
      onFocus?.(e);
    }

    function handleBlur(
      e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) {
      setIsFocused(false);
      onBlur?.(e);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') onEnter?.(e);
    }

    const fieldClasses = [
      'relative flex items-center bg-[var(--color-ink-soft)] border rounded-lg overflow-hidden transition-[border-color,box-shadow,background] duration-150',
      fieldSizeClass[size],
      disabled
        ? 'bg-white/5 border-[var(--color-line)] opacity-60 cursor-not-allowed pointer-events-none'
        : readOnly
          ? 'bg-white/5 border-[var(--color-line)]'
          : status === 'success'
            ? 'border-[var(--color-clean)]'
            : status === 'error'
              ? 'border-[var(--color-malicious)]'
              : 'border-[var(--color-line)] hover:border-[#4a5163]',
      !disabled && isFocused ? focusRing[variant] : '',
    ]
      .filter(Boolean)
      .join(' ');

    const inputPad = [
      inputSizeClass[size],
      iconLeft ? '!pl-9' : '',
      iconRight || showClearBtn || showPasswordToggle || suffix ? '!pr-9' : '',
      prefix ? '!pl-2' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const inputBase = `flex-1 min-w-0 w-full bg-transparent border-none outline-none font-body text-[var(--color-paper)] placeholder:text-[var(--color-paper-dim)] ${inputPad}`;

    return (
      <div
        className={`inline-flex flex-col gap-1.5 font-body ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="text-[0.82rem] font-semibold text-[var(--color-paper-dim)] cursor-pointer"
          >
            {label}
            {required && (
              <span className="text-[var(--color-malicious)]"> *</span>
            )}
          </label>
        )}

        <div className={fieldClasses}>
          {prefix && (
            <span className="flex items-center px-2.5 text-[0.82rem] font-medium text-[var(--color-paper-dim)] bg-white/5 border-r border-[var(--color-line)] self-stretch whitespace-nowrap shrink-0">
              {prefix}
            </span>
          )}

          {iconLeft && (
            <span
              className="absolute left-3 flex items-center justify-center text-[var(--color-paper-dim)] pointer-events-none"
              aria-hidden
            >
              {iconLeft}
            </span>
          )}

          {type === 'textarea' ? (
            <textarea
              id={inputId}
              className={`${inputBase} resize-y min-h-25 self-stretch py-2.5`}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              rows={rows}
              minLength={minLength}
              maxLength={maxLength}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-invalid={status === 'error' || undefined}
              aria-describedby={
                hint || errorMessage || successMessage
                  ? `${inputId}-hint`
                  : undefined
              }
            />
          ) : type === 'select' ? (
            <select
              id={inputId}
              className={`${inputBase} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg_xmlns='http://www.w3.org/2000/svg'_width='12'_height='12'_viewBox='0_0_24_24'_fill='none'_stroke='%239aa0ad'_stroke-width='2.5'_stroke-linecap='round'_stroke-linejoin='round'%3E%3Cpath_d='m6_9_6_6_6-6'/%3E%3C/svg%3E")] bg-no-repeat`}
              style={{ backgroundPosition: 'right 0.75em center' }}
              disabled={disabled}
              required={required}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-label={label || undefined}
            >
              <option value="" disabled>
                {selectPlaceholder}
              </option>
              {options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={ref}
              id={inputId}
              type={effectiveType}
              className={inputBase}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              autoComplete={autoComplete}
              min={min}
              max={max}
              minLength={minLength}
              maxLength={maxLength}
              pattern={pattern}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              aria-invalid={status === 'error' || undefined}
              aria-describedby={
                hint || errorMessage || successMessage
                  ? `${inputId}-hint`
                  : undefined
              }
            />
          )}

          {showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 flex items-center justify-center text-[var(--color-paper-dim)] hover:text-[var(--color-paper)] hover:bg-white/10 rounded p-0.5 transition-colors duration-150"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff size={iconSize} />
              ) : (
                <Eye size={iconSize} />
              )}
            </button>
          )}

          {showClearBtn && !showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 flex items-center justify-center text-[var(--color-paper-dim)] hover:text-[var(--color-paper)] hover:bg-white/10 rounded p-0.5 transition-colors duration-150"
              aria-label="Clear field"
              onClick={() => {
                onValueChange('');
                onClear?.();
              }}
            >
              <X size={iconSize} />
            </button>
          )}

          {iconRight && !showPasswordToggle && !showClearBtn && (
            <span
              className="absolute right-3 flex items-center justify-center text-[var(--color-paper-dim)]"
              aria-hidden
            >
              {iconRight}
            </span>
          )}

          {status !== 'default' &&
            !iconRight &&
            !showPasswordToggle &&
            !showClearBtn && (
              <span
                className={`absolute right-3 flex items-center justify-center ${
                  status === 'error'
                    ? 'text-[var(--color-malicious)]'
                    : 'text-[var(--color-clean)]'
                }`}
                aria-hidden
              >
                {status === 'error' ? (
                  <CircleAlert size={iconSize} />
                ) : (
                  <CircleCheck size={iconSize} />
                )}
              </span>
            )}

          {suffix && (
            <span className="flex items-center px-2.5 text-[0.82rem] font-medium text-[var(--color-paper-dim)] bg-white/5 border-l border-[var(--color-line)] self-stretch whitespace-nowrap flex-shrink-0">
              {suffix}
            </span>
          )}
        </div>

        {errorMessage ? (
          <span
            id={`${inputId}-hint`}
            role="alert"
            className="text-xs font-medium text-[var(--color-malicious)]"
          >
            {errorMessage}
          </span>
        ) : successMessage ? (
          <span
            id={`${inputId}-hint`}
            className="text-xs font-medium text-[var(--color-clean)]"
          >
            {successMessage}
          </span>
        ) : hint ? (
          <span
            id={`${inputId}-hint`}
            className="text-xs text-[var(--color-paper-dim)]/70"
          >
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);
