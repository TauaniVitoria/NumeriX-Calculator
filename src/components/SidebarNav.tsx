import { useState } from 'react';
import { Calculator, Grid3X3, TrendingUp, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'roots', label: 'Raízes de Funções', icon: Calculator },
  { id: 'linear', label: 'Sistemas Lineares', icon: Grid3X3 },
  { id: 'curve', label: 'Ajuste de Curvas', icon: TrendingUp },
] as const;

export type Section = typeof navItems[number]['id'];

interface SidebarNavProps {
  active: Section;
  onSelect: (s: Section) => void;
}

export default function SidebarNav({ active, onSelect }: SidebarNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden bg-sidebar text-sidebar-foreground p-2 rounded-lg shadow-lg"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Calculator className="text-sidebar-primary" size={22} />
            <span>Numerix Calculator</span>
          </h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Calculadora de métodos numéricos</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
                )}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
          Desenvolvido com React + TypeScript
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-foreground/40 md:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
