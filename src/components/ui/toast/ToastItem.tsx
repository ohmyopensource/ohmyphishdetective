import { useEffect, useRef, useState } from 'react';
import {
  X,
  CircleCheck,
  CircleX,
  TriangleAlert,
  Info,
  MessageSquare,
} from 'lucide-react';
import type { Toast } from './ToastContext';
import { useToast } from './ToastContext';

const variantIcon: Record<Toast['variant'], React.ReactNode> = {
  success: <CircleCheck size={18} />,
  error: <CircleX size={18} />,
  warning: <TriangleAlert size={18} />,
  info: <Info size={18} />,
  neutral: <MessageSquare size={18} />,
};

const variantClass: Record<Toast['variant'], string> = {
  success:
    'bg-gradient-to-br from-[var(--color-clean-bg)] to-[var(--color-ink-soft)] border-[var(--color-clean)] text-[var(--color-clean)]',
  error:
    'bg-gradient-to-br from-[var(--color-malicious-bg)] to-[var(--color-ink-soft)] border-[var(--color-malicious)] text-[var(--color-malicious)]',
  warning:
    'bg-gradient-to-br from-[var(--color-suspicious-bg)] to-[var(--color-ink-soft)] border-[var(--color-suspicious)] text-[var(--color-suspicious)]',
  info: 'bg-gradient-to-br from-[#122733] to-[var(--color-ink-soft)] border-[#4a90c9] text-[#4a90c9]',
  neutral:
    'bg-[var(--color-ink-soft)] border-[var(--color-line)] text-[var(--color-paper)]',
};

const progressBarClass: Record<Toast['variant'], string> = {
  success: 'bg-[var(--color-clean)]',
  error: 'bg-[var(--color-malicious)]',
  warning: 'bg-[var(--color-suspicious)]',
  info: 'bg-[#4a90c9]',
  neutral: 'bg-[var(--color-paper-dim)]',
};

export function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragOpacity, setDragOpacity] = useState(1);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const isPaused = useRef(false);
  const startTime = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (toast.duration <= 0) return;
    startTime.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (isPaused.current) return;
      const elapsed = Date.now() - startTime.current;
      const next = 100 - (elapsed / toast.duration) * 100;
      setProgress(Math.max(0, next));
      if (next <= 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 30);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [toast.duration]);

  function animateOut(direction: 'left' | 'right' | 'default' = 'default') {
    setVisible(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (direction !== 'default') {
      setDragOffset(direction === 'right' ? 300 : -300);
      setDragOpacity(0);
    }
    setTimeout(() => dismiss(toast.id), 300);
  }

  function handleMouseEnter() {
    isPaused.current = true;
  }

  function handleMouseLeave() {
    isPaused.current = false;
    startTime.current = Date.now() - ((100 - progress) / 100) * toast.duration;
    if (isDragging.current) handleDragEnd();
  }

  function getClientX(e: React.MouseEvent | React.TouchEvent) {
    return 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  function handleDragStart(e: React.MouseEvent | React.TouchEvent) {
    isDragging.current = true;
    dragStartX.current = getClientX(e);
  }

  function handleDragMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDragging.current) return;
    const offset = getClientX(e) - dragStartX.current;
    setDragOffset(offset);
    setDragOpacity(Math.max(0, 1 - Math.abs(offset) / 150));
  }

  function handleDragEnd() {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (Math.abs(dragOffset) > 80) {
      animateOut(dragOffset > 0 ? 'right' : 'left');
    } else {
      setDragOffset(0);
      setDragOpacity(1);
    }
  }

  const dragStyle =
    dragOffset !== 0
      ? {
          transform: `translateX(${dragOffset}px)`,
          opacity: dragOpacity,
          transition: 'none',
        }
      : undefined;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'relative flex items-start gap-2.5 pt-3.5 px-4 pb-5 rounded-xl border shadow-[0_4px_20px_rgba(0,0,0,0.3),0_1px_6px_rgba(0,0,0,0.15)]',
        'min-w-70 max-w-95 w-full overflow-hidden cursor-grab select-none font-body',
        'transition-[opacity,transform,box-shadow] duration-250',
        visible
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 translate-x-6 scale-[0.97]',
        variantClass[toast.variant],
      ].join(' ')}
      style={dragStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <span className="flex items-center shrink-0 mt-0.5" aria-hidden>
        {variantIcon[toast.variant]}
      </span>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {toast.title && (
          <span className="text-sm font-bold leading-tight">{toast.title}</span>
        )}
        <span className="text-[0.82rem] leading-snug text-[var(--color-paper-dim)]">
          {toast.message}
        </span>
        {toast.action && (
          <button
            type="button"
            className="mt-1.5 self-start bg-transparent border-none cursor-pointer font-body text-xs font-bold underline underline-offset-2 opacity-85 hover:opacity-100 transition-opacity duration-150"
            onClick={() => {
              toast.action?.onClick();
              animateOut();
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.dismissible && (
        <button
          type="button"
          aria-label="Close notification"
          className="flex items-center justify-center p-0.5 bg-transparent border-none rounded cursor-pointer opacity-50 hover:opacity-100 hover:bg-black/10 transition-[opacity,background] duration-150 shrink-0"
          onClick={() => animateOut()}
        >
          <X size={14} />
        </button>
      )}

      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-black/20 overflow-hidden rounded-b-xl">
          <div
            className={`h-full rounded-inherit transition-[width] duration-30 ease-linear ${progressBarClass[toast.variant]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
