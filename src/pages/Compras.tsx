import { useEffect, useState } from 'react';
import { Truck, Plus, Eye, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge, statusLabels } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import type { Purchase, PurchaseItem, Supplier } from '@/types';

export function Compras() {
  const [purchases, setPurchases] = useState<(Purchase & { supplier?: Supplier })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    fetchPurchases();
  }, []);

  async function fetchPurchases() {
    const { data } = await supabase
      .from('purchases')
      .select('*, supplier:suppliers(*)')
      .order('created_at', { ascending: false });
    setPurchases(data ?? []);
    setLoading(false);
  }

  async function openPurchase(purchase: Purchase) {
    setSelectedPurchase(purchase);
    const { data } = await supabase
      .from('purchase_items')
      .select('*')
      .eq('purchase_id', purchase.id);
    setPurchaseItems(data ?? []);
  }

  if (loading) return <LoadingScreen />;

  const filtered = purchases.filter((p) => {
    const matchesSearch =
      p.number.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = purchases.filter((p) => p.status !== 'cancelado').reduce((s, p) => s + Number(p.total), 0);
  const pending = purchases.filter((p) => p.status === 'pendente').length;
  const received = purchases.filter((p) => p.status === 'recebido').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras"
        description="Ordens de compra e fornecedores"
        actions={<button className="btn-primary"><Plus size={16} /> Nova Compra</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Comprado" value={formatCurrency(totalValue)} icon={<Truck size={18} />} accentColor="#3b82f6" />
        <StatCard label="Pendentes" value={`${pending} ordens`} icon={<Truck size={18} />} accentColor="#f59e0b" />
        <StatCard label="Recebidas" value={`${received} ordens`} icon={<Truck size={18} />} accentColor="#10b981" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input className="input-base pl-9 w-full" placeholder="Buscar por número ou fornecedor..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-base" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos os status</option>
            {Object.entries(statusLabels).filter(([k]) => ['pendente','em_transito','recebido','cancelado'].includes(k)).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Truck size={32} />} title="Nenhuma ordem de compra encontrada" />
        ) : (
          <Table headers={['Número', 'Fornecedor', 'Itens', 'Total', 'Status', 'Chegada Prev.', 'Criado em', '']}>
            {filtered.map((purchase) => (
              <TableRow key={purchase.id} onClick={() => openPurchase(purchase)}>
                <TableCell className="font-mono text-zinc-400">{purchase.number}</TableCell>
                <TableCell className="text-white">{purchase.supplier?.name ?? '—'}</TableCell>
                <TableCell>{purchase.items_count}</TableCell>
                <TableCell className="font-medium text-white">{formatCurrency(Number(purchase.total))}</TableCell>
                <TableCell><StatusBadge status={purchase.status} /></TableCell>
                <TableCell className="text-zinc-500">{purchase.expected_date ? formatDate(purchase.expected_date) : '—'}</TableCell>
                <TableCell className="text-zinc-500">{formatDateTime(purchase.created_at)}</TableCell>
                <TableCell>
                  <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors">
                    <Eye size={15} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        title={`Ordem de Compra ${selectedPurchase?.number ?? ''}`}
        subtitle={selectedPurchase?.supplier?.name}
        maxWidth="max-w-2xl"
      >
        {selectedPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Status</p>
                <StatusBadge status={selectedPurchase.status} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Chegada Prevista</p>
                <p className="text-sm text-white">{selectedPurchase.expected_date ? formatDate(selectedPurchase.expected_date) : '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-2">Itens da Compra</p>
              {purchaseItems.length > 0 ? (
                <Table headers={['Produto', 'Qtd', 'Custo Unit.', 'Total']}>
                  {purchaseItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-white">{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(Number(item.unit_cost))}</TableCell>
                      <TableCell className="font-medium text-white">{formatCurrency(Number(item.total))}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              ) : <EmptyState title="Nenhum item" />}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
              <span className="text-sm text-zinc-400">Total da Compra</span>
              <span className="text-lg font-bold text-white">{formatCurrency(Number(selectedPurchase.total))}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
