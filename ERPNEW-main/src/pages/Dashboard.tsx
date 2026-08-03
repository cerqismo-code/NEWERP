import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Package,
  Store,
  ArrowUpRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { RevenueChart, DonutChart, SimpleBarChart } from '@/components/charts/Charts';
import type { Order, Product, Inventory, Marketplace, Transaction } from '@/types';

interface DashboardData {
  faturamentoHoje: number;
  faturamentoOntem: number;
  faturamentoMensal: number;
  lucroMensal: number;
  totalPedidos: number;
  ticketMedio: number;
  pedidosHoje: number;
  topProdutos: { name: string; quantity: number; total: number }[];
  estoqueBaixo: (Inventory & { product?: Product })[];
  revenueChart: { date: string; label: string; receita: number; despesa: number }[];
  marketplaceData: { name: string; value: number; color: string }[];
  marketplaceBarData: { label: string; value: number }[];
  recentOrders: (Order & { marketplace?: Marketplace })[];
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const [ordersToday, ordersYesterday, ordersMonth, allOrders, transactions, inventory, topProducts, marketplaces, recentOrdersRaw] =
      await Promise.all([
        supabase.from('orders').select('total, items_count').gte('created_at', todayStr).neq('status', 'cancelado'),
        supabase.from('orders').select('total').gte('created_at', yesterdayStr).lt('created_at', todayStr).neq('status', 'cancelado'),
        supabase.from('orders').select('total, items_count').gte('created_at', monthStartStr).neq('status', 'cancelado'),
        supabase.from('orders').select('total, items_count, marketplace_id, created_at, status').neq('status', 'cancelado'),
        supabase.from('transactions').select('type, amount, date, marketplace_id'),
        supabase.from('inventory').select('*, product:products(*)').lt('quantity', 10),
        supabase.from('order_items').select('product_name, quantity, total').order('quantity', { ascending: false }).limit(50),
        supabase.from('marketplaces').select('*'),
        supabase.from('orders').select('*, marketplace:marketplaces(*)').order('created_at', { ascending: false }).limit(6),
      ]);

    const faturamentoHoje = (ordersToday.data ?? []).reduce((s, o) => s + Number(o.total), 0);
    const faturamentoOntem = (ordersYesterday.data ?? []).reduce((s, o) => s + Number(o.total), 0);
    const faturamentoMensal = (ordersMonth.data ?? []).reduce((s, o) => s + Number(o.total), 0);
    const totalPedidos = (ordersMonth.data ?? []).length;
    const pedidosHoje = (ordersToday.data ?? []).length;
    const ticketMedio = totalPedidos > 0 ? faturamentoMensal / totalPedidos : 0;

    // Calculate profit: receitas - despesas this month
    const monthTransactions = (transactions.data ?? []).filter((t) => t.date >= monthStartStr);
    const receitas = monthTransactions.filter((t) => t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0);
    const despesas = monthTransactions.filter((t) => t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0);
    const lucroMensal = receitas - despesas;

    // Top products
    const productMap = new Map<string, { name: string; quantity: number; total: number }>();
    (topProducts.data ?? []).forEach((item) => {
      const existing = productMap.get(item.product_name) ?? { name: item.product_name, quantity: 0, total: 0 };
      existing.quantity += item.quantity;
      existing.total += Number(item.total);
      productMap.set(item.product_name, existing);
    });
    const topProdutos = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    // Estoque baixo
    const estoqueBaixo = (inventory.data ?? []).sort((a, b) => a.quantity - b.quantity).slice(0, 5);

    // Revenue chart (last 14 days)
    const revenueChart: { date: string; label: string; receita: number; despesa: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const dayReceita = (transactions.data ?? []).filter((t) => t.date === dStr && t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0);
      const dayDespesa = (transactions.data ?? []).filter((t) => t.date === dStr && t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0);
      revenueChart.push({ date: dStr, label, receita: dayReceita, despesa: dayDespesa });
    }

    // Marketplace performance
    const mpMap = new Map<string, number>();
    (allOrders.data ?? []).forEach((o) => {
      if (o.marketplace_id) {
        mpMap.set(o.marketplace_id, (mpMap.get(o.marketplace_id) ?? 0) + Number(o.total));
      }
    });
    const marketplaceData = (marketplaces.data ?? []).map((mp) => ({
      name: mp.name,
      value: mpMap.get(mp.id) ?? 0,
      color: mp.color,
    }));
    const marketplaceBarData = marketplaceData.filter((m) => m.value > 0).map((m) => ({ label: m.name.split(' ')[0], value: m.value }));

    setData({
      faturamentoHoje,
      faturamentoOntem,
      faturamentoMensal,
      lucroMensal,
      totalPedidos,
      ticketMedio,
      pedidosHoje,
      topProdutos,
      estoqueBaixo,
      revenueChart,
      marketplaceData,
      marketplaceBarData,
      recentOrders: recentOrdersRaw.data ?? [],
    });
    setLoading(false);
  }

  if (loading || !data) return <LoadingScreen />;

  const faturamentoTrend = data.faturamentoOntem > 0
    ? ((data.faturamentoHoje - data.faturamentoOntem) / data.faturamentoOntem) * 100
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do desempenho do seu e-commerce em tempo real"
        actions={
          <>
            <button className="btn-secondary">
              <Store size={16} /> Todos os Marketplaces
            </button>
            <button className="btn-primary">
              <ArrowUpRight size={16} /> Exportar Relatório
            </button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Faturamento Hoje"
          value={formatCurrency(data.faturamentoHoje)}
          icon={<DollarSign size={18} />}
          trend={faturamentoTrend}
          trendLabel="vs. ontem"
          accentColor="#10b981"
        />
        <StatCard
          label="Faturamento Mensal"
          value={formatCurrency(data.faturamentoMensal)}
          icon={<TrendingUp size={18} />}
          trendLabel="Mês atual"
          accentColor="#3b82f6"
        />
        <StatCard
          label="Lucro Mensal"
          value={formatCurrency(data.lucroMensal)}
          icon={<Receipt size={18} />}
          trendLabel="Receitas - Despesas"
          accentColor={data.lucroMensal >= 0 ? '#10b981' : '#ef4444'}
        />
        <StatCard
          label="Ticket Médio"
          value={formatCurrency(data.ticketMedio)}
          icon={<ShoppingCart size={18} />}
          trendLabel={`${data.totalPedidos} pedidos no mês`}
          accentColor="#f59e0b"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Pedidos Hoje</p>
              <p className="text-xl font-bold text-white">{data.pedidosHoje}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Estoque Baixo</p>
              <p className="text-xl font-bold text-white">{data.estoqueBaixo.length} produtos</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <Package size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Faturamento Ontem</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.faturamentoOntem)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Faturamento vs. Despesas" subtitle="Últimos 14 dias" />
          <RevenueChart data={data.revenueChart} />
        </Card>
        <Card>
          <CardHeader title="Marketplace Performance" subtitle="Participação no faturamento" />
          <DonutChart data={data.marketplaceData} />
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top products */}
        <Card className="lg:col-span-1">
          <CardHeader title="Produtos Mais Vendidos" subtitle="Por quantidade" />
          <div className="space-y-3">
            {data.topProdutos.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-surface-4 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.quantity} unidades · {formatCurrency(p.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Estoque baixo */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Estoque Baixo"
            subtitle="Produtos abaixo do mínimo"
            action={<Badge color="amber">{data.estoqueBaixo.length} itens</Badge>}
          />
          <div className="space-y-3">
            {data.estoqueBaixo.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.product?.name ?? '—'}</p>
                  <p className="text-xs text-zinc-500">SKU: {item.product?.sku ?? '—'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-red-400">{item.quantity}</p>
                  <p className="text-xs text-zinc-600">mín: {item.min_quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent orders */}
        <Card className="lg:col-span-1">
          <CardHeader title="Pedidos Recentes" subtitle="Últimas movimentações" />
          <div className="space-y-2">
            {data.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-2 py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-zinc-400">{order.number}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-white">{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Marketplace bar chart */}
      <Card>
        <CardHeader title="Faturamento por Marketplace" subtitle="Total acumulado" />
        <SimpleBarChart data={data.marketplaceBarData} />
      </Card>
    </div>
  );
}
