import { Menu, Search, Bell } from 'lucide-react';
import { allNavItems } from './navConfig';

interface TopbarProps {
  currentPage: string;
  onToggleSidebar: () => void;
}

export function Topbar({ currentPage, onToggleSidebar }: TopbarProps) {
  const navItem = allNavItems.find((n) => n.page === currentPage);
  const pageTitle = navItem?.label ?? 'Dashboard';

  return (
    <header className="h-16 border-b border-white/[0.06] bg-surface-1/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="text-zinc-400 hover:text-white transition-colors p-2 -ml-2"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-white">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <div className="hidden md:flex items-center relative">
          <Search size={16} className="absolute left-3 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            className="input-base pl-9 w-48 lg:w-64"
          />
        </div>

        <button className="relative text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/[0.06]">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-white/[0.06]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
            AS
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-white leading-tight">Admin Sistema</p>
            <p className="text-[10px] text-zinc-500 leading-tight">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
