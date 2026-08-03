import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/format';

const axisStyle = { fontSize: 11, fill: '#71717a' };

interface RevenueChartProps {
  data: { date: string; label: string; receita: number; despesa: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} fill="url(#colorReceita)" name="Receita" />
        <Area type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={1.5} fill="url(#colorDespesa)" name="Despesa" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface SimpleAreaChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function SimpleAreaChart({ data, color = '#10b981', height = 200 }: SimpleAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#gradient-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  formatter?: 'currency' | 'number';
}

export function SimpleBarChart({ data, color = '#3b82f6', height = 280, formatter = 'currency' }: BarChartProps) {
  const fmt = formatter === 'currency' ? formatCurrency : formatNumber;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => (formatter === 'currency' ? `R$${(v / 1000).toFixed(0)}k` : formatNumber(v))} />
        <Tooltip formatter={(v) => fmt(Number(v))} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function SimpleLineChart({ data, color = '#3b82f6', height = 200 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
}

export function DonutChart({ data, height = 260 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
