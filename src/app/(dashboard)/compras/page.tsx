"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ShoppingCart, Plus, Building2, Package } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'purchases'), (snap) => {
      setPurchases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compras</h1>
          <p className="text-slate-500 text-sm italic">Gestión de facturas de proveedores y reposición de stock.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2 h-auto font-bold uppercase tracking-widest text-xs">
          <Package size={18} className="mr-2" /> Nueva Compra
        </Button>
      </header>

      <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center shadow-sm">
        <ShoppingCart size={48} className="mx-auto mb-6 text-slate-100" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Registro de Compras Vacío</p>
        <p className="text-[10px] text-slate-300 italic tracking-widest">Sincronizado con base de datos en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
           <Building2 size={24} className="text-slate-300 mb-4" />
           <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Control Proveedores</h3>
           <p className="text-xs text-slate-500 mt-2">Gestiona tus proveedores frecuentes y plazos de pago (abonos).</p>
         </div>
      </div>
    </div>
  );
}
