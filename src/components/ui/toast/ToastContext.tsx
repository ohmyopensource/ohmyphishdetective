import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration: number;
  position: ToastPosition;
  dismissible: boolean;
  action?: ToastAction;
  createdAt: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  position?: ToastPosition;
  dismissible?: boolean;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: Toast[];
  show: (
    message: string,
    variant?: ToastVariant,
    options?: ToastOptions,
  ) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  neutral: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  dismissPosition: (position: ToastPosition) => void;
}

const MAX_PER_POSITION = 5;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (
      message: string,
      variant: ToastVariant = 'neutral',
      options: ToastOptions = {},
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: Toast = {
        id,
        variant,
        message,
        title: options.title,
        duration: options.duration ?? 4000,
        position: options.position ?? 'top-right',
        dismissible: options.dismissible ?? true,
        action: options.action,
        createdAt: Date.now(),
      };

      setToasts((current) => {
        const forPosition = current.filter(
          (t) => t.position === toast.position,
        );
        let next = current;
        if (forPosition.length >= MAX_PER_POSITION) {
          const oldest = forPosition[0];
          next = current.filter((t) => t.id !== oldest.id);
        }
        return [...next, toast];
      });

      if (toast.duration > 0) {
        const timer = setTimeout(() => dismiss(id), toast.duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (m: string, o?: ToastOptions) => show(m, 'success', o),
    [show],
  );
  const error = useCallback(
    (m: string, o?: ToastOptions) => show(m, 'error', { duration: 6000, ...o }),
    [show],
  );
  const warning = useCallback(
    (m: string, o?: ToastOptions) => show(m, 'warning', o),
    [show],
  );
  const info = useCallback(
    (m: string, o?: ToastOptions) => show(m, 'info', o),
    [show],
  );
  const neutral = useCallback(
    (m: string, o?: ToastOptions) => show(m, 'neutral', o),
    [show],
  );

  const dismissAll = useCallback(() => {
    setToasts([]);
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
  }, []);

  const dismissPosition = useCallback((position: ToastPosition) => {
    setToasts((current) => current.filter((t) => t.position !== position));
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      show,
      success,
      error,
      warning,
      info,
      neutral,
      dismiss,
      dismissAll,
      dismissPosition,
    }),
    [
      toasts,
      show,
      success,
      error,
      warning,
      info,
      neutral,
      dismiss,
      dismissAll,
      dismissPosition,
    ],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
