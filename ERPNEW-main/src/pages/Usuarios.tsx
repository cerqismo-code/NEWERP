import { useEffect, useState } from 'react';
import { Plus, Edit2, Mail, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { Users as UsersIcon } from 'lucide-react';
import type { SystemUser } from '@/types';

const roleLabels: Record<string, string> = {
  administrador: 'Administrador',
  gerente: 'Gerente',
  operador: 'Operador',
  financeiro: 'Financeiro',
  visualizador: 'Visualizador',
};

const roleColors: Record<string, 'green' | 'blue' | 'teal' | 'amber' | 'gray'> = {
  administrador: 'green',
  gerente: 'blue',
  operador: 'teal',
  financeiro: 'amber',
  visualizador: 'gray',
};

const rolePermissions: Record<string, string[]> = {
  administrador: ['Acesso total ao sistema', 'Gerenciar usuários', 'Configurações do sistema'],
  gerente: ['Visualizar e editar todas as operações', 'Relatórios', 'Financeiro'],
  operador: ['Produtos', 'Estoque', 'Pedidos', 'Conferência'],
  financeiro: ['Financeiro', 'Relatórios', 'Compras'],
  visualizador: ['Visualizar relatórios', 'Dashboard'],
};

export function Usuarios() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('system_users').select('*').order('name');
    setUsers(data ?? []);
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;

  const active = users.filter((u) => u.status === 'ativo').length;
  const admins = users.filter((u) => u.role === 'administrador').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Gerencie usuários e permissões do sistema"
        actions={
          <button className="btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
            <Plus size={16} /> Novo Usuário
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total de Usuários" value={`${users.length}`} icon={<UsersIcon size={18} />} accentColor="#3b82f6" />
        <StatCard label="Usuários Ativos" value={`${active}`} icon={<UsersIcon size={18} />} accentColor="#10b981" />
        <StatCard label="Administradores" value={`${admins}`} icon={<UsersIcon size={18} />} accentColor="#f59e0b" />
      </div>

      <Card>
        {users.length === 0 ? (
          <EmptyState icon={<UsersIcon size={32} />} title="Nenhum usuário cadastrado" />
        ) : (
          <Table headers={['Usuário', 'E-mail', 'Função', 'Permissões', 'Status', 'Último Acesso', '']}>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <span className="font-medium text-white">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-zinc-400">
                    <Mail size={13} /> {user.email}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge color={roleColors[user.role]}>{roleLabels[user.role] ?? user.role}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-zinc-500">{rolePermissions[user.role]?.length ?? 0} permissões</span>
                </TableCell>
                <TableCell><StatusBadge status={user.status} /></TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-zinc-500">
                    <Clock size={13} /> {user.last_access ? formatRelativeTime(user.last_access) : 'Nunca'}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                    onClick={() => { setEditingUser(user); setShowModal(true); }}
                  >
                    <Edit2 size={15} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Permissions reference */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Permissões por Função</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(rolePermissions).map(([role, perms]) => (
            <div key={role} className="bg-surface-3 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge color={roleColors[role]}>{roleLabels[role]}</Badge>
              </div>
              <ul className="space-y-1.5">
                {perms.map((p, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-600" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <UserModal
        open={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
        onSaved={fetchUsers}
      />
    </div>
  );
}

function UserModal({
  open,
  onClose,
  user,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', role: 'operador', status: 'ativo' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    } else {
      setForm({ name: '', email: '', role: 'operador', status: 'ativo' });
    }
  }, [user, open]);

  async function handleSave() {
    setSaving(true);
    if (user) {
      await supabase.from('system_users').update(form).eq('id', user.id);
    } else {
      await supabase.from('system_users').insert({ ...form, last_access: null });
    }
    setSaving(false);
    onClose();
    onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Editar Usuário' : 'Novo Usuário'}
      subtitle="Defina dados e permissões"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.email}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Nome</label>
          <input className="input-base w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">E-mail</label>
          <input className="input-base w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Função</label>
            <select className="input-base w-full" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Status</label>
            <select className="input-base w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
