import { useToast } from './ToastContext';
import { ToastItem } from './ToastItem';
import type { ToastPosition } from './ToastContext';

const positions: ToastPosition[] = [
  'top-right',
  'top-left',
  'top-center',
  'bottom-right',
  'bottom-left',
  'bottom-center',
];

const positionClass: Record<ToastPosition, string> = {
  'top-right': 'top-0 right-0 items-end',
  'top-left': 'top-0 left-0 items-start',
  'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-0 right-0 items-end flex-col-reverse',
  'bottom-left': 'bottom-0 left-0 items-start flex-col-reverse',
  'bottom-center':
    'bottom-0 left-1/2 -translate-x-1/2 items-center flex-col-reverse',
};

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <>
      {positions.map((position) => {
        const positionToasts = toasts.filter((t) => t.position === position);
        if (positionToasts.length === 0) return null;

        return (
          <div
            key={position}
            className={`fixed z-1100 flex flex-col gap-2.5 p-4 pointer-events-none *:pointer-events-auto ${positionClass[position]}`}
            aria-label={`Notifications ${position}`}
          >
            {positionToasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} />
            ))}
          </div>
        );
      })}
    </>
  );
}
