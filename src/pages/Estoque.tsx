import { useEffect, useState } from 'react';
import { Warehouse, AlertTriangle, Boxes, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatNumber } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import type { Inventory, Warehouse as WarehouseType, Product } from '@/types';

export function Estoque() {
  const [inventory, setInventory] = useState<(Inventory & { product?: Product; warehouse?: WarehouseType })[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
  }, []);

  async function fetchInventory() {
    const { data } = await supabase
      .from('inventory')
      .select('*, product:products(*), warehouse:warehouses(*)')
      .order('quantity');
    setInventory(data ?? []);
    setLoading(false);
  }

  async function fetchWarehouses() {
    const { data } = await supabase.from('warehouses').select('*');
    setWarehouses(data ?? []);
  }

  if (loading) return <LoadingScreen />;

  const filtered = warehouseFilter === 'all'
    ? inventory
    : inventory.filter((i) => i.warehouse_id === warehouseFilter);

  const totalUnits = inventory.reduce((s, i) => s + i.quantity, 0);
  const lowStock = inventory.filter((i) => i.quantity < i.min_quantity).length;
  const outOfStock = inventory.filter((i) => i.quantity === 0).length;

  // Aggregate by product
  const productMap = new Map<string, { product: Product; total: number; locations: { warehouse: string; qty: number; min: number }[] }>();
  inventory.forEach((item) => {
    if (!item.product) return;
    const existing = productMap.get(item.product.id) ?? { product: item.product, total: 0, locations: [] };
    existing.total += item.quantity;
    existing.locations.push({
      warehouse: item.warehouse?.name ?? '—',
      qty: item.quantity,
      min: item.min_quantity,
    });
    productMap.set(item.product.id, existing);
  });
  const aggregated = Array.from(productMap.values()).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Controle de estoque por armazém e produto"
        actions={
          <select className="input-base" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <option value="all">Todos os armazéns</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total em Estoque" value={formatNumber(totalUnits)} icon={<Boxes size={18} />} accentColor="#3b82f6" />
        <StatCard label="Estoque Baixo" value={`${lowStock} produtos`} icon={<AlertTriangle size={18} />} accentColor="#f59e0b" />
        <StatCard label="Sem Estoque" value={`${outOfStock} produtos`} icon={<TrendingDown size={18} />} accentColor="#ef4444" />
      </div>

      <Card>
        <CardHeader title="Estoque por Produto" subtitle="Visão consolidada por armazém" />
        {aggregated.length === 0 ? (
          <EmptyState icon={<Warehouse size={32} />} title="Nenhum item em estoque" />
        ) : (
          <Table headers={['Produto', 'SKU', 'Total', 'Localizações', 'Situação']}>
            {aggregated.map(({ product, total, locations }) => {
              const minTotal = locations.reduce((s, l) => s + l.min, 0);
              const isLow = total < minTotal;
              const isOut = total === 0;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <span className="font-medium text-white">{product.name}</span>
                  </TableCell>
                  <TableCell className="font-mono text-zinc-400">{product.sku}</TableCell>
                  <TableCell className="font-semibold text-white">{formatNumber(total)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {locations.map((l, i) => (
                        <span key={i} className="text-xs bg-surface-4 text-zinc-400 px-2 py-1 rounded-md">
                          {l.warehouse}: {l.qty}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOut ? <Badge color="red">Sem Estoque</Badge>
                      : isLow ? <Badge color="amber">Estoque Baixo</Badge>
                      : <Badge color="green">Normal</Badge>}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
