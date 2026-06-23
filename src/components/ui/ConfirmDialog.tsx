import { AlertTriangle, Loader2, XCircle } from 'lucide-react';
import { Button } from './button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const Icon = variant === 'danger' ? XCircle : AlertTriangle;
  const iconClass = variant === 'danger' ? 'text-red-500' : 'text-amber-500';
  const confirmClass =
    variant === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-amber-500 text-white hover:bg-amber-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-[28px] bg-white shadow-2xl p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
            <Icon size={24} className={iconClass} />
          </div>
          <div>
            <h3 className="text-lg font-black italic text-climbe-secondary leading-tight">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1 font-light">{description}</p>
            )}
          </div>
        </div>

        {children && (
          <div className="bg-gray-50 rounded-2xl p-4 text-sm">
            {children}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 font-bold"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 font-black italic rounded-xl ${confirmClass}`}
          >
            {isLoading ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Aguarde...</>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
