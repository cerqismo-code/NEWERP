import { useEffect, useState } from 'react';
import { Plus, ClipboardCheck, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDateTime, formatDate } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import type { StockCheck, StockCheckItem, Warehouse } from '@/types';

export function Conferencia() {
  const [checks, setChecks] = useState<(StockCheck & { warehouse?: Warehouse })[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<StockCheck | null>(null);
  const [checkItems, setCheckItems] = useState<StockCheckItem[]>([]);

  useEffect(() => {
    fetchChecks();
    fetchWarehouses();
  }, []);

  async function fetchChecks() {
    const { data } = await supabase
      .from('stock_checks')
      .select('*, warehouse:warehouses(*)')
      .order('created_at', { ascending: false });
    setChecks(data ?? []);
    setLoading(false);
  }

  async function fetchWarehouses() {
    const { data } = await supabase.from('warehouses').select('*');
    setWarehouses(data ?? []);
  }

  async function openCheck(check: StockCheck) {
    setSelectedCheck(check);
    const { data } = await supabase
      .from('stock_check_items')
      .select('*')
      .eq('stock_check_id', check.id);
    setCheckItems(data ?? []);
  }

  if (loading) return <LoadingScreen />;

  const inProgress = checks.filter((c) => c.status === 'em_andamento').length;
  const completed = checks.filter((c) => c.status === 'concluido').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conferência de Estoque"
        description="Auditorias e contagens de estoque"
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nova Conferência
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total de Conferências</p>
              <p className="text-xl font-bold text-white">{checks.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Em Andamento</p>
              <p className="text-xl font-bold text-white">{inProgress}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Concluídas</p>
              <p className="text-xl font-bold text-white">{completed}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Histórico de Conferências" subtitle="Todas as auditorias de estoque" />
        {checks.length === 0 ? (
          <EmptyState icon={<ClipboardCheck size={32} />} title="Nenhuma conferência registrada" />
        ) : (
          <Table headers={['Número', 'Armazém', 'Auditor', 'Status', 'Itens', 'Criado em', 'Concluído em']}>
            {checks.map((check) => (
              <TableRow key={check.id} onClick={() => openCheck(check)}>
                <TableCell className="font-mono text-zinc-400">{check.number}</TableCell>
                <TableCell className="text-white">{check.warehouse?.name ?? '—'}</TableCell>
                <TableCell>{check.auditor}</TableCell>
                <TableCell><StatusBadge status={check.status} /></TableCell>
                <TableCell>{check.stock_check_items?.length ?? '—'}</TableCell>
                <TableCell>{formatDateTime(check.created_at)}</TableCell>
                <TableCell>{check.completed_at ? formatDate(check.completed_at) : '—'}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Detail modal */}
      <Modal
        open={!!selectedCheck}
        onClose={() => setSelectedCheck(null)}
        title={`Conferência ${selectedCheck?.number ?? ''}`}
        subtitle={selectedCheck?.warehouse?.name}
        maxWidth="max-w-3xl"
      >
        {checkItems.length > 0 ? (
          <Table headers={['Produto', 'Esperado', 'Contado', 'Diferença']}>
            {checkItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-white">{item.product_name}</TableCell>
                <TableCell>{item.expected_quantity}</TableCell>
                <TableCell>{item.counted_quantity ?? '—'}</TableCell>
                <TableCell>
                  <Badge color={item.difference === 0 ? 'green' : item.difference > 0 ? 'blue' : 'red'}>
                    {item.difference > 0 ? `+${item.difference}` : item.difference}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        ) : (
          <EmptyState title="Nenhum item conferido" />
        )}
      </Modal>

      {/* New check modal */}
      <NewCheckModal
        open={showModal}
        onClose={() => setShowModal(false)}
        warehouses={warehouses}
        onSaved={fetchChecks}
      />
    </div>
  );
}

function NewCheckModal({
  open,
  onClose,
  warehouses,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  onSaved: () => void;
}) {
  const [warehouseId, setWarehouseId] = useState('');
  const [auditor, setAuditor] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!warehouseId || !auditor) return;
    setSaving(true);
    const count = await supabase.from('stock_checks').select('id', { count: 'exact', head: true });
    const num = `CONF-${String((count.count ?? 0) + 1).padStart(5, '0')}`;
    await supabase.from('stock_checks').insert({
      number: num,
      warehouse_id: warehouseId,
      auditor,
      notes: notes || null,
      status: 'em_andamento',
    });
    setSaving(false);
    setWarehouseId('');
    setAuditor('');
    setNotes('');
    onClose();
    onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Conferência de Estoque"
      subtitle="Inicie uma auditoria de estoque"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !warehouseId || !auditor}>
            {saving ? 'Criando...' : 'Iniciar Conferência'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Armazém</label>
          <select className="input-base w-full" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            <option value="">Selecione um armazém</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Auditor Responsável</label>
          <input className="input-base w-full" value={auditor} onChange={(e) => setAuditor(e.target.value)} placeholder="Nome do responsável" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Observações</label>
          <textarea className="input-base w-full" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações sobre a conferência" />
        </div>
      </div>
    </Modal>
  );
}
