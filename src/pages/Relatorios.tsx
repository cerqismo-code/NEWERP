import { useEffect, useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SimpleBarChart, SimpleAreaChart, DonutChart } from '@/components/charts/Charts';
import type { Order, Product, Marketplace, Transaction, Inventory } from '@/types';

export function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [ord, prod, mp, tx, inv] = await Promise.all([
      supabase.from('orders').select('*').neq('status', 'cancelado'),
      supabase.from('products').select('*'),
      supabase.from('marketplaces').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('inventory').select('*'),
    ]);
    setOrders(ord.data ?? []);
    setProducts(prod.data ?? []);
    setMarketplaces(mp.data ?? []);
    setTransactions(tx.data ?? []);
    setInventory(inv.data ?? []);
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;

  // Revenue by day (last 30 days)
  const revenueByDay: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const dayRev = (transactions ?? []).filter((t) => t.date === dStr && t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0);
    revenueByDay.push({ label, value: dayRev });
  }

  // Orders by marketplace
  const mpBarData = marketplaces.map((mp) => ({
    label: mp.name.split(' ')[0],
    value: orders.filter((o) => o.marketplace_id === mp.id).reduce((s, o) => s + Number(o.total), 0),
  }));

  // Revenue vs cost donut
  const totalRevenue = (transactions ?? []).filter((t) => t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0);
  const totalCost = (transactions ?? []).filter((t) => t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0);
  const donutData = [
    { name: 'Receitas', value: totalRevenue, color: '#10b981' },
    { name: 'Despesas', value: totalCost, color: '#ef4444' },
  ];

  // Product margin analysis
  const productMargins = products
    .map((p) => ({
      name: p.name,
      margin: p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0,
    }))
    .sort((a, b) => b.margin - a.margin);

  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + (p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0), 0) / products.length
    : 0;

  const totalStockValue = inventory.reduce((s, i) => {
    const prod = products.find((p) => p.id === i.product_id);
    return s + (prod ? prod.cost_price * i.quantity : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análises e indicadores de desempenho"
        actions={<button className="btn-secondary"><Download size={16} /> Exportar</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Receita Total" value={formatCurrency(totalRevenue)} icon={<BarChart3 size={18} />} accentColor="#10b981" />
        <StatCard label="Despesa Total" value={formatCurrency(totalCost)} icon={<BarChart3 size={18} />} accentColor="#ef4444" />
        <StatCard label="Margem Média" value={`${avgMargin.toFixed(1)}%`} icon={<BarChart3 size={18} />} accentColor="#3b82f6" />
        <StatCard label="Valor em Estoque" value={formatCurrency(totalStockValue)} icon={<BarChart3 size={18} />} accentColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Faturamento Diário" subtitle="Últimos 30 dias" />
          <SimpleAreaChart data={revenueByDay} height={260} />
        </Card>
        <Card>
          <CardHeader title="Receitas vs. Despesas" subtitle="Distribuição financeira" />
          <DonutChart data={donutData} height={260} />
        </Card>
      </div>

      <Card>
        <CardHeader title="Faturamento por Marketplace" subtitle="Comparativo entre canais de venda" />
        <SimpleBarChart data={mpBarData} height={300} />
      </Card>

      <Card>
        <CardHeader title="Análise de Margem por Produto" subtitle="Produtos ordenados por margem de lucro" />
        <div className="space-y-2">
          {productMargins.map((p, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm text-zinc-300 w-48 truncate">{p.name}</span>
              <div className="flex-1 h-2 bg-surface-4 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${p.margin >= 50 ? 'bg-primary-500' : p.margin >= 30 ? 'bg-accent-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(p.margin, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white w-12 text-right">{p.margin.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
