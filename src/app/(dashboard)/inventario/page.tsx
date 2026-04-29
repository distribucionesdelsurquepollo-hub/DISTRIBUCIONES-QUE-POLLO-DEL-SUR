"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function InventoryPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Inventario</h1>
          <p className="text-slate-500 text-sm italic">Gestión de existencias y productos.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2 h-auto font-bold uppercase tracking-widest text-xs">
          <Plus size={16} className="mr-2" /> Nuevo Producto
        </Button>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
            />
          </div>
          <Button variant="outline" className="rounded-2xl border-slate-200 text-slate-600 font-bold px-6">
             <Filter size={16} className="mr-2" /> Filtros
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
           <Package size={48} className="mb-4 opacity-20" />
           <p className="font-bold text-sm uppercase tracking-widest">No se encontraron productos</p>
           <p className="text-xs italic mt-1">Empieza agregando uno nuevo.</p>
        </div>
      </div>
    </div>
  );
}
