import { Boxes } from 'lucide-react';
import { navSections } from './navConfig';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
}

export function Sidebar({ currentPage, onNavigate, collapsed }: SidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      } shrink-0 bg-surface-1 border-r border-white/[0.06] flex flex-col transition-all duration-200 hidden lg:flex`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
          <Boxes size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">ERP Commerce</p>
            <p className="text-[10px] text-zinc-500 leading-tight">Multi-Marketplace</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            {!collapsed && (
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-white/[0.06]">
          <div className="bg-surface-3 rounded-xl p-3">
            <p className="text-xs font-medium text-zinc-300">Plano Pro</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Integrações ativas: 5/6</p>
            <div className="mt-2 h-1 bg-surface-4 rounded-full overflow-hidden">
              <div className="h-full w-[83%] bg-primary-500 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
