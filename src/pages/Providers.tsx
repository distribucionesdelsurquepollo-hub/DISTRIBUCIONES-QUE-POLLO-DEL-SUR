import React, { useEffect, useState } from 'react';
import { Provider } from '../types';
import { subscribeToProviders, addProvider } from '../services/purchaseService';
import { 
  Users, 
  Plus, 
  Phone, 
  Building2, 
  Search,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    return subscribeToProviders(setProviders);
  }, []);

  const filtered = providers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-500 text-sm">Gestiona tus contactos comerciales y proveedores habituales.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
        >
          <UserPlus size={18} />
          Nuevo Proveedor
        </button>
      </header>

      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre..."
          className="flex-1 outline-none text-slate-700 bg-transparent"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <motion.div 
            layout
            key={p.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-red-200 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 rounded-xl flex items-center justify-center transition-colors">
                <Building2 size={24} />
              </div>
              <button className="text-slate-300 hover:text-slate-600">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                <Phone size={14} />
                <span>{p.phone || 'Sin teléfono'}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black py-1 px-2 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">Proveedor</span>
              <button className="text-xs font-bold text-red-600 hover:underline">Ver Compras</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <ProviderModal onClose={() => setShowAdd(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function UserPlus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
    </svg>
  );
}

function ProviderModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await addProvider({ name, phone });
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al guardar proveedor');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-900 text-white font-black text-center uppercase tracking-widest">Registrar Proveedor</div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nombre / Razón Social</label>
             <input autoFocus required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Teléfono</label>
             <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95">Guardar Proveedor</button>
        </form>
      </motion.div>
    </div>
  );
}
