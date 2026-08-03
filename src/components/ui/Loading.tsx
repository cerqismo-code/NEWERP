import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-zinc-500" />;
}

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <LoadingSpinner size={32} />
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-zinc-600 mb-4">{icon}</div>}
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      {description && <p className="text-xs text-zinc-600 mt-1">{description}</p>}
    </div>
  );
}
