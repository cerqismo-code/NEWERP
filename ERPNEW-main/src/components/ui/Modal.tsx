import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-surface-2 border border-white/[0.08] rounded-2xl shadow-2xl animate-scale-in`}>
        <div className="flex items-start justify-between p-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06]">{footer}</div>}
      </div>
    </div>
  );
}
