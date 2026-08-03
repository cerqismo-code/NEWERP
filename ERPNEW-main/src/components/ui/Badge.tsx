interface BadgeProps {
  children: ReactNode;
  color?: 'gray' | 'green' | 'blue' | 'amber' | 'red' | 'teal';
  className?: string;
}

import { type ReactNode } from 'react';

const colorMap: Record<string, string> = {
  gray: 'bg-white/[0.06] text-zinc-400 border-white/[0.08]',
  green: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  blue: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
}

const statusMap: Record<string, { label: string; color: BadgeProps['color'] }> = {
  // Orders
  pendente: { label: 'Pendente', color: 'amber' },
  pago: { label: 'Pago', color: 'blue' },
  em_separacao: { label: 'Em Separação', color: 'teal' },
  enviado: { label: 'Enviado', color: 'blue' },
  entregue: { label: 'Entregue', color: 'green' },
  cancelado: { label: 'Cancelado', color: 'red' },
  // Purchases
  em_transito: { label: 'Em Trânsito', color: 'blue' },
  recebido: { label: 'Recebido', color: 'green' },
  // Stock checks
  em_andamento: { label: 'Em Andamento', color: 'amber' },
  concluido: { label: 'Concluído', color: 'green' },
  // Generic
  ativo: { label: 'Ativo', color: 'green' },
  inativo: { label: 'Inativo', color: 'gray' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] ?? { label: status, color: 'gray' as const };
  return <Badge color={config.color}>{config.label}</Badge>;
}

export const statusLabels: Record<string, string> = Object.fromEntries(
  Object.entries(statusMap).map(([k, v]) => [k, v.label]),
);
