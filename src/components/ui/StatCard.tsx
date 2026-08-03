import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  accentColor?: string;
}

export function StatCard({ label, value, icon, trend, trendLabel, accentColor = '#10b981' }: StatCardProps) {
  const showTrend = trend !== undefined;
  const isPositive = trend !== undefined && trend > 0;
  const isNeutral = trend === 0;

  return (
    <Card hover className="animate-slide-in">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          {icon}
        </div>
        {showTrend && (
          <div
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isNeutral
                ? 'bg-white/[0.06] text-zinc-400'
                : isPositive
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'bg-red-500/10 text-red-400'
            }`}
          >
            {isNeutral ? <Minus size={12} /> : isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isNeutral ? '0%' : `${isPositive ? '+' : ''}${trend.toFixed(1)}%`}
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      {trendLabel && <p className="text-xs text-zinc-600 mt-1">{trendLabel}</p>}
    </Card>
  );
}
