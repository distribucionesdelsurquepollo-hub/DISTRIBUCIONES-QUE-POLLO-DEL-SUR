"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Users, UserPlus, Phone, MapPin, Mail } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'providers'), (snap) => {
      setProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Proveedores</h1>
          <p className="text-slate-500 text-sm italic">Directorio de aliados estratégicos.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2 h-auto font-bold uppercase tracking-widest text-xs">
          <UserPlus size={18} className="mr-2" /> Agregar Proveedor
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(p => (
           <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-red-200 transition-all group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{p.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{p.category || 'Insumos Generales'}</p>
              
              <div className="space-y-2 border-t border-slate-50 pt-4">
                 <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={14} className="text-slate-300" /> {p.phone || 'N/A'}
                 </div>
                 <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={14} className="text-slate-300" /> {p.email || 'N/A'}
                 </div>
              </div>
           </div>
        ))}
        {providers.length === 0 && (
           <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest border-2 border-dashed border-slate-100 rounded-[2.5rem]">
             Directorio Vacío
           </div>
        )}
      </div>
    </div>
  );
}
