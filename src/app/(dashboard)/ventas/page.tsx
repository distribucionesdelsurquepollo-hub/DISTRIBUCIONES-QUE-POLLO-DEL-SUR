"use client";

import React from 'react';
import { Tag, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Ventas</h1>
          <p className="text-slate-500 text-sm italic">Registro de salidas y facturación.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2 h-auto font-bold uppercase tracking-widest text-xs">
          <Plus size={16} className="mr-2" /> Nueva Venta
        </Button>
      </header>
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
        <Tag size={48} className="mx-auto mb-4 text-slate-200" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Historial de Ventas Vacío</p>
      </div>
    </div>
  );
}
