import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type ModalType =
  | 'center'
  | 'drawer-right'
  | 'drawer-left'
  | 'drawer-bottom'
  | 'drawer-top'
  | 'fullscreen';
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type CloseReason = 'backdrop' | 'esc' | 'button' | 'programmatic';

interface CustomModalProps {
  isOpen: boolean;
  onClose: (reason: CloseReason) => void;
  type?: ModalType;
  size?: ModalSize;
  drawerSize?: number | string;
  sheetSize?: number | string;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  persistent?: boolean;
  shakeOnPersist?: boolean;
  lockScroll?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
}

const sizeClass: Record<ModalSize, string> = {
  xs: 'max-w-[320px]',
  sm: 'max-w-[480px]',
  md: 'max-w-[600px]',
  lg: 'max-w-[780px]',
  xl: 'max-w-[980px]',
  fullscreen: 'max-w-full',
};

export function CustomModal({
  isOpen,
  onClose,
  type = 'center',
  size = 'md',
  drawerSize = 480,
  sheetSize = 'auto',
  title,
  subtitle,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  persistent = false,
  shakeOnPersist = true,
  lockScroll = true,
  children,
  footer,
}: CustomModalProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  const [shaking, setShaking] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      if (lockScroll) document.body.style.overflow = 'hidden';
      openTimer.current = setTimeout(() => setVisible(true), 10);
    } else if (mounted) {
      setVisible(false);
      closeTimer.current = setTimeout(() => {
        setMounted(false);
        if (lockScroll) document.body.style.overflow = '';
      }, 300);
    }
    return () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (lockScroll) document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function triggerShake() {
    if (!shakeOnPersist || shaking) return;
    setShaking(true);
    shakeTimer.current = setTimeout(() => setShaking(false), 400);
  }

  function requestClose(reason: CloseReason) {
    if (persistent && (reason === 'backdrop' || reason === 'esc')) {
      triggerShake();
      return;
    }
    onClose(reason);
  }

  useEffect(() => {
    if (!mounted) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (closeOnEsc) requestClose('esc');
      else triggerShake();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, closeOnEsc, persistent]);

  if (!mounted) return null;

  const hasHeader = Boolean(title || showCloseButton);

  const containerPosition: Record<ModalType, string> = {
    center: `fixed top-1/2 left-1/2 rounded-2xl w-[calc(100%-2rem)] max-h-[calc(100vh-4rem)] ${sizeClass[size]} ${
      visible
        ? '-translate-x-1/2 -translate-y-1/2 scale-100 opacity-100'
        : '-translate-x-1/2 -translate-y-1/2 scale-95 opacity-0'
    }`,
    'drawer-right': `fixed top-0 right-0 bottom-0 rounded-l-2xl max-w-full opacity-100 ${
      visible ? 'translate-x-0' : 'translate-x-full'
    }`,
    'drawer-left': `fixed top-0 left-0 bottom-0 rounded-r-2xl max-w-full opacity-100 ${
      visible ? 'translate-x-0' : '-translate-x-full'
    }`,
    'drawer-bottom': `fixed bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh] opacity-100 ${
      visible ? 'translate-y-0' : 'translate-y-full'
    }`,
    'drawer-top': `fixed top-0 left-0 right-0 rounded-b-2xl max-h-[50vh] opacity-100 ${
      visible ? 'translate-y-0' : '-translate-y-full'
    }`,
    fullscreen: `fixed inset-0 rounded-none ${visible ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'}`,
  };

  const drawerSizeStyle =
    type === 'drawer-right' || type === 'drawer-left'
      ? {
          width:
            typeof drawerSize === 'number' ? `${drawerSize}px` : drawerSize,
        }
      : undefined;
  const sheetSizeStyle =
    type === 'drawer-bottom' || type === 'drawer-top'
      ? {
          height:
            sheetSize === 'auto'
              ? 'auto'
              : typeof sheetSize === 'number'
                ? `${sheetSize}px`
                : sheetSize,
        }
      : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-900 transition-colors duration-200 ${
          visible ? 'bg-black/60' : 'bg-black/0'
        }`}
        onClick={() =>
          closeOnBackdrop ? requestClose('backdrop') : triggerShake()
        }
        aria-hidden
      />

      {/* Modal container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        className={[
          'z-[901] bg-[var(--color-ink-soft)] border border-[var(--color-line)] flex flex-col overflow-hidden',
          'shadow-[0_20px_60px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]',
          'transition-[transform,opacity] duration-200',
          containerPosition[type],
          shaking
            ? 'animate-[modal-shake_0.4s_cubic-bezier(0.36,0.07,0.19,0.97)]'
            : '',
        ].join(' ')}
        style={{ ...drawerSizeStyle, ...sheetSizeStyle }}
      >
        {hasHeader && (
          <div className="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-[var(--color-line)] shrink-0">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="m-0 font-display text-base font-bold text-[var(--color-paper)] leading-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 mb-0 text-[0.82rem] text-[var(--color-paper-dim)]">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                aria-label="Close"
                onClick={() => requestClose('button')}
                className="flex items-center justify-center p-1.5 bg-transparent border-none rounded text-[var(--color-paper-dim)] cursor-pointer flex-shrink-0 hover:bg-white/10 hover:text-[var(--color-paper)] transition-colors duration-150"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-[var(--color-line)] flex items-center justify-end gap-3 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
