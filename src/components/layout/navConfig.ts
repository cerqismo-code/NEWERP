import {
  LayoutDashboard,
  Package,
  Warehouse,
  ClipboardCheck,
  ShoppingCart,
  Truck,
  Wallet,
  BarChart3,
  Users,
  Settings,
  Boxes,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  page: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: 'Visão Geral',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' }],
  },
  {
    label: 'Operação',
    items: [
      { label: 'Produtos', icon: Package, page: 'produtos' },
      { label: 'Estoque', icon: Warehouse, page: 'estoque' },
      { label: 'Conferência de Estoque', icon: ClipboardCheck, page: 'conferencia' },
      { label: 'Pedidos', icon: ShoppingCart, page: 'pedidos' },
      { label: 'Compras', icon: Truck, page: 'compras' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { label: 'Financeiro', icon: Wallet, page: 'financeiro' },
      { label: 'Relatórios', icon: BarChart3, page: 'relatorios' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Usuários', icon: Users, page: 'usuarios' },
      { label: 'Configurações', icon: Settings, page: 'configuracoes' },
    ],
  },
];

export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items);
