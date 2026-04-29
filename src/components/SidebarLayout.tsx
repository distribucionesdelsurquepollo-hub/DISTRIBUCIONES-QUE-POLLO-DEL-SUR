"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  Users, 
  Scissors, 
  Banknote, 
  UsersRound, 
  Settings,
  LogOut,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

const SidebarLink = ({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        isActive 
          ? "bg-red-600 text-white shadow-md shadow-red-200" 
          : "text-slate-600 hover:bg-slate-100 hover:text-red-600"
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md text-slate-800"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-4 transition-transform lg:relative lg:translate-x-0 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              D
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight uppercase">Que Pollo</h1>
              <p className="text-[10px] text-slate-500 font-medium">Distribuciones Del Sur</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1">
            <SidebarLink href="/" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsOpen(false)} />
            <SidebarLink href="/inventario" icon={Package} label="Inventario" onClick={() => setIsOpen(false)} />
            <SidebarLink href="/ventas" icon={Tag} label="Ventas" onClick={() => setIsOpen(false)} />
            
            {isAdmin && (
              <>
                <SidebarLink href="/compras" icon={ShoppingCart} label="Compras" onClick={() => setIsOpen(false)} />
                <SidebarLink href="/despresaje" icon={Scissors} label="Despresaje" onClick={() => setIsOpen(false)} />
                <div className="h-px bg-slate-100 my-2" />
                <SidebarLink href="/proveedores" icon={Users} label="Proveedores" onClick={() => setIsOpen(false)} />
                <SidebarLink href="/usuarios" icon={UserCog} label="Usuarios" onClick={() => setIsOpen(false)} />
              </>
            )}

            <SidebarLink href="/caja" icon={Banknote} label="Caja" onClick={() => setIsOpen(false)} />
            
            {isAdmin && (
              <>
                <SidebarLink href="/rrhh" icon={UsersRound} label="Recursos Humanos" onClick={() => setIsOpen(false)} />
                <SidebarLink href="/configuracion" icon={Settings} label="Configuración" onClick={() => setIsOpen(false)} />
              </>
            )}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-slate-900 truncate">{profile?.name}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{profile?.role}</p>
            </div>
            <Button 
              onClick={logout}
              variant="ghost"
              className="flex items-center gap-3 w-full justify-start px-4 py-6 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
